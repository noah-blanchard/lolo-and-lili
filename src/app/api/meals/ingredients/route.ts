import { defineRoute } from "@/lib/api/define-route";
import { addIngredientsSchema } from "@/lib/schemas/meal";
import { addMealIngredients } from "@/lib/services/meals";

export const POST = defineRoute({
  input: addIngredientsSchema,
  handler: ({ supabase, user, input }) =>
    addMealIngredients(supabase, user, input.items),
});
