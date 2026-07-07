import { z } from "zod";

export const CURRENCIES = ["EUR", "USD", "GBP", "CNY", "CAD", "CHF"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const addExpenseSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive().max(1_000_000),
  description: z.string().trim().min(1).max(120),
  currency: z.enum(CURRENCIES).optional(),
});
export type AddExpenseInput = z.infer<typeof addExpenseSchema>;
