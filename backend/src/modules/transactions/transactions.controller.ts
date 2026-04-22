import { Request, Response } from "express";
import {
  createTransaction,
  getUserTransactions,
  getTransactionById,
} from "./transaction.service";
import { findBestRoute, getAllActiveRates } from "../rates/rate.service";
import { AuthRequest } from "../../shared/middleware/auth.middleware";
import { queryTransactionsSchema } from "./transaction.validator";
import {
  executeSep31Transaction,
  Sep31ExecutionError,
} from "./sep31-execution.service";

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

  if (anchorId) {
    const rates = await getAllActiveRates();
    const anchorEligible = rates.some(
      (rate) =>
        rate.anchorId === anchorId &&
        rate.fromCurrency === fromCurrency &&
        rate.toCurrency === toCurrency &&
        rate.destinationCountry === destinationCountry &&
        amount >= rate.minAmount &&
        amount <= rate.maxAmount
    );

    if (!anchorEligible) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ANCHOR_SELECTION",
          message: "Selected anchor does not support this route or amount",
        },
      });
      return;
    }
  }

  const selectedAnchorId = anchorId || route.anchorId;

  let executionResult;
  
  // Check if this is a demo anchor (URL contains 'example.com' or 'demo')
  const isDemoAnchor = anchorId?.includes('demo') || anchorId?.includes('example');
  
  if (isDemoAnchor) {
    // Mock execution for demo anchors - skip real API call
    console.log(`[Demo Mode] Simulating SEP-31 transaction for anchor: ${selectedAnchorId}`);
    executionResult = {
      externalTxId: `demo-tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      externalStatus: 'completed',
      stellarTxHash: `demo-hash-${Math.random().toString(36).substring(2, 15)}`,
      raw: {
        status: 'completed',
        id: `demo-transaction-${Date.now()}`,
        message: 'Demo transaction - no real execution',
      },
    };
  } else {
    // Real execution for production anchors
    try {
      executionResult = await executeSep31Transaction({
        anchorId: selectedAnchorId,
        userId,
        amount,
        fromCurrency,
        toCurrency,
        destinationCountry,
        recipientAddress,
        recipientInfo,
      });
    } catch (error) {
      if (error instanceof Sep31ExecutionError) {
        res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
        return;
      }

      res.status(502).json({
        success: false,
        error: {
          code: "SEP31_EXECUTION_FAILED",
          message: "Failed to execute transaction with selected anchor",
        },
      });
      return;
    }
  }

  const tx = await createTransaction({
    userId,
    anchorId: selectedAnchorId,
    amount,
    fee: route.totalFee,
    fromCurrency,
    toCurrency,
    destinationCountry,
    recipientAddress,
    recipientInfo,
    status: executionResult.externalStatus === "completed" ? "completed" : "processing",
    stellarTxHash: executionResult.stellarTxHash ?? undefined,
    externalTxId: executionResult.externalTxId ?? undefined,
    externalStatus: executionResult.externalStatus ?? undefined,
    externalPayload: executionResult.raw ?? undefined,
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
