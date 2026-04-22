import { pool } from "../../shared/config/database";
import {
  Transaction,
  TransactionRow,
  rowToTransaction,
} from "../../shared/types/transaction.types";

/** Create a new transaction record in the database. */
export async function createTransaction(data: {
  userId: string;
  anchorId: string;
  amount: number;
  fee: number;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  recipientAddress: string;
  recipientInfo?: Record<string, unknown>;
  status?: "pending" | "processing" | "completed" | "failed";
  stellarTxHash?: string;
  externalTxId?: string;
  externalStatus?: string;
  externalPayload?: Record<string, unknown>;
}): Promise<Transaction> {
  const { rows } = await pool.query<TransactionRow>(
    `INSERT INTO transactions (
       user_id, anchor_id, amount, fee, from_currency, to_currency, destination_country,
       status, recipient_address, recipient_info, stellar_tx_hash, external_tx_id, external_status, external_payload
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      data.userId,
      data.anchorId,
      data.amount,
      data.fee,
      data.fromCurrency,
      data.toCurrency,
      data.destinationCountry,
      data.status ?? "pending",
      data.recipientAddress,
      data.recipientInfo ?? null,
      data.stellarTxHash ?? null,
      data.externalTxId ?? null,
      data.externalStatus ?? null,
      data.externalPayload ?? null,
    ]
  );

  return rowToTransaction(rows[0]);
}

/** List transactions for a user, paginated. */
export async function getUserTransactions(
  userId: string,
  page: number,
  limit: number
): Promise<{ transactions: Transaction[]; total: number }> {
  const offset = (page - 1) * limit;

  const countResult = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text FROM transactions WHERE user_id = $1",
    [userId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const { rows } = await pool.query<TransactionRow>(
    `SELECT * FROM transactions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return {
    transactions: rows.map(rowToTransaction),
    total,
  };
}

/** List transactions for a given anchor, paginated. */
export async function getAnchorTransactions(
  anchorId: string,
  page: number,
  limit: number
): Promise<{ transactions: Transaction[]; total: number }> {
  const offset = (page - 1) * limit;

  const countResult = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text FROM transactions WHERE anchor_id = $1",
    [anchorId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const { rows } = await pool.query<TransactionRow>(
    `SELECT * FROM transactions
     WHERE anchor_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [anchorId, limit, offset]
  );

  return {
    transactions: rows.map(rowToTransaction),
    total,
  };
}

/** Get a single transaction by ID. */
export async function getTransactionById(id: string): Promise<Transaction | null> {
  const { rows } = await pool.query<TransactionRow>(
    "SELECT * FROM transactions WHERE id = $1",
    [id]
  );
  return rows.length ? rowToTransaction(rows[0]) : null;
}

/** Update the status of a transaction. */
export async function updateTransactionStatus(
  id: string,
  status: string,
  stellarTxHash?: string
): Promise<Transaction | null> {
  const { rows } = await pool.query<TransactionRow>(
    `UPDATE transactions
     SET status = $1,
         stellar_tx_hash = COALESCE($2, stellar_tx_hash),
         updated_at = NOW(),
         completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END
     WHERE id = $3
     RETURNING *`,
    [status, stellarTxHash ?? null, id]
  );
  return rows.length ? rowToTransaction(rows[0]) : null;
}

interface InFlightSep31TransactionRow extends TransactionRow {
  base_url: string;
  auth_token: string;
}

export interface InFlightSep31Transaction extends Transaction {
  anchorBaseUrl: string;
  anchorAuthToken: string;
}

/** Ensure schema required by SEP-31 execution tracking exists. */
export async function ensureSep31ExecutionTrackingSchema(): Promise<void> {
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS external_tx_id TEXT`);
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS external_status TEXT`);
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS external_payload JSONB`);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_transactions_external_tx_id ON transactions (external_tx_id)`
  );
}

/** List in-flight SEP-31 transactions that have external IDs for status polling. */
export async function getInFlightSep31Transactions(limit = 100): Promise<InFlightSep31Transaction[]> {
  const { rows } = await pool.query<InFlightSep31TransactionRow>(
    `SELECT t.*, a.base_url, a.auth_token
     FROM transactions t
     INNER JOIN anchors a ON a.id = t.anchor_id
     WHERE t.external_tx_id IS NOT NULL
       AND t.status IN ('pending', 'processing')
       AND a.is_active = true
     ORDER BY t.updated_at ASC
     LIMIT $1`,
    [limit]
  );

  return rows.map((row) => ({
    ...rowToTransaction(row),
    anchorBaseUrl: row.base_url,
    anchorAuthToken: row.auth_token,
  }));
}

/**
 * Update local and external status metadata for a transaction.
 * Stores latest payload snapshot for traceability.
 */
export async function updateSep31TransactionState(data: {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  externalStatus: string;
  externalPayload: Record<string, unknown>;
  stellarTxHash?: string | null;
}): Promise<Transaction | null> {
  const { rows } = await pool.query<TransactionRow>(
    `UPDATE transactions
     SET status = $1,
         external_status = $2,
         external_payload = $3,
         stellar_tx_hash = COALESCE($4, stellar_tx_hash),
         updated_at = NOW(),
         completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END
     WHERE id = $5
     RETURNING *`,
    [
      data.status,
      data.externalStatus,
      data.externalPayload,
      data.stellarTxHash ?? null,
      data.id,
    ]
  );

  return rows.length ? rowToTransaction(rows[0]) : null;
}
