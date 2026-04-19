export type TransactionStatus = "pending" | "processing" | "completed" | "failed";

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
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateTransactionRequest {
  anchorId: string;
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
}
