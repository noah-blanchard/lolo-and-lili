import { defineRoute } from "@/lib/api/define-route";
import { rateLimit } from "@/lib/api/rate-limit";
import { getNudgeState, sendNudge } from "@/lib/services/nudges";
import { sendNudgeSchema } from "@/lib/schemas/nudge";

export const runtime = "nodejs";

/** Current per-kind cooldowns for the caller. */
export const GET = defineRoute({
  handler: ({ supabase, user }) => getNudgeState(supabase, user),
});

/** Send a nudge to the partner. */
export const POST = defineRoute({
  input: sendNudgeSchema,
  handler: ({ supabase, user, input }) => {
    // Each nudge fires a real Web Push to the partner — cap at 6/minute.
    rateLimit(user.id, "nudges", { limit: 6, windowMs: 60 * 1000 });
    return sendNudge(supabase, user, input);
  },
});
