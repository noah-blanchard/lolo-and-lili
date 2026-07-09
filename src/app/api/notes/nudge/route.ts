import { defineRoute } from "@/lib/api/define-route";
import { rateLimit } from "@/lib/api/rate-limit";
import { sendNudge } from "@/lib/services/love-notes";

export const runtime = "nodejs";

/** Send the partner a "thinking of you" push (in-app hearts use Broadcast). */
export const POST = defineRoute({
  handler: async ({ supabase, user }) => {
    // Each nudge fires a real Web Push to the partner — cap at 6/minute.
    rateLimit(user.id, "notes-nudge", { limit: 6, windowMs: 60 * 1000 });
    await sendNudge(supabase, user);
    return { sent: true };
  },
});
