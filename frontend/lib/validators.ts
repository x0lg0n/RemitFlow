/**
 * Centralized Zod Validation Schemas
 * Single source of truth for all form and API validations
 */

import { z } from "zod";

// ─────────────────────────────────────
// AUTH SCHEMAS
// ─────────────────────────────────────

export const LoginSchema = z.object({
  walletAddress: z
    .string()
    .min(1, "Wallet address is required")
    .regex(/^G[A-Z0-9]{55}$/, "Invalid Stellar wallet address"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ─────────────────────────────────────
// TRANSACTION SCHEMAS
// ─────────────────────────────────────

export const SendFormSchema = z.object({
  fromCurrency: z
    .string()
    .min(1, "Source currency is required")
    .length(3, "Currency must be 3 characters"),
  toCurrency: z
    .string()
    .min(1, "Destination currency is required")
    .length(3, "Currency must be 3 characters"),
  destinationCountry: z
    .string()
    .min(1, "Destination country is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, "Amount must be greater than 0")
    .refine((val) => val <= 1000000, "Amount must not exceed 1,000,000"),
  selectedAnchorId: z
    .string()
    .min(1, "Please select an anchor"),
  recipientAddress: z
    .string()
    .min(1, "Recipient address is required"),
  memo: z.string().optional(),
});

export type SendFormInput = z.infer<typeof SendFormSchema>;

export const RecurringTransferSchema = z.object({
  fromCurrency: z
    .string()
    .min(1, "Source currency is required")
    .length(3, "Currency must be 3 characters"),
  toCurrency: z
    .string()
    .min(1, "Destination currency is required")
    .length(3, "Currency must be 3 characters"),
  destinationCountry: z
    .string()
    .min(1, "Destination country is required"),
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, "Amount must be greater than 0")
    .refine((val) => val <= 1000000, "Amount must not exceed 1,000,000"),
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
  startDate: z.date().min(new Date(), "Start date must be in the future"),
  endDate: z.date().optional(),
  recipientAddress: z
    .string()
    .min(1, "Recipient address is required"),
});

export type RecurringTransferInput = z.infer<typeof RecurringTransferSchema>;

// ─────────────────────────────────────
// UTILITY SCHEMAS
// ─────────────────────────────────────

export const TransactionAmountSchema = z
  .string()
  .transform((val) => parseFloat(val))
  .refine((val) => !isNaN(val) && val > 0, "Amount must be greater than 0")
  .refine((val) => val <= 1000000, "Amount must not exceed 1,000,000");

export const CorridorFilterSchema = z.object({
  fromCurrency: z.string().optional(),
  toCurrency: z.string().optional(),
  destinationCountry: z.string().optional(),
});

export type CorridorFilter = z.infer<typeof CorridorFilterSchema>;

export const TransactionHistoryFilterSchema = z.object({
  status: z
    .enum(["pending", "completed", "failed"])
    .optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
});

export type TransactionHistoryFilter = z.infer<typeof TransactionHistoryFilterSchema>;

export const DashboardFiltersSchema = z.object({
  timeRange: z
    .enum(["day", "week", "month", "quarter", "year"])
    .optional(),
  correlationType: z.enum(["all", "successful", "failed"]).optional(),
});

export type DashboardFilters = z.infer<typeof DashboardFiltersSchema>;

export const RateRequestSchema = z.object({
  fromCurrency: z.string(),
  toCurrency: z.string(),
  destinationCountry: z.string(),
  amount: z.number().positive().optional(),
});

export type RateRequest = z.infer<typeof RateRequestSchema>;

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

export const SearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  type: z.enum(["anchors", "corridors", "transactions"]).optional(),
});

export type SearchInput = z.infer<typeof SearchSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  country: z.string().length(2, "Country must be 2-letter code"),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ─────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Validate data against a Zod schema
 * Returns user-friendly error messages
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      for (const issue of error.issues) {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      }
      return { success: false, errors };
    }
    return {
      success: false,
      errors: { _: "Validation failed" },
    };
  }
}

/**
 * Check if validation result has error for a field
 */
export function hasError(
  errors: Record<string, string> | undefined,
  field: string,
): boolean {
  return errors?.[field] !== undefined;
}

/**
 * Get error message for a field
 */
export function getError(
  errors: Record<string, string> | undefined,
  field: string,
): string | undefined {
  return errors?.[field];
}

/**
 * Get first error from validation result
 */
export function getFirstError(errors: Record<string, string> | undefined): string | undefined {
  if (!errors) return undefined;
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : undefined;
}
