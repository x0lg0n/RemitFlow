import { pool } from "../../shared/config/database";
import { logger } from "../../shared/logger";
import type { QueryResultRow } from "pg";

interface ScalarRow {
  value: string | number | null;
}

interface TrendRow {
  day: string;
  tx_count: string;
  volume_minor: string;
}

interface RetentionRow {
  cohort_week: string;
  cohort_size: string;
  retained_week_1: string;
  retained_week_4: string;
}

async function safeQuery<T extends QueryResultRow>(query: string, params: unknown[] = []): Promise<T[]> {
  try {
    const { rows } = await pool.query<T>(query, params);
    return rows;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "42P01") {
      logger.warn("metrics_table_missing", { query });
      return [];
    }
    throw error;
  }
}

function asNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

export async function getMetricsOverview(): Promise<{
  dau: number;
  mau: number;
  txToday: number;
  tx30d: number;
  volumeTodayMinor: number;
  volume30dMinor: number;
  recurringActivePlans: number;
  pendingRecurringRuns: number;
}> {
  const [
    dauRows,
    mauRows,
    txTodayRows,
    tx30dRows,
    volumeTodayRows,
    volume30dRows,
    recurringActiveRows,
    pendingRunsRows,
  ] = await Promise.all([
    safeQuery<ScalarRow>(
      `SELECT COUNT(DISTINCT user_id)::text AS value
       FROM transactions
       WHERE created_at >= DATE_TRUNC('day', NOW())`
    ),
    safeQuery<ScalarRow>(
      `SELECT COUNT(DISTINCT user_id)::text AS value
       FROM transactions
       WHERE created_at >= NOW() - INTERVAL '30 days'`
    ),
    safeQuery<ScalarRow>(
      `SELECT COUNT(*)::text AS value
       FROM transactions
       WHERE created_at >= DATE_TRUNC('day', NOW())`
    ),
    safeQuery<ScalarRow>(
      `SELECT COUNT(*)::text AS value
       FROM transactions
       WHERE created_at >= NOW() - INTERVAL '30 days'`
    ),
    safeQuery<ScalarRow>(
      `SELECT COALESCE(SUM(amount + fee), 0)::text AS value
       FROM transactions
       WHERE created_at >= DATE_TRUNC('day', NOW())`
    ),
    safeQuery<ScalarRow>(
      `SELECT COALESCE(SUM(amount + fee), 0)::text AS value
       FROM transactions
       WHERE created_at >= NOW() - INTERVAL '30 days'`
    ),
    safeQuery<ScalarRow>(
      `SELECT COUNT(*)::text AS value
       FROM recurring_send_plans
       WHERE status = 'active' AND is_active = TRUE`
    ),
    safeQuery<ScalarRow>(
      `SELECT COUNT(*)::text AS value
       FROM recurring_send_runs
       WHERE status = 'pending_confirmation'`
    ),
  ]);

  return {
    dau: asNumber(dauRows[0]?.value),
    mau: asNumber(mauRows[0]?.value),
    txToday: asNumber(txTodayRows[0]?.value),
    tx30d: asNumber(tx30dRows[0]?.value),
    volumeTodayMinor: asNumber(volumeTodayRows[0]?.value),
    volume30dMinor: asNumber(volume30dRows[0]?.value),
    recurringActivePlans: asNumber(recurringActiveRows[0]?.value),
    pendingRecurringRuns: asNumber(pendingRunsRows[0]?.value),
  };
}

export async function getTransactionTrend(days = 30): Promise<Array<{
  day: string;
  txCount: number;
  volumeMinor: number;
}>> {
  const clampedDays = Math.min(Math.max(days, 7), 120);
  const rows = await safeQuery<TrendRow>(
    `SELECT
       TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') AS day,
       COUNT(*)::text AS tx_count,
       COALESCE(SUM(amount + fee), 0)::text AS volume_minor
     FROM transactions
     WHERE created_at >= NOW() - ($1::int * INTERVAL '1 day')
     GROUP BY DATE_TRUNC('day', created_at)
     ORDER BY DATE_TRUNC('day', created_at) ASC`,
    [clampedDays]
  );

  return rows.map((row) => ({
    day: row.day,
    txCount: asNumber(row.tx_count),
    volumeMinor: asNumber(row.volume_minor),
  }));
}

export async function getRetentionCohorts(weeks = 8): Promise<Array<{
  cohortWeek: string;
  cohortSize: number;
  retainedWeek1: number;
  retainedWeek4: number;
  retentionWeek1Pct: number;
  retentionWeek4Pct: number;
}>> {
  const clampedWeeks = Math.min(Math.max(weeks, 4), 26);
  const rows = await safeQuery<RetentionRow>(
    `WITH first_activity AS (
       SELECT
         user_id,
         DATE_TRUNC('week', MIN(created_at)) AS cohort_week
       FROM transactions
       GROUP BY user_id
     ),
     activity AS (
       SELECT
         user_id,
         DATE_TRUNC('week', created_at) AS active_week
       FROM transactions
       GROUP BY user_id, DATE_TRUNC('week', created_at)
     )
     SELECT
       TO_CHAR(f.cohort_week, 'YYYY-MM-DD') AS cohort_week,
       COUNT(DISTINCT f.user_id)::text AS cohort_size,
       COUNT(DISTINCT CASE WHEN a.active_week = f.cohort_week + INTERVAL '1 week' THEN f.user_id END)::text AS retained_week_1,
       COUNT(DISTINCT CASE WHEN a.active_week = f.cohort_week + INTERVAL '4 week' THEN f.user_id END)::text AS retained_week_4
     FROM first_activity f
     LEFT JOIN activity a ON a.user_id = f.user_id
     WHERE f.cohort_week >= DATE_TRUNC('week', NOW()) - ($1::int * INTERVAL '1 week')
     GROUP BY f.cohort_week
     ORDER BY f.cohort_week ASC`,
    [clampedWeeks]
  );

  return rows.map((row) => {
    const cohortSize = asNumber(row.cohort_size);
    const retainedWeek1 = asNumber(row.retained_week_1);
    const retainedWeek4 = asNumber(row.retained_week_4);
    return {
      cohortWeek: row.cohort_week,
      cohortSize,
      retainedWeek1,
      retainedWeek4,
      retentionWeek1Pct: cohortSize > 0 ? Number(((retainedWeek1 / cohortSize) * 100).toFixed(2)) : 0,
      retentionWeek4Pct: cohortSize > 0 ? Number(((retainedWeek4 / cohortSize) * 100).toFixed(2)) : 0,
    };
  });
}
