import { defineRoute } from "@/lib/api/define-route";
import { pushSubscriptionSchema } from "@/lib/schemas/push";
import { saveSubscription } from "@/lib/services/push";

// web-push runs on Node APIs — keep this handler off the Edge runtime.
export const runtime = "nodejs";

export const POST = defineRoute({
  input: pushSubscriptionSchema,
  handler: async ({ supabase, user, input }) => {
    await saveSubscription(supabase, user, input);
    return { subscribed: true };
  },
});
