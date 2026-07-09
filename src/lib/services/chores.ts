import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { ApiError, ErrorCode, fail } from "@/lib/api/result";
import type { CreateChoreInput } from "@/lib/schemas/chore";
import { type ChoreWithStatus, today } from "@/lib/chores";
import { getCoupleMembers, requireCoupleId } from "./couples";
import { notifyPartner } from "./notifications";
import { rewardFromChore } from "./pets";

type DB = SupabaseClient<Database>;

/** All chores for the couple, each annotated with today's completion state. */
export async function listChores(supabase: DB): Promise<ChoreWithStatus[]> {
  const { data: chores, error } = await supabase
    .from("chores")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);

  const { data: completions } = await supabase
    .from("chore_completions")
    .select("chore_id, completed_by")
    .eq("occurrence_date", today());

  const byChore = new Map(
    (completions ?? []).map((c) => [c.chore_id, c.completed_by]),
  );

  return (chores ?? []).map((chore) => ({
    ...chore,
    completed_today: byChore.has(chore.id),
    completed_by: byChore.get(chore.id) ?? null,
  }));
}

export async function createChore(
  supabase: DB,
  user: User,
  input: CreateChoreInput,
): Promise<ChoreWithStatus> {
  const coupleId = await requireCoupleId(supabase, user);

  // An assignee must belong to this couple. The FK only guarantees the id is a
  // real profile, not that it's one of the two members (see F-004).
  if (input.assignee_id) {
    const members = await getCoupleMembers(supabase, coupleId);
    if (!members.some((m) => m.id === input.assignee_id)) {
      throw fail.forbidden("Assignee must be a member of your couple");
    }
  }

  const { data, error } = await supabase
    .from("chores")
    .insert({
      id: input.id,
      couple_id: coupleId,
      title: input.title,
      assignee_id: input.assignee_id ?? null,
      due_date: input.due_date ?? null,
      recurrence: input.recurrence,
      points: input.points,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to create chore");
  }
  return { ...data, completed_today: false, completed_by: null };
}

/**
 * Toggle today's completion for a chore. Concurrency-safe: the unique
 * (chore_id, occurrence_date) constraint + ignoreDuplicates means two
 * simultaneous taps collapse into a single completion row.
 */
export async function toggleCompletion(
  supabase: DB,
  user: User,
  choreId: string,
): Promise<{ completed_today: boolean }> {
  const occurrence = today();

  const { data: chore } = await supabase
    .from("chores")
    .select("points, title, couple_id")
    .eq("id", choreId)
    .maybeSingle();
  const points = chore?.points ?? 0;

  const { data: existing } = await supabase
    .from("chore_completions")
    .select("id")
    .eq("chore_id", choreId)
    .eq("occurrence_date", occurrence)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("chore_completions")
      .delete()
      .eq("id", existing.id);
    if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
    // Refund the treats the completion had awarded the cat.
    await rewardFromChore(supabase, user, points, true);
    return { completed_today: false };
  }

  const { error } = await supabase.from("chore_completions").upsert(
    { chore_id: choreId, occurrence_date: occurrence, completed_by: user.id },
    { onConflict: "chore_id,occurrence_date", ignoreDuplicates: true },
  );
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  // Teamwork feeds the cat: award treats + a small energy nudge.
  await rewardFromChore(supabase, user, points, false);
  // Tell the partner the chore got done (best-effort).
  if (chore?.couple_id) {
    await notifyPartner({
      actorId: user.id,
      coupleId: chore.couple_id,
      message: "chore_done",
      extra: chore.title,
    });
  }
  return { completed_today: true };
}

export async function deleteChore(
  supabase: DB,
  choreId: string,
): Promise<{ id: string }> {
  const { error } = await supabase.from("chores").delete().eq("id", choreId);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { id: choreId };
}
