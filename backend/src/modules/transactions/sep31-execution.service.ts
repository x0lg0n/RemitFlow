import axios from "axios";
import { pool } from "../../shared/config/database";

interface AnchorExecRow {
  id: string;
  base_url: string;
  auth_token: string;
  is_active: boolean;
}

export interface Sep31ExecutionResult {
  externalTxId: string | null;
  externalStatus: string | null;
  stellarTxHash: string | null;
  raw: Record<string, unknown> | null;
}

export class Sep31ExecutionError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

function parseAnchorResponse(payload: Record<string, unknown>): Sep31ExecutionResult {
  const transaction = (payload.transaction ?? payload) as Record<string, unknown>;

  const externalTxId =
    typeof transaction.id === "string"
      ? transaction.id
      : typeof transaction.transaction_id === "string"
        ? transaction.transaction_id
        : null;

  const externalStatus =
    typeof transaction.status === "string"
      ? transaction.status
      : typeof payload.status === "string"
        ? payload.status
        : null;

  const stellarTxHash =
    typeof transaction.stellar_transaction_id === "string"
      ? transaction.stellar_transaction_id
      : typeof transaction.stellar_tx_hash === "string"
        ? transaction.stellar_tx_hash
        : null;

  return {
    externalTxId,
    externalStatus,
    stellarTxHash,
    raw: payload,
  };
}

export async function executeSep31Transaction(input: {
  anchorId: string;
  userId: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  recipientAddress: string;
  recipientInfo?: Record<string, unknown>;
}): Promise<Sep31ExecutionResult> {
  const { rows } = await pool.query<AnchorExecRow>(
    `SELECT id, base_url, auth_token, is_active
     FROM anchors
     WHERE id = $1
     LIMIT 1`,
    [input.anchorId]
  );

  if (rows.length === 0) {
    throw new Sep31ExecutionError(404, "ANCHOR_NOT_FOUND", "Anchor not found");
  }

  const anchor = rows[0];
  if (!anchor.is_active) {
    throw new Sep31ExecutionError(400, "ANCHOR_INACTIVE", "Selected anchor is inactive");
  }

  const body: Record<string, unknown> = {
    amount: input.amount.toString(),
    asset_code: input.fromCurrency,
    asset_issuer: process.env.SEP31_ASSET_ISSUER ?? "",
    destination_asset: input.toCurrency,
    destination_country: input.destinationCountry,
    receiver_id: input.recipientAddress,
    sender_id: input.userId,
  };

  if (input.recipientInfo) {
    body.fields = input.recipientInfo;
  }

  try {
    const { data } = await axios.post<Record<string, unknown>>(
      `${anchor.base_url}/transactions`,
      body,
      {
        headers: { Authorization: `Bearer ${anchor.auth_token}` },
        timeout: 8000,
      }
    );

    return parseAnchorResponse(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        typeof error.response?.data === "object" && error.response?.data !== null
          ? JSON.stringify(error.response.data)
          : error.message;

      throw new Sep31ExecutionError(
        error.response?.status ?? 502,
        "SEP31_EXECUTION_FAILED",
        `Anchor transaction execution failed: ${message}`
      );
    }

    throw new Sep31ExecutionError(502, "SEP31_EXECUTION_FAILED", "Anchor transaction execution failed");
  }
}
