import { defineRoute } from "@/lib/api/define-route";
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
  handler: ({ supabase, user, input }) => sendNudge(supabase, user, input),
});
