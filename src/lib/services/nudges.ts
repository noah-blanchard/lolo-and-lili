import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import {
  NUDGE_KINDS,
  NUDGE_COOLDOWN_MS,
  type NudgeKind,
  type NudgeState,
} from "@/lib/nudges";
import type { SendNudgeInput } from "@/lib/schemas/nudge";
import type { NotifyKey } from "@/lib/notifications/messages";
import { requireCoupleId } from "./couples";
import { notifyPartner } from "./notifications";

type DB = SupabaseClient<Database>;

/** Which templated push each nudge kind sends to the partner. */
const NUDGE_NOTIFY: Record<NudgeKind, NotifyKey> = {
  miss: "nudge_miss",
  love: "nudge_love",
  think: "nudge_think",
  kiss: "nudge_kiss",
  hug: "nudge_hug",
};

const zeroCooldowns = (): Record<NudgeKind, number> =>
  Object.fromEntries(NUDGE_KINDS.map((k) => [k, 0])) as Record<NudgeKind, number>;

/** Remaining per-kind cooldown for the current user's sends. */
export async function getNudgeState(supabase: DB, user: User): Promise<NudgeState> {
  const coupleId = await requireCoupleId(supabase, user);
  const since = new Date(Date.now() - NUDGE_COOLDOWN_MS).toISOString();

  const { data } = await supabase
    .from("nudges")
    .select("kind, created_at")
    .eq("couple_id", coupleId)
    .eq("from_user", user.id)
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  const now = Date.now();
  const cooldowns = zeroCooldowns();
  for (const row of data ?? []) {
    const kind = row.kind as NudgeKind;
    if (!(kind in cooldowns) || cooldowns[kind] > 0) continue; // newest wins
    const remaining = NUDGE_COOLDOWN_MS - (now - new Date(row.created_at).getTime());
    if (remaining > 0) cooldowns[kind] = remaining;
  }
  return { cooldowns };
}

/** Send a nudge to the partner (records the row + fires a push). */
export async function sendNudge(
  supabase: DB,
  user: User,
  input: SendNudgeInput,
): Promise<NudgeState> {
  const coupleId = await requireCoupleId(supabase, user);
  const kind = input.kind;
  const since = new Date(Date.now() - NUDGE_COOLDOWN_MS).toISOString();

  const { data: recent } = await supabase
    .from("nudges")
    .select("created_at")
    .eq("couple_id", coupleId)
    .eq("from_user", user.id)
    .eq("kind", kind)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent) {
    const remaining = NUDGE_COOLDOWN_MS - (Date.now() - new Date(recent.created_at).getTime());
    if (remaining > 0) {
      throw new ApiError(ErrorCode.CONFLICT, "Doucement — encore un instant ⏳");
    }
  }

  const { error } = await supabase
    .from("nudges")
    .insert({ couple_id: coupleId, from_user: user.id, kind });
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);

  await notifyPartner({ actorId: user.id, coupleId, message: NUDGE_NOTIFY[kind] });
  return getNudgeState(supabase, user);
}
