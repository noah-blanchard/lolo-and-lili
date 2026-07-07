import { defineRoute } from "@/lib/api/define-route";
import { deleteGrocery, toggleGrocery } from "@/lib/services/grocery";

export const PATCH = defineRoute({
  handler: ({ supabase, user, params }) => toggleGrocery(supabase, user, params.id),
});

export const DELETE = defineRoute({
  handler: ({ supabase, params }) => deleteGrocery(supabase, params.id),
});
