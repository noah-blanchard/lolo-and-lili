"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { defineAction } from "@/lib/api/define-action";
import { renameCoupleSchema } from "@/lib/schemas/profile";
import {
  createCouple as createCoupleSvc,
  joinCouple as joinCoupleSvc,
  renameCouple as renameCoupleSvc,
} from "@/lib/services/couples";

export const createCoupleAction = defineAction(
  undefined,
  async ({ supabase, user }) => {
    const couple = await createCoupleSvc(supabase, user);
    revalidatePath("/", "layout");
    return couple;
  },
);

const joinSchema = z.object({
  inviteCode: z.string().min(4, "Code too short").max(32),
});

export const joinCoupleAction = defineAction(
  joinSchema,
  async ({ input, supabase, user }) => {
    const couple = await joinCoupleSvc(supabase, user, input.inviteCode);
    revalidatePath("/", "layout");
    return couple;
  },
);

export const renameCoupleAction = defineAction(
  renameCoupleSchema,
  async ({ input, supabase, user }) => {
    const couple = await renameCoupleSvc(supabase, user, input.name);
    revalidatePath("/", "layout");
    return couple;
  },
);
