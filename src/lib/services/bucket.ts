import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { BucketItem, Database } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import type { AddBucketInput } from "@/lib/schemas/bucket";
import { requireCoupleId } from "./couples";

type DB = SupabaseClient<Database>;

export async function listBucket(supabase: DB): Promise<BucketItem[]> {
  const { data, error } = await supabase
    .from("bucket_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return data ?? [];
}

export async function addBucket(
  supabase: DB,
  user: User,
  input: AddBucketInput,
): Promise<BucketItem> {
  const coupleId = await requireCoupleId(supabase, user);
  const { data, error } = await supabase
    .from("bucket_items")
    .insert({
      id: input.id,
      couple_id: coupleId,
      title: input.title,
      note: input.note ?? null,
      created_by: user.id,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to add item");
  }
  return data;
}

export async function toggleBucket(
  supabase: DB,
  user: User,
  id: string,
): Promise<BucketItem> {
  const { data: cur } = await supabase
    .from("bucket_items")
    .select("done")
    .eq("id", id)
    .maybeSingle();
  const done = !cur?.done;

  const { data, error } = await supabase
    .from("bucket_items")
    .update({
      done,
      done_by: done ? user.id : null,
      done_at: done ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to toggle item");
  }
  return data;
}

export async function deleteBucket(
  supabase: DB,
  id: string,
): Promise<{ id: string }> {
  const { error } = await supabase.from("bucket_items").delete().eq("id", id);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { id };
}
