import { pool } from "../../shared/config/database";
import { logger } from "../../shared/logger";

type ReconciliationStatus = "matched" | "missing" | "error";

interface CandidateTransactionRow {
  id: string;
  user_id: string;
  stellar_tx_hash: string;
}

interface ReconciliationRow {
  transaction_id: string;
  stellar_tx_hash: string;
  horizon_status: ReconciliationStatus;
  horizon_ledger: string | null;
  horizon_successful: boolean | null;
  error_message: string | null;
  last_checked_at: Date;
  created_at: Date;
  updated_at: Date;
}

interface SummaryRow {
  matched: string;
  missing: string;
  errored: string;
  last_checked_at: Date | null;
}

const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL ??
  (process.env.STELLAR_NETWORK === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org");

let indexingWorkerInProgress = false;

function asInt(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function reconcileSingleTransaction(input: {
  transactionId: string;
  stellarTxHash: string;
}): Promise<ReconciliationStatus> {
  const transactionUrl = `${HORIZON_URL}/transactions/${encodeURIComponent(input.stellarTxHash)}`;

  let status: ReconciliationStatus = "error";
  let ledger: number | null = null;
  let successful: boolean | null = null;
  let errorMessage: string | null = null;

  try {
    const response = await fetch(transactionUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      const payload = (await response.json()) as {
        ledger_attr?: number;
        successful?: boolean;
        ledger?: number;
      };

      // Horizon responses use `ledger_attr`; keep fallback for compatibility.
      ledger = payload.ledger_attr ?? payload.ledger ?? null;
      successful = typeof payload.successful === "boolean" ? payload.successful : null;
      status = "matched";
    } else if (response.status === 404) {
      status = "missing";
      errorMessage = "Transaction not found on Horizon";
    } else {
      status = "error";
      const body = (await response.text()).slice(0, 500);
      errorMessage = `Horizon ${response.status}: ${body}`;
    }
  } catch (error) {
    status = "error";
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  await pool.query(
    `INSERT INTO transaction_reconciliation (
       transaction_id,
       stellar_tx_hash,
       horizon_status,
       horizon_ledger,
       horizon_successful,
       error_message,
       last_checked_at
     ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (transaction_id)
     DO UPDATE SET
       stellar_tx_hash = EXCLUDED.stellar_tx_hash,
       horizon_status = EXCLUDED.horizon_status,
       horizon_ledger = EXCLUDED.horizon_ledger,
       horizon_successful = EXCLUDED.horizon_successful,
       error_message = EXCLUDED.error_message,
       last_checked_at = NOW(),
       updated_at = NOW()`,
    [input.transactionId, input.stellarTxHash, status, ledger, successful, errorMessage]
  );

  return status;
}

export async function runIndexingBatch(limit = 100): Promise<{
  checked: number;
  matched: number;
  missing: number;
  errored: number;
}> {
  if (indexingWorkerInProgress) {
    return { checked: 0, matched: 0, missing: 0, errored: 0 };
  }

  indexingWorkerInProgress = true;

  try {
    const { rows } = await pool.query<CandidateTransactionRow>(
      `SELECT t.id, t.user_id, t.stellar_tx_hash
       FROM transactions t
       LEFT JOIN transaction_reconciliation r ON r.transaction_id = t.id
       WHERE t.status = 'completed'
         AND t.stellar_tx_hash IS NOT NULL
         AND (
           r.last_checked_at IS NULL
           OR r.last_checked_at < NOW() - INTERVAL '10 minutes'
         )
       ORDER BY COALESCE(r.last_checked_at, TO_TIMESTAMP(0)) ASC
       LIMIT $1`,
      [limit]
    );

    let matched = 0;
    let missing = 0;
    let errored = 0;

    for (const row of rows) {
      const status = await reconcileSingleTransaction({
        transactionId: row.id,
        stellarTxHash: row.stellar_tx_hash,
      });

      if (status === "matched") matched += 1;
      if (status === "missing") missing += 1;
      if (status === "error") errored += 1;
    }

    if (rows.length > 0) {
      logger.info("indexing_batch_completed", {
        checked: rows.length,
        matched,
        missing,
        errored,
      });
    }

    return { checked: rows.length, matched, missing, errored };
  } finally {
    indexingWorkerInProgress = false;
  }
}

export async function getIndexingSummary(): Promise<{
  matched: number;
  missing: number;
  errored: number;
  lastCheckedAt: string | null;
}> {
  try {
    const { rows } = await pool.query<SummaryRow>(
      `SELECT
         COALESCE(COUNT(*) FILTER (WHERE horizon_status = 'matched'), 0)::text AS matched,
         COALESCE(COUNT(*) FILTER (WHERE horizon_status = 'missing'), 0)::text AS missing,
         COALESCE(COUNT(*) FILTER (WHERE horizon_status = 'error'), 0)::text AS errored,
         MAX(last_checked_at) AS last_checked_at
       FROM transaction_reconciliation`
    );

    const summary = rows[0];
    return {
      matched: asInt(summary?.matched),
      missing: asInt(summary?.missing),
      errored: asInt(summary?.errored),
      lastCheckedAt: summary?.last_checked_at ? summary.last_checked_at.toISOString() : null,
    };
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "42P01") {
      return { matched: 0, missing: 0, errored: 0, lastCheckedAt: null };
    }
    throw error;
  }
}

export async function getRecentReconciliations(limit = 25): Promise<
  Array<{
    transactionId: string;
    stellarTxHash: string;
    horizonStatus: ReconciliationStatus;
    horizonLedger: number | null;
    horizonSuccessful: boolean | null;
    errorMessage: string | null;
    lastCheckedAt: string;
  }>
> {
  const clampedLimit = Math.max(1, Math.min(limit, 200));

  try {
    const { rows } = await pool.query<ReconciliationRow>(
      `SELECT *
       FROM transaction_reconciliation
       ORDER BY last_checked_at DESC
       LIMIT $1`,
      [clampedLimit]
    );

    return rows.map((row) => ({
      transactionId: row.transaction_id,
      stellarTxHash: row.stellar_tx_hash,
      horizonStatus: row.horizon_status,
      horizonLedger: row.horizon_ledger ? Number(row.horizon_ledger) : null,
      horizonSuccessful: row.horizon_successful,
      errorMessage: row.error_message,
      lastCheckedAt: row.last_checked_at.toISOString(),
    }));
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "42P01") {
      return [];
    }
    throw error;
  }
}

export function startIndexingWorker(): NodeJS.Timeout {
  const intervalMs = Math.max(
    Number.parseInt(process.env.INDEXING_WORKER_INTERVAL_MS ?? "300000", 10) || 300000,
    60000
  );

  void runIndexingBatch().catch((error) => {
    logger.withError("indexing_initial_batch_failed", error);
  });

  return setInterval(() => {
    void runIndexingBatch().catch((error) => {
      logger.withError("indexing_batch_failed", error);
    });
  }, intervalMs);
}
