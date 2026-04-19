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
}): Promise<Transaction> {
  const { rows } = await pool.query<TransactionRow>(
    `INSERT INTO transactions (
       user_id, anchor_id, amount, fee, from_currency, to_currency, destination_country,
       status, recipient_address, recipient_info
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9)
     RETURNING *`,
    [
      data.userId,
      data.anchorId,
      data.amount,
      data.fee,
      data.fromCurrency,
      data.toCurrency,
      data.destinationCountry,
      data.recipientAddress,
      data.recipientInfo ? JSON.stringify(data.recipientInfo) : null,
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
