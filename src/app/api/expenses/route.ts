import { defineRoute } from "@/lib/api/define-route";
import { addExpenseSchema } from "@/lib/schemas/expense";
import { addExpense, getExpensesView } from "@/lib/services/expenses";

export const GET = defineRoute({
  handler: ({ supabase, user }) => getExpensesView(supabase, user),
});

export const POST = defineRoute({
  input: addExpenseSchema,
  handler: ({ supabase, user, input }) => addExpense(supabase, user, input),
});
