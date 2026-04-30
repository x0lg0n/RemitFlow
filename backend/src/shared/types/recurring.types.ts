export type RecurringCadence = "daily" | "weekly" | "monthly";
export type RecurringPlanStatus = "active" | "paused" | "cancelled";
export type RecurringRunStatus =
  | "pending_confirmation"
  | "confirmed"
  | "executed"
  | "expired"
  | "failed"
  | "cancelled";

export interface RecurringSendPlanRow {
  id: string;
  user_id: string;
  anchor_id: string | null;
  amount: string;
  from_currency: string;
  to_currency: string;
  destination_country: string;
  recipient_address: string;
  recipient_info: Record<string, unknown> | null;
  cadence: RecurringCadence;
  timezone: string;
  next_run_at: Date;
  is_active: boolean;
  status: RecurringPlanStatus;
  last_run_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface RecurringSendPlan {
  id: string;
  userId: string;
  anchorId: string | null;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  recipientAddress: string;
  recipientInfo: Record<string, unknown> | null;
  cadence: RecurringCadence;
  timezone: string;
  nextRunAt: Date;
  isActive: boolean;
  status: RecurringPlanStatus;
  lastRunAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringSendRunRow {
  id: string;
  plan_id: string;
  user_id: string;
  scheduled_for: Date;
  confirm_before: Date;
  status: RecurringRunStatus;
  transaction_id: string | null;
  failure_reason: string | null;
  executed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface RecurringSendRun {
  id: string;
  planId: string;
  userId: string;
  scheduledFor: Date;
  confirmBefore: Date;
  status: RecurringRunStatus;
  transactionId: string | null;
  failureReason: string | null;
  executedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function rowToRecurringPlan(row: RecurringSendPlanRow): RecurringSendPlan {
  return {
    id: row.id,
    userId: row.user_id,
    anchorId: row.anchor_id,
    amount: Number(row.amount),
    fromCurrency: row.from_currency,
    toCurrency: row.to_currency,
    destinationCountry: row.destination_country,
    recipientAddress: row.recipient_address,
    recipientInfo: row.recipient_info,
    cadence: row.cadence,
    timezone: row.timezone,
    nextRunAt: row.next_run_at,
    isActive: row.is_active,
    status: row.status,
    lastRunAt: row.last_run_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToRecurringRun(row: RecurringSendRunRow): RecurringSendRun {
  return {
    id: row.id,
    planId: row.plan_id,
    userId: row.user_id,
    scheduledFor: row.scheduled_for,
    confirmBefore: row.confirm_before,
    status: row.status,
    transactionId: row.transaction_id,
    failureReason: row.failure_reason,
    executedAt: row.executed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
