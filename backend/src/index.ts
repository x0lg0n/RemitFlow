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

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001", 10);

// ─── Global Middleware ──────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);

// ─── Module Routes ─────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/rates", ratesRoutes);
app.use("/transactions", transactionsRoutes);
app.use("/anchors", anchorsRoutes);

// ─── Health Check ───────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Error Handler (must be last) ───────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ───────────────────────────────────────────────────────
async function start() {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected");
  } catch (err) {
    console.error("PostgreSQL connection failed:", (err as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`RemitFlow API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

start();
