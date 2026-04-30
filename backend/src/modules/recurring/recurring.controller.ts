import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware";
import {
  cancelRecurringSendPlan,
  confirmRecurringSendRun,
  createRecurringSendPlan,
  listPendingRecurringRuns,
  listRecurringSendPlans,
  pauseRecurringSendPlan,
  RecurringError,
  resumeRecurringSendPlan,
  updateRecurringSendPlan,
} from "./recurring.service";

function getRequiredUserId(req: AuthRequest): string {
  if (!req.walletAddress) {
    throw new RecurringError(401, "UNAUTHORIZED", "Authentication required");
  }
  return req.walletAddress;
}

function getRouteParam(value: string | string[] | undefined, field: string): string {
  if (!value || Array.isArray(value)) {
    throw new RecurringError(400, "BAD_REQUEST", `Invalid ${field}`);
  }

  return value;
}

export async function createRecurringSend(req: AuthRequest, res: Response): Promise<void> {
  const userId = getRequiredUserId(req);

  const plan = await createRecurringSendPlan({
    userId,
    anchorId: req.body.anchorId,
    amount: req.body.amount,
    fromCurrency: req.body.fromCurrency,
    toCurrency: req.body.toCurrency,
    destinationCountry: req.body.destinationCountry,
    recipientAddress: req.body.recipientAddress,
    recipientInfo: req.body.recipientInfo,
    cadence: req.body.cadence,
    timezone: req.body.timezone,
    nextRunAt: req.body.nextRunAt,
  });

  res.status(201).json({ success: true, data: { plan } });
}

export async function getRecurringSends(req: AuthRequest, res: Response): Promise<void> {
  const userId = getRequiredUserId(req);

  const [plans, pendingRuns] = await Promise.all([
    listRecurringSendPlans(userId),
    listPendingRecurringRuns(userId),
  ]);

  res.status(200).json({ success: true, data: { plans, pendingRuns } });
}

export async function patchRecurringSend(req: AuthRequest, res: Response): Promise<void> {
  const userId = getRequiredUserId(req);
  const planId = getRouteParam(req.params.id, "planId");

  const plan = await updateRecurringSendPlan({
    userId,
    planId,
    patch: req.body,
  });

  res.status(200).json({ success: true, data: { plan } });
}

export async function pauseRecurringSend(req: AuthRequest, res: Response): Promise<void> {
  const userId = getRequiredUserId(req);
  const plan = await pauseRecurringSendPlan(userId, getRouteParam(req.params.id, "planId"));
  res.status(200).json({ success: true, data: { plan } });
}

export async function resumeRecurringSend(req: AuthRequest, res: Response): Promise<void> {
  const userId = getRequiredUserId(req);
  const plan = await resumeRecurringSendPlan(userId, getRouteParam(req.params.id, "planId"));
  res.status(200).json({ success: true, data: { plan } });
}

export async function cancelRecurringSend(req: AuthRequest, res: Response): Promise<void> {
  const userId = getRequiredUserId(req);
  const plan = await cancelRecurringSendPlan(userId, getRouteParam(req.params.id, "planId"));
  res.status(200).json({ success: true, data: { plan } });
}

export async function confirmRecurringRun(req: AuthRequest, res: Response): Promise<void> {
  const userId = getRequiredUserId(req);

  const result = await confirmRecurringSendRun({
    userId,
    runId: getRouteParam(req.params.runId, "runId"),
  });

  res.status(200).json({ success: true, data: result });
}
