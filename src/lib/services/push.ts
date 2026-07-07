import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { ApiError, ErrorCode } from "@/lib/api/result";
import type { PushSubscriptionInput } from "@/lib/schemas/push";

type DB = SupabaseClient<Database>;

/** Store (or refresh) a device's push subscription for the current user. */
export async function saveSubscription(
  supabase: DB,
  user: User,
  input: PushSubscriptionInput,
): Promise<void> {
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      locale: input.locale,
    },
    { onConflict: "endpoint" },
  );
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
}

/** Remove a device's subscription (RLS keeps this scoped to the caller). */
export async function removeSubscription(supabase: DB, endpoint: string): Promise<void> {
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
}

/** The current user's own subscriptions (used by the "send test" route). */
export async function listOwnSubscriptions(supabase: DB, user: User) {
  const { data } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", user.id);
  return data ?? [];
}
