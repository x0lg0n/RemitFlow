export type TransactionStatus = "pending" | "processing" | "completed" | "failed";

/** Transaction record returned to the client. */
export interface Transaction {
  id: string;
  stellarTxHash: string | null;
  userId: string;
  anchorId: string;
  amount: number;
  fee: number;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  status: TransactionStatus;
  recipientAddress: string | null;
  recipientInfo: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

/** Raw transaction row from the database. */
export interface TransactionRow {
  id: string;
  stellar_tx_hash: string | null;
  user_id: string;
  anchor_id: string;
  amount: number;
  fee: number;
  from_currency: string;
  to_currency: string;
  destination_country: string;
  status: string;
  recipient_address: string | null;
  recipient_info: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

/** Standard API response wrapper. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/** Convert a database transaction row to a clean Transaction. */
export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    stellarTxHash: row.stellar_tx_hash,
    userId: row.user_id,
    anchorId: row.anchor_id,
    amount: row.amount,
    fee: row.fee,
    fromCurrency: row.from_currency,
    toCurrency: row.to_currency,
    destinationCountry: row.destination_country,
    status: row.status as TransactionStatus,
    recipientAddress: row.recipient_address,
    recipientInfo: row.recipient_info,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}
