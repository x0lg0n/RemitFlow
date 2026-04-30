export interface MetricsOverview {
  dau: number;
  mau: number;
  txToday: number;
  tx30d: number;
  volumeTodayMinor: number;
  volume30dMinor: number;
  recurringActivePlans: number;
  pendingRecurringRuns: number;
}

export interface MetricsTrendPoint {
  day: string;
  txCount: number;
  volumeMinor: number;
}

export interface RetentionCohort {
  cohortWeek: string;
  cohortSize: number;
  retainedWeek1: number;
  retainedWeek4: number;
  retentionWeek1Pct: number;
  retentionWeek4Pct: number;
}

export interface IndexingSummary {
  matched: number;
  missing: number;
  errored: number;
  lastCheckedAt: string | null;
}

export interface IndexingRow {
  transactionId: string;
  stellarTxHash: string;
  horizonStatus: "matched" | "missing" | "error";
  horizonLedger: number | null;
  horizonSuccessful: boolean | null;
  errorMessage: string | null;
  lastCheckedAt: string;
}
