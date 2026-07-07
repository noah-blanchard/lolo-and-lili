import { z } from "zod";
import { AVATAR_EMOJIS, ACCENT_KEYS } from "@/lib/avatars";

export const updateProfileSchema = z
  .object({
    display_name: z.string().trim().min(1).max(24).nullish(),
    avatar_emoji: z.enum(AVATAR_EMOJIS),
    accent_color: z.enum(ACCENT_KEYS),
  })
  .partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const renameCoupleSchema = z.object({
  name: z.string().trim().min(1).max(40),
});

export type RenameCoupleInput = z.infer<typeof renameCoupleSchema>;
