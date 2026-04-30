import { pool } from "../../shared/config/database";
import {
  rowToRecurringPlan,
  rowToRecurringRun,
  type RecurringCadence,
  type RecurringPlanStatus,
  type RecurringSendPlan,
  type RecurringSendPlanRow,
  type RecurringSendRun,
  type RecurringSendRunRow,
} from "../../shared/types/recurring.types";
import { logAuditEvent } from "../../shared/services/audit.service";
import {
  getUserAllowedTechnicalAnchorIds,
  isTechnicalAnchorEnabledForUser,
} from "../anchors/marketplace.service";
import { computeBestRoute, getAllActiveRates } from "../rates/rate.service";
import {
  executeSep31Transaction,
  Sep31ExecutionError,
} from "../transactions/sep31-execution.service";
import { createTransaction } from "../transactions/transaction.service";

export class RecurringError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const CONFIRMATION_WINDOW_MS = 24 * 60 * 60 * 1000;
let recurringWorkerInProgress = false;

interface RecurringRunWithPlanRow {
  id: string;
  plan_id: string;
  user_id: string;
  scheduled_for: Date;
  confirm_before: Date;
  run_status: string;
  transaction_id: string | null;
  failure_reason: string | null;
  executed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  anchor_id: string | null;
  amount: string;
  from_currency: string;
  to_currency: string;
  destination_country: string;
  recipient_address: string;
  recipient_info: Record<string, unknown> | null;
}

