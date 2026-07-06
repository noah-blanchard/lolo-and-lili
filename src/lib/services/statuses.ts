import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Status } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import type { SetStatusInput } from "@/lib/schemas/status";
import { requireCoupleId } from "./couples";

type DB = SupabaseClient<Database>;

/** Both partners' statuses (RLS scopes to the caller's couple). */
export async function getStatuses(supabase: DB): Promise<Status[]> {
  const { data, error } = await supabase.from("statuses").select("*");
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return data ?? [];
}

/** Upsert the current user's status. */
export async function setStatus(
  supabase: DB,
  user: User,
  input: SetStatusInput,
): Promise<Status> {
  const coupleId = await requireCoupleId(supabase, user);

  const { data, error } = await supabase
    .from("statuses")
    .upsert({
      user_id: user.id,
      couple_id: coupleId,
      state: input.state,
      note: input.note ?? null,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to set status");
  }
  return data;
}
