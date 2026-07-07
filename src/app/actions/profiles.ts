"use server";

import { revalidatePath } from "next/cache";
import { defineAction } from "@/lib/api/define-action";
import { updateProfileSchema } from "@/lib/schemas/profile";
import { updateProfile } from "@/lib/services/profiles";

export const updateProfileAction = defineAction(
  updateProfileSchema,
  async ({ input, supabase, user }) => {
    const profile = await updateProfile(supabase, user, input);
    // Re-render the (app) layout so me/partner refresh everywhere.
    revalidatePath("/", "layout");
    return profile;
  },
);
