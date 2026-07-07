import { defineRoute } from "@/lib/api/define-route";
import { unsubscribeSchema } from "@/lib/schemas/push";
import { removeSubscription } from "@/lib/services/push";

export const runtime = "nodejs";

export const POST = defineRoute({
  input: unsubscribeSchema,
  handler: async ({ supabase, input }) => {
    await removeSubscription(supabase, input.endpoint);
    return { unsubscribed: true };
  },
});
