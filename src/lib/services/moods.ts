import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Mood } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import type { AddMoodInput } from "@/lib/schemas/mood";
import { moodEmoji } from "@/lib/moods";
import { requireCoupleId } from "./couples";
import { notifyPartner } from "./notifications";
import { nourishFromMood } from "./pets";

type DB = SupabaseClient<Database>;

/** Recent moods for the couple, newest first. */
export async function listMoods(supabase: DB): Promise<Mood[]> {
  const { data, error } = await supabase
    .from("moods")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return data ?? [];
}

/** Record a new mood check-in for the current user. */
export async function addMood(
  supabase: DB,
  user: User,
  input: AddMoodInput,
): Promise<Mood> {
  const coupleId = await requireCoupleId(supabase, user);

  const { data, error } = await supabase
    .from("moods")
    .insert({
      id: input.id,
      user_id: user.id,
      couple_id: coupleId,
      mood: input.mood,
      note: input.note ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to add mood");
  }
  // Emotional check-ins nourish the cat's heart.
  await nourishFromMood(supabase, user);
  // Let the partner know (best-effort).
  await notifyPartner({
    actorId: user.id,
    coupleId,
    message: "mood",
    extra: moodEmoji(input.mood),
  });
  return data;
}
