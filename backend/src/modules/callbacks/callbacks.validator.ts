import { z } from "zod";

export const putCustomerSchema = z
  .object({
    account: z.string().regex(/^G[A-Z0-9]{55}$/, "Invalid Stellar account"),
    memo: z.string().optional(),
    memo_type: z.string().optional(),
    type: z.string().min(1),
  })
  .passthrough();

export const getCustomerQuerySchema = z
  .object({
    id: z.string().uuid().optional(),
    account: z.string().regex(/^G[A-Z0-9]{55}$/).optional(),
    memo: z.string().optional(),
    type: z.string().min(1),
  })
  .refine((value) => Boolean(value.id) || Boolean(value.account), {
    message: "Provide either id or account",
  });

export const deleteCustomerQuerySchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
});

export const getRateQuerySchema = z.object({
  type: z.enum(["indicative", "firm"]),
  sell_asset: z.string().min(1),
  buy_asset: z.string().min(1),
  sell_amount: z.coerce.number().positive().optional(),
  buy_amount: z.coerce.number().positive().optional(),
  expires_after: z.string().datetime().optional(),
  country_code: z.string().regex(/^[A-Za-z]{2}$/).optional(),
  destination_country: z.string().regex(/^[A-Za-z]{2}$/).optional(),
  client_id: z.string().optional(),
}).refine((value) => value.sell_amount !== undefined || value.buy_amount !== undefined, {
  message: "Either sell_amount or buy_amount is required",
});
