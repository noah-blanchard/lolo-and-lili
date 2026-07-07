import { defineRoute } from "@/lib/api/define-route";
import { addGrocerySchema } from "@/lib/schemas/grocery";
import { addGrocery, listGrocery } from "@/lib/services/grocery";

export const GET = defineRoute({
  handler: ({ supabase }) => listGrocery(supabase),
});

export const POST = defineRoute({
  input: addGrocerySchema,
  handler: ({ supabase, user, input }) => addGrocery(supabase, user, input),
});
