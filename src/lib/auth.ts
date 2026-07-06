import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

/**
 * Current user + a Supabase client, memoized per request. Returns `user: null`
 * when unauthenticated.
 */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
});

/** Current user's profile row (or null). */
export async function getProfile(): Promise<Profile | null> {
  const { supabase, user } = await getSession();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data;
}
