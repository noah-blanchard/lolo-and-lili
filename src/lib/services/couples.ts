import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Couple, Database, Profile } from "@/lib/supabase/types";
import { ApiError, ErrorCode, fail } from "@/lib/api/result";
import { createAdminClient } from "@/lib/supabase/admin";

type DB = SupabaseClient<Database>;

/** The current user's couple id, or throw FORBIDDEN if they haven't joined one. */
export async function requireCoupleId(supabase: DB, user: User): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("couple_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!data?.couple_id) throw fail.forbidden("You are not part of a couple yet");
  return data.couple_id;
}

/** Both members of a couple (RLS keeps this scoped to the caller's couple). */
export async function getCoupleMembers(
  supabase: DB,
  coupleId: string,
): Promise<Profile[]> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("couple_id", coupleId);
  return data ?? [];
}

/** Create a fresh couple and link the current user's profile to it. */
export async function createCouple(supabase: DB, user: User): Promise<Couple> {
  // Generate the id up-front so we don't need to SELECT it back before the
  // RLS link exists (the SELECT policy requires membership).
  const id = crypto.randomUUID();

  const { error: insertError } = await supabase.from("couples").insert({ id });
  if (insertError) {
    throw new ApiError(ErrorCode.INTERNAL, insertError.message);
  }

  await linkProfileToCouple(supabase, user.id, id);
  return fetchCouple(supabase, id);
}

/** Join an existing couple by its invite code. */
export async function joinCouple(
  supabase: DB,
  user: User,
  inviteCode: string,
): Promise<Couple> {
  // The invite-code lookup must bypass RLS: couples_select only exposes a
  // couple you already belong to, but here you're joining a new one. Use the
  // service-role client for the lookup ONLY — the profile link below still
  // goes through the caller's RLS-enforced client.
  const admin = createAdminClient();
  const { data: couple, error } = await admin
    .from("couples")
    .select("*")
    .eq("invite_code", inviteCode.trim().toLowerCase())
    .maybeSingle();

  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  if (!couple) throw fail.notFound("Invite code not found");

  await linkProfileToCouple(supabase, user.id, couple.id);
  return couple;
}

async function linkProfileToCouple(
  supabase: DB,
  userId: string,
  coupleId: string,
) {
  // Upsert (not update): self-heals users whose profile row was never created
  // by the handle_new_user trigger. Only touches id + couple_id, so existing
  // display_name/avatar_emoji are preserved.
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, couple_id: coupleId }, { onConflict: "id" });
  if (profileError) {
    throw new ApiError(ErrorCode.INTERNAL, profileError.message);
  }

  // Seed a default status row so the couple dashboard has something to show.
  // Non-fatal — the couple is usable even if this fails.
  const { error: statusError } = await supabase
    .from("statuses")
    .upsert({ user_id: userId, couple_id: coupleId, state: "free" });
  if (statusError) {
    console.error("[couples] seed status failed:", statusError.message);
  }
}

async function fetchCouple(supabase: DB, id: string): Promise<Couple> {
  const { data, error } = await supabase
    .from("couples")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  if (!data) {
    throw new ApiError(
      ErrorCode.INTERNAL,
      "Couple created but not readable — check that your profile is linked",
    );
  }
  return data;
}
