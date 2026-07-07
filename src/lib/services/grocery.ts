import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, GroceryItem } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import type { AddGroceryInput } from "@/lib/schemas/grocery";
import { requireCoupleId } from "./couples";

type DB = SupabaseClient<Database>;

export async function listGrocery(supabase: DB): Promise<GroceryItem[]> {
  const { data, error } = await supabase
    .from("grocery_items")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return data ?? [];
}

export async function addGrocery(
  supabase: DB,
  user: User,
  input: AddGroceryInput,
): Promise<GroceryItem> {
  const coupleId = await requireCoupleId(supabase, user);
  const { data, error } = await supabase
    .from("grocery_items")
    .insert({
      id: input.id,
      couple_id: coupleId,
      name: input.name,
      quantity: input.quantity ?? null,
      created_by: user.id,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to add item");
  }
  return data;
}

export async function toggleGrocery(
  supabase: DB,
  user: User,
  id: string,
): Promise<GroceryItem> {
  const { data: cur } = await supabase
    .from("grocery_items")
    .select("checked")
    .eq("id", id)
    .maybeSingle();
  const checked = !cur?.checked;

  const { data, error } = await supabase
    .from("grocery_items")
    .update({ checked, checked_by: checked ? user.id : null })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to toggle item");
  }
  return data;
}

export async function deleteGrocery(
  supabase: DB,
  id: string,
): Promise<{ id: string }> {
  const { error } = await supabase.from("grocery_items").delete().eq("id", id);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { id };
}

/** Clear every checked item (RLS scopes the delete to the caller's couple). */
export async function clearChecked(
  supabase: DB,
  user: User,
): Promise<{ cleared: true }> {
  await requireCoupleId(supabase, user);
  const { error } = await supabase.from("grocery_items").delete().eq("checked", true);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { cleared: true };
}

/** Bulk-add names to the list (used by the meal planner). Best-effort. */
export async function addManyToGrocery(
  supabase: DB,
  coupleId: string,
  userId: string,
  names: string[],
): Promise<void> {
  const rows = names
    .map((n) => n.trim())
    .filter(Boolean)
    .map((name) => ({ couple_id: coupleId, name, created_by: userId }));
  if (!rows.length) return;
  await supabase.from("grocery_items").insert(rows);
}
