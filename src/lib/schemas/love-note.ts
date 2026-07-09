import { z } from "zod";
import { ACCENT_KEYS } from "@/lib/avatars";

export const addLoveNoteSchema = z.object({
  id: z.string().uuid(),
  body: z.string().trim().min(1).max(280),
  accent: z.enum(ACCENT_KEYS),
});
export type AddLoveNoteInput = z.infer<typeof addLoveNoteSchema>;

export const openLoveNoteSchema = z.object({
  // Accepted for backwards-compat but ignored: the server stamps opened_at
  // itself so shared state can't be back-dated by a client (see F-003).
  opened_at: z.string().datetime().optional(),
});
export type OpenLoveNoteInput = z.infer<typeof openLoveNoteSchema>;
