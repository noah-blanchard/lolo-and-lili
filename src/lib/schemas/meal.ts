import { z } from "zod";

export const MEAL_SLOTS = ["breakfast", "lunch", "dinner"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const upsertMealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.enum(MEAL_SLOTS),
  title: z.string().trim().min(1).max(120),
  cook_id: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(280).optional(),
});
export type UpsertMealInput = z.infer<typeof upsertMealSchema>;

export const addIngredientsSchema = z.object({
  items: z.array(z.string().trim().min(1).max(120)).min(1).max(50),
});
export type AddIngredientsInput = z.infer<typeof addIngredientsSchema>;
