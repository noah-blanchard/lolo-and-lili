import { defineRoute } from "@/lib/api/define-route";
import { settleUp } from "@/lib/services/expenses";

export const runtime = "nodejs";

export const POST = defineRoute({
  handler: ({ supabase, user }) => settleUp(supabase, user),
});
