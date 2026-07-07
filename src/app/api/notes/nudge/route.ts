import { defineRoute } from "@/lib/api/define-route";
import { sendNudge } from "@/lib/services/love-notes";

export const runtime = "nodejs";

/** Send the partner a "thinking of you" push (in-app hearts use Broadcast). */
export const POST = defineRoute({
  handler: async ({ supabase, user }) => {
    await sendNudge(supabase, user);
    return { sent: true };
  },
});
