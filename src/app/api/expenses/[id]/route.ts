import { defineRoute } from "@/lib/api/define-route";
import { deleteExpense } from "@/lib/services/expenses";

export const DELETE = defineRoute({
  handler: ({ supabase, params }) => deleteExpense(supabase, params.id),
});
