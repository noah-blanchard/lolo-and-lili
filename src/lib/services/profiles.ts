import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Profile } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import type { UpdateProfileInput } from "@/lib/schemas/profile";
import type { NotificationPrefs } from "@/lib/schemas/push";

type DB = SupabaseClient<Database>;

/** Update the current user's own profile (RLS: profiles_update = id = auth.uid()). */
export async function updateProfile(
  supabase: DB,
  user: User,
  input: UpdateProfileInput,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new ApiError(
      ErrorCode.INTERNAL,
      error?.message ?? "Failed to update profile",
    );
  }
  return data;
}

/** Update the current user's per-category push notification preferences. */
export async function updateNotificationPrefs(
  supabase: DB,
  user: User,
  prefs: NotificationPrefs,
): Promise<NotificationPrefs> {
  const { error } = await supabase
    .from("profiles")
    .update({ notification_prefs: prefs })
    .eq("id", user.id);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return prefs;
}
