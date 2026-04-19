import { z } from "zod";

export const createTransactionSchema = z.object({
  anchorId: z.string().min(1),
  /** Amount in minor units. */
  amount: z.number().int().positive(),
  fromCurrency: z
    .string()
    .min(1)
    .max(12)
    .transform((value) => value.toUpperCase()),
  toCurrency: z
    .string()
    .min(1)
    .max(12)
    .transform((value) => value.toUpperCase()),
  destinationCountry: z
    .string()
    .regex(/^[A-Za-z]{2}$/, "Invalid country code (use 2-letter ISO code)")
    .transform((value) => value.toUpperCase()),
  /** Stellar address of the recipient. */
  recipientAddress: z.string().regex(/^G[A-Z0-9]{55}$/, "Invalid recipient address"),
  recipientInfo: z
    .object({
      name: z.string().min(1),
      idType: z.string().optional(),
      idNumber: z.string().optional(),
    })
    .optional(),
});

export const queryTransactionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
