import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import * as fs from "fs";
import * as path from "path";
import { rateLimiter } from "./shared/middleware/rateLimit.middleware";
import { requestLoggerMiddleware } from "./shared/middleware/request-logger.middleware";
import { errorMiddleware } from "./shared/middleware/error.middleware";
import { pool } from "./shared/config/database";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { redis } from "./shared/config/redis";
import { logger } from "./shared/logger";

import authRoutes from "./modules/auth/auth.routes";
import ratesRoutes from "./modules/rates/rates.routes";
import transactionsRoutes from "./modules/transactions/transactions.routes";
import anchorsRoutes from "./modules/anchors/anchors.routes";
import callbacksRoutes from "./modules/callbacks/callbacks.routes";
import adminRoutes from "./modules/admin/admin.routes";
import recurringRoutes from "./modules/recurring/recurring.routes";
import metricsRoutes from "./modules/metrics/metrics.routes";
import indexingRoutes from "./modules/indexing/indexing.routes";
import { startSep31LifecycleSyncWorker } from "./modules/transactions/sep31-lifecycle-sync.service";
import { ensureSep31ExecutionTrackingSchema } from "./modules/transactions/transaction.service";
import { startRecurringSendWorker } from "./modules/recurring/recurring.service";
import { startIndexingWorker } from "./modules/indexing/indexing.service";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001", 10);

// ─── Global Middleware ──────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(requestLoggerMiddleware);
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  }),
);
app.use(rateLimiter);

// ─── Module Routes ─────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/rates", ratesRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/anchors", anchorsRoutes);
app.use("/recurring-sends", recurringRoutes);
app.use("/admin", adminRoutes);
app.use("/metrics", metricsRoutes);
app.use("/indexing", indexingRoutes);
app.use("/", callbacksRoutes);

// ─── Public Route (no auth) ─────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the Volara API", version: "1.0.0" });
});

// ─── Health Check ───────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 Handler ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ─── Error Handler (must be last) ───────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ───────────────────────────────────────────────────────
async function runMigrations(): Promise<void> {
  logger.info("db_migrations_start");

  const migrationsDir = path.join(__dirname, "../..", "database", "migrations");

  if (!fs.existsSync(migrationsDir)) {
    logger.warn("db_migrations_dir_not_found", { migrationsDir });
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f: string) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    logger.info("db_migrations_no_files");
    return;
  }

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");

    try {
      await pool.query(sql);
      logger.info("db_migration_applied", { file });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      // Ignore duplicate table/constraint errors (migrations may run multiple times in dev)
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        logger.info("db_migration_skipped", { file, reason: "already_applied" });
      } else {
        logger.error("db_migration_failed", { file, error: msg });
      }
    }
  }

  logger.info("db_migrations_done");
}

async function start() {
  let sep31SyncTimer: NodeJS.Timeout | null = null;
  let recurringWorkerTimer: NodeJS.Timeout | null = null;
  let indexingWorkerTimer: NodeJS.Timeout | null = null;
  let dbConnected = false;

  try {
    await pool.query("SELECT NOW()");
    logger.info("postgres_connected");
    dbConnected = true;

    // Run migrations
    await runMigrations();
  } catch (err) {
    logger.withError("postgres_connection_failed", err);
  }

  app.listen(PORT, () => {
    logger.info("api_server_started", {
      service: "volara-backend",
      port: PORT,
      healthUrl: `http://localhost:${PORT}/health`,
    });

    if (!dbConnected) {
      logger.warn("workers_not_started_db_unavailable");
      return;
    }

    ensureSep31ExecutionTrackingSchema()
      .then(() => {
        sep31SyncTimer = startSep31LifecycleSyncWorker();
        logger.info("sep31_lifecycle_worker_started");
        recurringWorkerTimer = startRecurringSendWorker();
        logger.info("recurring_worker_started");
        indexingWorkerTimer = startIndexingWorker();
        logger.info("indexing_worker_started");
      })
      .catch((error) => {
        logger.withError("workers_not_started_schema_setup_failed", error);
      });
  });

  const shutdown = () => {
    if (sep31SyncTimer) {
      clearInterval(sep31SyncTimer);
      sep31SyncTimer = null;
    }
    if (recurringWorkerTimer) {
      clearInterval(recurringWorkerTimer);
      recurringWorkerTimer = null;
    }
    if (indexingWorkerTimer) {
      clearInterval(indexingWorkerTimer);
      indexingWorkerTimer = null;
    }
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

start();
