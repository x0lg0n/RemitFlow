import { z } from "zod";

export const bestRouteSchema = z.object({
  /** Amount in minor units (e.g. cents for USD). */
  amount: z.number().int().positive("Amount must be positive"),
  /** Source currency code (e.g. "USDC"). */
  fromCurrency: z
    .string()
    .min(1)
    .max(12)
    .transform((value) => value.toUpperCase()),
  /** Destination currency code (e.g. "COP"). */
  toCurrency: z
    .string()
    .min(1)
    .max(12)
    .transform((value) => value.toUpperCase()),
  /** ISO 3166-1 alpha-2 country code (e.g. "CO"). */
  destinationCountry: z
    .string()
    .regex(/^[A-Za-z]{2}$/, "Invalid country code (use 2-letter ISO code)")
    .transform((value) => value.toUpperCase()),
});
