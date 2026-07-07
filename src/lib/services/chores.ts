import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import type { CreateChoreInput } from "@/lib/schemas/chore";
import { type ChoreWithStatus, today } from "@/lib/chores";
import { requireCoupleId } from "./couples";

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
    return { completed_today: false };
  }

  const { error } = await supabase.from("chore_completions").upsert(
    { chore_id: choreId, occurrence_date: occurrence, completed_by: user.id },
    { onConflict: "chore_id,occurrence_date", ignoreDuplicates: true },
  );
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
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
