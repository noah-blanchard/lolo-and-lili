import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, SpecialDate } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import type { AddSpecialDateInput } from "@/lib/schemas/special-date";
import { requireCoupleId } from "./couples";

type DB = SupabaseClient<Database>;

export async function listSpecialDates(supabase: DB): Promise<SpecialDate[]> {
  const { data, error } = await supabase
    .from("special_dates")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return data ?? [];
}

export async function addSpecialDate(
  supabase: DB,
  user: User,
  input: AddSpecialDateInput,
): Promise<SpecialDate> {
  const coupleId = await requireCoupleId(supabase, user);
  const { data, error } = await supabase
    .from("special_dates")
    .insert({
      id: input.id,
      couple_id: coupleId,
      title: input.title,
      date: input.date,
      kind: input.kind,
      recurring: input.recurring,
      emoji: input.emoji,
      created_by: user.id,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to add date");
  }
  return data;
}

export async function deleteSpecialDate(
  supabase: DB,
  id: string,
): Promise<{ id: string }> {
  const { error } = await supabase.from("special_dates").delete().eq("id", id);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { id };
}
