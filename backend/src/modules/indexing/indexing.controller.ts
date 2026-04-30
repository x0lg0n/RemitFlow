import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware";
import {
  getIndexingSummary,
  getRecentReconciliations,
  runIndexingBatch,
} from "./indexing.service";

function queryInt(value: unknown, fallback: number): number {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export async function getIndexingSummaryController(
  _req: AuthRequest,
  res: Response
): Promise<void> {
  const summary = await getIndexingSummary();
  res.status(200).json({ success: true, data: { summary } });
}

export async function getRecentReconciliationsController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const limit = queryInt(req.query.limit, 25);
  const rows = await getRecentReconciliations(limit);
  res.status(200).json({ success: true, data: { rows, limit } });
}

export async function runIndexingNowController(
  _req: AuthRequest,
  res: Response
): Promise<void> {
  const result = await runIndexingBatch(200);
  res.status(200).json({ success: true, data: { result } });
}
