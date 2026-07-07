import { defineRoute } from "@/lib/api/define-route";
import { upsertMealSchema } from "@/lib/schemas/meal";
import { getWeek, upsertMeal } from "@/lib/services/meals";

export const GET = defineRoute({
  handler: ({ supabase }) => getWeek(supabase),
});

export const POST = defineRoute({
  input: upsertMealSchema,
  handler: ({ supabase, user, input }) => upsertMeal(supabase, user, input),
});
