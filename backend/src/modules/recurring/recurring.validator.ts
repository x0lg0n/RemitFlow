import { z } from "zod";

export const recurringCadenceSchema = z.enum(["daily", "weekly", "monthly"]);

export const createRecurringSendSchema = z.object({
  anchorId: z.string().min(1).optional(),
  amount: z.number().int().positive(),
  fromCurrency: z.string().min(1).max(12).transform((value) => value.toUpperCase()),
  toCurrency: z.string().min(1).max(12).transform((value) => value.toUpperCase()),
  destinationCountry: z
    .string()
    .regex(/^[A-Za-z]{2}$/)
    .transform((value) => value.toUpperCase()),
  recipientAddress: z.string().regex(/^G[A-Z0-9]{55}$/),
  recipientInfo: z
    .object({
      name: z.string().min(1).optional(),
      idType: z.string().optional(),
      idNumber: z.string().optional(),
    })
    .optional(),
  cadence: recurringCadenceSchema,
  timezone: z.string().min(1).max(64),
  nextRunAt: z.string().datetime(),
});

export const updateRecurringSendSchema = z
  .object({
    anchorId: z.string().min(1).nullable().optional(),
    amount: z.number().int().positive().optional(),
    fromCurrency: z.string().min(1).max(12).transform((value) => value.toUpperCase()).optional(),
    toCurrency: z.string().min(1).max(12).transform((value) => value.toUpperCase()).optional(),
    destinationCountry: z
      .string()
      .regex(/^[A-Za-z]{2}$/)
      .transform((value) => value.toUpperCase())
      .optional(),
    recipientAddress: z.string().regex(/^G[A-Z0-9]{55}$/).optional(),
    recipientInfo: z
      .object({
        name: z.string().min(1).optional(),
        idType: z.string().optional(),
        idNumber: z.string().optional(),
      })
      .nullable()
      .optional(),
    cadence: recurringCadenceSchema.optional(),
    timezone: z.string().min(1).max(64).optional(),
    nextRunAt: z.string().datetime().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const reviewSubmissionSchema = z.object({
  reviewNotes: z.string().max(1000).optional(),
});

export const confirmRecurringRunSchema = z.object({
  acknowledged: z.boolean().optional(),
});
