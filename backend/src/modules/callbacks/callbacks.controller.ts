import { Request, Response } from "express";
import {
  deleteCustomer,
  getCustomer,
  upsertCustomer,
  buildRateQuote,
} from "./callbacks.service";
import {
  deleteCustomerQuerySchema,
  getCustomerQuerySchema,
  getRateQuerySchema,
} from "./callbacks.validator";

export async function putCustomerCallback(req: Request, res: Response): Promise<void> {
  const result = await upsertCustomer(req.body as Record<string, unknown>);
  res.status(200).json(result);
}

export async function getCustomerCallback(req: Request, res: Response): Promise<void> {
  const parsed = getCustomerQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
    });
    return;
  }

  const customer = await getCustomer(parsed.data);
  if (!customer) {
    res.status(404).json({
      success: false,
      error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" },
    });
    return;
  }

  res.status(200).json({
    id: customer.id,
    status: customer.status,
    account: customer.account,
    memo: customer.memo,
    memo_type: customer.memo_type,
    type: customer.type,
  });
}

export async function deleteCustomerCallback(req: Request, res: Response): Promise<void> {
  const parsed = deleteCustomerQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
    });
    return;
  }

  const removed = await deleteCustomer(parsed.data);
  if (!removed) {
    res.status(404).json({
      success: false,
      error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" },
    });
    return;
  }

  res.status(200).json({ success: true });
}

export async function getRateCallback(req: Request, res: Response): Promise<void> {
  const parsed = getRateQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
    });
    return;
  }

  try {
    const quote = await buildRateQuote(parsed.data);
    res.status(200).json(quote);
  } catch (error) {
    res.status(404).json({
      success: false,
      error: {
        code: "NO_QUOTE",
        message: error instanceof Error ? error.message : "No quote available",
      },
    });
  }
}
