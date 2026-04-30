import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware";
import {
  getMetricsOverview,
  getRetentionCohorts,
  getTransactionTrend,
} from "./metrics.service";

function queryInt(value: unknown, fallback: number): number {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export async function getMetricsOverviewController(
  _req: AuthRequest,
  res: Response
): Promise<void> {
  const overview = await getMetricsOverview();
  res.status(200).json({ success: true, data: { overview } });
}

export async function getMetricsTransactionsController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const days = queryInt(req.query.days, 30);
  const trend = await getTransactionTrend(days);
  res.status(200).json({ success: true, data: { trend, days } });
}

export async function getMetricsRetentionController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const weeks = queryInt(req.query.weeks, 8);
  const cohorts = await getRetentionCohorts(weeks);
  res.status(200).json({ success: true, data: { cohorts, weeks } });
}
