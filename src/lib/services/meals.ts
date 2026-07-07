import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Meal } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import { today } from "@/lib/chores";
import type { UpsertMealInput } from "@/lib/schemas/meal";
import { requireCoupleId } from "./couples";
import { notifyPartner } from "./notifications";
import { addManyToGrocery } from "./grocery";

type DB = SupabaseClient<Database>;

function addDaysISO(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Meals for the next 7 days (today through +6). */
export async function getWeek(supabase: DB): Promise<Meal[]> {
  const start = today();
  const end = addDaysISO(start, 6);
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .gte("date", start)
    .lte("date", end);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return data ?? [];
}

/** Create or replace the meal for a date + slot. */
export async function upsertMeal(
  supabase: DB,
  user: User,
  input: UpsertMealInput,
): Promise<Meal> {
  const coupleId = await requireCoupleId(supabase, user);
  const { data, error } = await supabase
    .from("meals")
    .upsert(
      {
        couple_id: coupleId,
        date: input.date,
        slot: input.slot,
        title: input.title,
        cook_id: input.cook_id ?? null,
        notes: input.notes ?? null,
        created_by: user.id,
      },
      { onConflict: "couple_id,date,slot" },
    )
    .select("*")
    .single();
  if (error || !data) {
    throw new ApiError(ErrorCode.INTERNAL, error?.message ?? "Failed to save meal");
  }
  // If the partner was put on cooking duty, let them know.
  if (input.cook_id && input.cook_id !== user.id) {
    await notifyPartner({
      actorId: user.id,
      coupleId,
      message: "meal_assigned",
      extra: input.title,
    });
  }
  return data;
}

export async function deleteMeal(supabase: DB, id: string): Promise<{ id: string }> {
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { id };
}

/** Push a meal's ingredients onto the shared grocery list. */
export async function addMealIngredients(
  supabase: DB,
  user: User,
  items: string[],
): Promise<{ added: number }> {
  const coupleId = await requireCoupleId(supabase, user);
  await addManyToGrocery(supabase, coupleId, user.id, items);
  return { added: items.length };
}
