import { z } from "zod";
import { ACCENT_KEYS } from "@/lib/avatars";

export const addLoveNoteSchema = z.object({
  id: z.string().uuid(),
  body: z.string().trim().min(1).max(280),
  accent: z.enum(ACCENT_KEYS),
});
export type AddLoveNoteInput = z.infer<typeof addLoveNoteSchema>;
