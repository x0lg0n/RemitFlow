import { Request, Response } from "express";
import {
  createTransaction,
  getUserTransactions,
  getTransactionById,
} from "./transaction.service";
import { findBestRoute } from "../rates/rate.service";
import { AuthRequest } from "../../shared/middleware/auth.middleware";
import { queryTransactionsSchema } from "./transaction.validator";

/** POST /transactions — create a new remittance transaction. */
export async function createTx(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.walletAddress!;
  const {
    anchorId,
    amount,
    fromCurrency,
    toCurrency,
    destinationCountry,
    recipientAddress,
    recipientInfo,
  } = req.body;

  const route = await findBestRoute({
    amount,
    fromCurrency,
    toCurrency,
    destinationCountry,
  });

  if (!route) {
    res.status(404).json({
      success: false,
      error: { code: "NO_ROUTE_FOUND", message: "No anchor supports this route" },
    });
    return;
  }

  const tx = await createTransaction({
    userId,
    anchorId: anchorId || route.anchorId,
    amount,
    fee: route.totalFee,
    fromCurrency,
    toCurrency,
    destinationCountry,
    recipientAddress,
    recipientInfo,
  });

  res.status(201).json({ success: true, data: { transaction: tx } });
}

/** GET /transactions — list user's transactions. */
export async function listUserTransactions(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.walletAddress!;
  const result = queryTransactionsSchema.safeParse(req.query);
  const page = result.success ? result.data.page : 1;
  const limit = result.success ? result.data.limit : 20;

  const { transactions, total } = await getUserTransactions(userId, page, limit);
  res.status(200).json({
    success: true,
    data: { transactions, pagination: { page, limit, total } },
  });
}

/** GET /transactions/:id — get a single transaction. */
export async function getTx(req: Request, res: Response): Promise<void> {
  const txId = req.params.id;
  if (Array.isArray(txId)) {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Invalid transaction ID" },
    });
    return;
  }

  const tx = await getTransactionById(txId);

  if (!tx) {
    res.status(404).json({
      success: false,
      error: { code: "TX_NOT_FOUND", message: "Transaction not found" },
    });
    return;
  }

  res.status(200).json({ success: true, data: { transaction: tx } });
}
