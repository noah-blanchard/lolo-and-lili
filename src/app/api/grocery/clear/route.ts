import { defineRoute } from "@/lib/api/define-route";
import { clearChecked } from "@/lib/services/grocery";

export const POST = defineRoute({
  handler: ({ supabase, user }) => clearChecked(supabase, user),
});
