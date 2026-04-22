import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimiter } from "./shared/middleware/rateLimit.middleware";
import { errorMiddleware } from "./shared/middleware/error.middleware";
import { pool } from "./shared/config/database";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { redis } from "./shared/config/redis";

import authRoutes from "./modules/auth/auth.routes";
import ratesRoutes from "./modules/rates/rates.routes";
import transactionsRoutes from "./modules/transactions/transactions.routes";
import anchorsRoutes from "./modules/anchors/anchors.routes";
import callbacksRoutes from "./modules/callbacks/callbacks.routes";
import { startSep31LifecycleSyncWorker } from "./modules/transactions/sep31-lifecycle-sync.service";
import { ensureSep31ExecutionTrackingSchema } from "./modules/transactions/transaction.service";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001", 10);

// ─── Global Middleware ──────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
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
app.use("/", callbacksRoutes);

// ─── Public Route (no auth) ─────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to the RemitFlow API", version: "1.0.0" });
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
async function start() {
  let sep31SyncTimer: NodeJS.Timeout | null = null;
  let dbConnected = false;

  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected");
    dbConnected = true;
  } catch (err) {
    console.error("PostgreSQL connection failed:", (err as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`RemitFlow API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);

    if (!dbConnected) {
      console.warn(
        "SEP-31 lifecycle sync worker not started because PostgreSQL is unavailable",
      );
      return;
    }

    ensureSep31ExecutionTrackingSchema()
      .then(() => {
        sep31SyncTimer = startSep31LifecycleSyncWorker();
        console.log("SEP-31 lifecycle sync worker started");
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `SEP-31 lifecycle sync worker not started because schema setup failed: ${message}`,
        );
      });
  });

  const shutdown = () => {
    if (sep31SyncTimer) {
      clearInterval(sep31SyncTimer);
      sep31SyncTimer = null;
    }
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

start();
