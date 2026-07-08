import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, LoveNote } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import type { AddLoveNoteInput, OpenLoveNoteInput } from "@/lib/schemas/love-note";
import { requireCoupleId } from "./couples";
import { notifyPartner } from "./notifications";

type DB = SupabaseClient<Database>;

/** The couple's love notes, newest first. */
export async function listLoveNotes(supabase: DB): Promise<LoveNote[]> {
  const { data, error } = await supabase
    .from("love_notes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return data ?? [];
}

/** Leave a sweet note on the wall. */
export async function addLoveNote(
  supabase: DB,
  user: User,
  input: AddLoveNoteInput,
): Promise<LoveNote> {
  const coupleId = await requireCoupleId(supabase, user);

  const { data, error } = await supabase
    .from("love_notes")
    .insert({
      id: input.id,
      couple_id: coupleId,
      author_id: user.id,
      body: input.body,
      accent: input.accent,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to add note");
  }
  await notifyPartner({ actorId: user.id, coupleId, message: "love_note" });
  return data;
}

export async function deleteLoveNote(
  supabase: DB,
  noteId: string,
): Promise<{ id: string }> {
  const { error } = await supabase.from("love_notes").delete().eq("id", noteId);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { id: noteId };
}

/** Mark a love note as opened (shared state — both partners see it as opened). */
export async function openLoveNote(
  supabase: DB,
  noteId: string,
  input: OpenLoveNoteInput,
): Promise<LoveNote> {
  const { data, error } = await supabase
    .from("love_notes")
    .update({ opened_at: input.opened_at })
    .eq("id", noteId)
    .select("*")
    .single();
  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to open note");
  }
  return data;
}

/** Send a "thinking of you" push (the in-app hearts ride Broadcast separately). */
export async function sendNudge(supabase: DB, user: User): Promise<void> {
  const coupleId = await requireCoupleId(supabase, user);
  await notifyPartner({ actorId: user.id, coupleId, message: "love_nudge" });
}