export function calculateNextRunAt(
  currentRunAt: Date,
  cadence: RecurringCadence,
  _timezone: string
): Date {
  const next = new Date(currentRunAt);

  if (cadence === "daily") {
    next.setUTCDate(next.getUTCDate() + 1);
    return next;
  }

  if (cadence === "weekly") {
    next.setUTCDate(next.getUTCDate() + 7);
    return next;
  }

  next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

function assertValidFutureDate(nextRunAtIso: string): Date {
  const parsed = new Date(nextRunAtIso);
  if (Number.isNaN(parsed.getTime())) {
    throw new RecurringError(400, "INVALID_NEXT_RUN", "Invalid next run date");
  }

  if (parsed.getTime() <= Date.now()) {
    throw new RecurringError(400, "INVALID_NEXT_RUN", "nextRunAt must be in the future");
  }

  return parsed;
}

async function assertAnchorEligibleForUser(userId: string, anchorId: string): Promise<void> {
  const isEnabled = await isTechnicalAnchorEnabledForUser(userId, anchorId);
  if (!isEnabled) {
    throw new RecurringError(
      400,
      "ANCHOR_NOT_ACTIVE_FOR_USER",
      "Selected anchor is not active in your marketplace preferences"
    );
  }
}

export async function createRecurringSendPlan(input: {
  userId: string;
  anchorId?: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  recipientAddress: string;
  recipientInfo?: Record<string, unknown>;
  cadence: RecurringCadence;
  timezone: string;
  nextRunAt: string;
}): Promise<RecurringSendPlan> {
  const nextRunAt = assertValidFutureDate(input.nextRunAt);

  if (input.anchorId) {
    await assertAnchorEligibleForUser(input.userId, input.anchorId);
  }

  const { rows } = await pool.query<RecurringSendPlanRow>(
    `INSERT INTO recurring_send_plans (
       user_id, anchor_id, amount, from_currency, to_currency,
       destination_country, recipient_address, recipient_info,
       cadence, timezone, next_run_at, is_active, status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, 'active')
     RETURNING *`,
    [
      input.userId,
      input.anchorId ?? null,
      input.amount,
      input.fromCurrency,
      input.toCurrency,
      input.destinationCountry,
      input.recipientAddress,
      input.recipientInfo ?? null,
      input.cadence,
      input.timezone,
      nextRunAt,
    ]
  );

  const created = rowToRecurringPlan(rows[0]);

  await logAuditEvent({
    actorUserId: input.userId,
    actorRole: "user",
    action: "recurring_plan_created",
    targetType: "recurring_send_plan",
    targetId: created.id,
    metadata: {
      cadence: created.cadence,
      nextRunAt: created.nextRunAt,
      anchorId: created.anchorId,
    },
  });

  return created;
}

export async function listRecurringSendPlans(userId: string): Promise<RecurringSendPlan[]> {
  const { rows } = await pool.query<RecurringSendPlanRow>(
    `SELECT *
     FROM recurring_send_plans
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows.map(rowToRecurringPlan);
}

export async function listPendingRecurringRuns(userId: string): Promise<RecurringSendRun[]> {
  const { rows } = await pool.query<RecurringSendRunRow>(
    `SELECT *
     FROM recurring_send_runs
     WHERE user_id = $1
       AND status = 'pending_confirmation'
     ORDER BY scheduled_for ASC`,
    [userId]
  );

  return rows.map(rowToRecurringRun);
}

export async function updateRecurringSendPlan(input: {
  userId: string;
  planId: string;
  patch: {
    anchorId?: string | null;
    amount?: number;
    fromCurrency?: string;
    toCurrency?: string;
    destinationCountry?: string;
    recipientAddress?: string;
    recipientInfo?: Record<string, unknown> | null;
    cadence?: RecurringCadence;
    timezone?: string;
    nextRunAt?: string;
  };
}): Promise<RecurringSendPlan> {
  const fields: string[] = [];
  const values: Array<string | number | null | Date | Record<string, unknown>> = [];

  if (Object.prototype.hasOwnProperty.call(input.patch, "anchorId")) {
    const anchorId = input.patch.anchorId ?? null;
    if (anchorId) {
      await assertAnchorEligibleForUser(input.userId, anchorId);
    }
    values.push(anchorId);
    fields.push(`anchor_id = $${values.length}`);
  }

  if (typeof input.patch.amount === "number") {
    values.push(input.patch.amount);
    fields.push(`amount = $${values.length}`);
  }

  if (typeof input.patch.fromCurrency === "string") {
    values.push(input.patch.fromCurrency);
    fields.push(`from_currency = $${values.length}`);
  }

  if (typeof input.patch.toCurrency === "string") {
    values.push(input.patch.toCurrency);
    fields.push(`to_currency = $${values.length}`);
  }

  if (typeof input.patch.destinationCountry === "string") {
    values.push(input.patch.destinationCountry);
    fields.push(`destination_country = $${values.length}`);
  }

  if (typeof input.patch.recipientAddress === "string") {
    values.push(input.patch.recipientAddress);
    fields.push(`recipient_address = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(input.patch, "recipientInfo")) {
    values.push(input.patch.recipientInfo ?? null);
    fields.push(`recipient_info = $${values.length}`);
  }

  if (input.patch.cadence) {
    values.push(input.patch.cadence);
    fields.push(`cadence = $${values.length}`);
  }

  if (input.patch.timezone) {
    values.push(input.patch.timezone);
    fields.push(`timezone = $${values.length}`);
  }

  if (input.patch.nextRunAt) {
    const nextRunAt = assertValidFutureDate(input.patch.nextRunAt);
    values.push(nextRunAt);
    fields.push(`next_run_at = $${values.length}`);
  }

  if (fields.length === 0) {
    throw new RecurringError(400, "NO_UPDATES", "No updates requested");
  }

  fields.push("updated_at = NOW()");
  values.push(input.userId);
  values.push(input.planId);

  const { rows } = await pool.query<RecurringSendPlanRow>(
    `UPDATE recurring_send_plans
     SET ${fields.join(", ")}
     WHERE user_id = $${values.length - 1}
       AND id = $${values.length}
       AND status != 'cancelled'
     RETURNING *`,
    values
  );

  if (rows.length === 0) {
    throw new RecurringError(404, "PLAN_NOT_FOUND", "Recurring plan not found");
  }

  const updated = rowToRecurringPlan(rows[0]);

  await logAuditEvent({
    actorUserId: input.userId,
    actorRole: "user",
    action: "recurring_plan_updated",
    targetType: "recurring_send_plan",
    targetId: updated.id,
    metadata: input.patch,
  });

  return updated;
}

async function updatePlanState(input: {
  userId: string;
  planId: string;
  status: RecurringPlanStatus;
  isActive: boolean;
}): Promise<RecurringSendPlan> {
  const { rows } = await pool.query<RecurringSendPlanRow>(
    `UPDATE recurring_send_plans
     SET status = $1,
         is_active = $2,
         updated_at = NOW()
     WHERE user_id = $3 AND id = $4
     RETURNING *`,
    [input.status, input.isActive, input.userId, input.planId]
  );

  if (rows.length === 0) {
    throw new RecurringError(404, "PLAN_NOT_FOUND", "Recurring plan not found");
  }

  const plan = rowToRecurringPlan(rows[0]);

  await logAuditEvent({
    actorUserId: input.userId,
    actorRole: "user",
    action: `recurring_plan_${input.status}`,
    targetType: "recurring_send_plan",
    targetId: input.planId,
    metadata: { isActive: input.isActive },
  });

  return plan;
}

export async function pauseRecurringSendPlan(userId: string, planId: string): Promise<RecurringSendPlan> {
  return updatePlanState({ userId, planId, status: "paused", isActive: false });
}

export async function resumeRecurringSendPlan(userId: string, planId: string): Promise<RecurringSendPlan> {
  return updatePlanState({ userId, planId, status: "active", isActive: true });
}

export async function cancelRecurringSendPlan(userId: string, planId: string): Promise<RecurringSendPlan> {
  return updatePlanState({ userId, planId, status: "cancelled", isActive: false });
}

async function expireOverduePendingRuns(): Promise<void> {
  const { rows } = await pool.query<RecurringSendRunRow>(
    `UPDATE recurring_send_runs
     SET status = 'expired',
         updated_at = NOW()
     WHERE status = 'pending_confirmation'
       AND confirm_before < NOW()
     RETURNING *`
  );

  for (const row of rows) {
    await logAuditEvent({
      actorUserId: row.user_id,
      actorRole: "user",
      action: "recurring_run_expired",
      targetType: "recurring_send_run",
      targetId: row.id,
      metadata: { planId: row.plan_id },
    });
  }
}

async function createDraftRunForPlan(plan: RecurringSendPlanRow): Promise<void> {
  const scheduledFor = plan.next_run_at;
  const confirmBefore = new Date(scheduledFor.getTime() + CONFIRMATION_WINDOW_MS);

  const insertResult = await pool.query<{ id: string }>(
    `INSERT INTO recurring_send_runs (
       plan_id,
       user_id,
       scheduled_for,
       confirm_before,
       status
     ) VALUES ($1, $2, $3, $4, 'pending_confirmation')
     ON CONFLICT (plan_id, scheduled_for) DO NOTHING
     RETURNING id`,
    [plan.id, plan.user_id, scheduledFor, confirmBefore]
  );

  const nextRunAt = calculateNextRunAt(scheduledFor, plan.cadence, plan.timezone);

  await pool.query(
    `UPDATE recurring_send_plans
     SET next_run_at = $1,
         last_run_at = $2,
         updated_at = NOW()
     WHERE id = $3`,
    [nextRunAt, scheduledFor, plan.id]
  );

  if (insertResult.rows.length > 0) {
    await logAuditEvent({
      actorUserId: plan.user_id,
      actorRole: "user",
      action: "recurring_run_draft_created",
      targetType: "recurring_send_run",
      targetId: insertResult.rows[0].id,
      metadata: {
        planId: plan.id,
        scheduledFor,
        confirmBefore,
      },
    });
  }
}

export async function runRecurringSendWorkerBatch(): Promise<void> {
  if (recurringWorkerInProgress) {
    return;
  }

  recurringWorkerInProgress = true;
  try {
    await expireOverduePendingRuns();

    const { rows } = await pool.query<RecurringSendPlanRow>(
      `SELECT *
       FROM recurring_send_plans
       WHERE is_active = TRUE
         AND status = 'active'
         AND next_run_at <= NOW()
       ORDER BY next_run_at ASC
       LIMIT 100`
    );

    for (const row of rows) {
      await createDraftRunForPlan(row);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[RECURRING_WORKER] Batch failed: ${message}`);
  } finally {
    recurringWorkerInProgress = false;
  }
}

export function startRecurringSendWorker(): NodeJS.Timeout {
  const intervalMs = Number.parseInt(process.env.RECURRING_WORKER_INTERVAL_MS ?? "60000", 10);
  const safeInterval = Number.isNaN(intervalMs) ? 60000 : Math.max(intervalMs, 10000);

  const timer = setInterval(() => {
    void runRecurringSendWorkerBatch();
  }, safeInterval);

  void runRecurringSendWorkerBatch();
  return timer;
}

export async function confirmRecurringSendRun(input: {
  userId: string;
  runId: string;
}): Promise<{ run: RecurringSendRun; transactionId: string }> {
  const { rows } = await pool.query<RecurringRunWithPlanRow>(
    `SELECT
       r.id,
       r.plan_id,
       r.user_id,
       r.scheduled_for,
       r.confirm_before,
       r.status AS run_status,
       r.transaction_id,
       r.failure_reason,
       r.executed_at,
       r.created_at,
       r.updated_at,
       p.anchor_id,
       p.amount,
       p.from_currency,
       p.to_currency,
       p.destination_country,
       p.recipient_address,
       p.recipient_info,
       p.cadence,
       p.timezone,
       p.next_run_at,
       p.is_active,
       p.last_run_at
     FROM recurring_send_runs r
     INNER JOIN recurring_send_plans p ON p.id = r.plan_id
     WHERE r.id = $1
       AND r.user_id = $2
     LIMIT 1`,
    [input.runId, input.userId]
  );

  if (rows.length === 0) {
    throw new RecurringError(404, "RUN_NOT_FOUND", "Recurring run not found");
  }

  const row = rows[0];

  if (row.run_status !== "pending_confirmation") {
    throw new RecurringError(400, "RUN_NOT_CONFIRMABLE", "Recurring run cannot be confirmed in current state");
  }

  if (new Date(row.confirm_before).getTime() < Date.now()) {
    await pool.query(
      `UPDATE recurring_send_runs
       SET status = 'expired', updated_at = NOW()
       WHERE id = $1`,
      [input.runId]
    );
    throw new RecurringError(400, "RUN_EXPIRED", "Recurring run confirmation window has expired");
  }

  const routeRequest = {
    amount: Number(row.amount),
    fromCurrency: row.from_currency,
    toCurrency: row.to_currency,
    destinationCountry: row.destination_country,
  };

  const allowedAnchorIds = await getUserAllowedTechnicalAnchorIds(input.userId);
  if (allowedAnchorIds.length === 0) {
    throw new RecurringError(
      400,
      "NO_ACTIVE_ANCHORS",
      "No active anchors are configured. Activate at least one anchor in marketplace."
    );
  }

  const rates = await getAllActiveRates(input.userId);

  const route =
    row.anchor_id ?
      computeBestRoute(
        rates.filter((rate) => rate.anchorId === row.anchor_id),
        routeRequest
      )
    : computeBestRoute(rates, routeRequest);

  if (!route) {
    throw new RecurringError(404, "NO_ROUTE_FOUND", "No route available for recurring send");
  }

  if (row.anchor_id) {
    const isEnabled = await isTechnicalAnchorEnabledForUser(input.userId, row.anchor_id);
    if (!isEnabled) {
      throw new RecurringError(400, "ANCHOR_NOT_ACTIVE_FOR_USER", "Preferred anchor is no longer active");
    }
  }

  try {
    const execution = await executeSep31Transaction({
      anchorId: route.anchorId,
      userId: input.userId,
      amount: routeRequest.amount,
      fromCurrency: routeRequest.fromCurrency,
      toCurrency: routeRequest.toCurrency,
      destinationCountry: routeRequest.destinationCountry,
      recipientAddress: row.recipient_address,
      recipientInfo: row.recipient_info ?? undefined,
    });

    const transaction = await createTransaction({
      userId: input.userId,
      anchorId: route.anchorId,
      amount: routeRequest.amount,
      fee: route.totalFee,
      fromCurrency: routeRequest.fromCurrency,
      toCurrency: routeRequest.toCurrency,
      destinationCountry: routeRequest.destinationCountry,
      recipientAddress: row.recipient_address,
      recipientInfo: row.recipient_info ?? undefined,
      status: execution.externalStatus === "completed" ? "completed" : "processing",
      stellarTxHash: execution.stellarTxHash ?? undefined,
      externalTxId: execution.externalTxId ?? undefined,
      externalStatus: execution.externalStatus ?? undefined,
      externalPayload: execution.raw ?? undefined,
    });

    const { rows: updatedRows } = await pool.query<RecurringSendRunRow>(
      `UPDATE recurring_send_runs
       SET status = 'executed',
           transaction_id = $1,
           executed_at = NOW(),
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [transaction.id, input.runId]
    );

    const updatedRun = rowToRecurringRun(updatedRows[0]);

    await logAuditEvent({
      actorUserId: input.userId,
      actorRole: "user",
      action: "recurring_run_confirmed",
      targetType: "recurring_send_run",
      targetId: input.runId,
      metadata: {
        planId: updatedRun.planId,
        transactionId: transaction.id,
      },
    });

    return { run: updatedRun, transactionId: transaction.id };
  } catch (error) {
    const message =
      error instanceof RecurringError || error instanceof Sep31ExecutionError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Recurring run execution failed";

    await pool.query(
      `UPDATE recurring_send_runs
       SET status = 'failed',
           failure_reason = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [message, input.runId]
    );

    await logAuditEvent({
      actorUserId: input.userId,
      actorRole: "user",
      action: "recurring_run_failed",
      targetType: "recurring_send_run",
      targetId: input.runId,
      metadata: { reason: message },
    });

    if (error instanceof RecurringError) throw error;
    if (error instanceof Sep31ExecutionError) {
      throw new RecurringError(error.statusCode, error.code, error.message);
    }
    throw new RecurringError(502, "RECURRING_EXECUTION_FAILED", message);
  }
}
