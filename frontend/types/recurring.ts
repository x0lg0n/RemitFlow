export type RecurringCadence = "daily" | "weekly" | "monthly";
export type RecurringPlanStatus = "active" | "paused" | "cancelled";
export type RecurringRunStatus =
  | "pending_confirmation"
  | "confirmed"
  | "executed"
  | "expired"
  | "failed"
  | "cancelled";

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
  nextRunAt: string;
  isActive: boolean;
  status: RecurringPlanStatus;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringSendRun {
  id: string;
  planId: string;
  userId: string;
  scheduledFor: string;
  confirmBefore: string;
  status: RecurringRunStatus;
  transactionId: string | null;
  failureReason: string | null;
  executedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringSendRequest {
  anchorId?: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  recipientAddress: string;
  recipientInfo?: {
    name?: string;
    idType?: string;
    idNumber?: string;
  };
  cadence: RecurringCadence;
  timezone: string;
  nextRunAt: string;
}

export interface UpdateRecurringSendRequest {
  anchorId?: string | null;
  amount?: number;
  fromCurrency?: string;
  toCurrency?: string;
  destinationCountry?: string;
  recipientAddress?: string;
  recipientInfo?: {
    name?: string;
    idType?: string;
    idNumber?: string;
  } | null;
  cadence?: RecurringCadence;
  timezone?: string;
  nextRunAt?: string;
}
