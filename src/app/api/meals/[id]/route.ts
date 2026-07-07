import { defineRoute } from "@/lib/api/define-route";
import { deleteMeal } from "@/lib/services/meals";

export const DELETE = defineRoute({
  handler: ({ supabase, params }) => deleteMeal(supabase, params.id),
});
