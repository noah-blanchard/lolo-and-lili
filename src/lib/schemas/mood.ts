import { z } from "zod";
import { MOOD_KEYS } from "@/lib/moods";

export const addMoodSchema = z.object({
  // Client-generated so the optimistic row and the persisted row share an id —
  // keeps the list key stable across refetches (no animation flicker).
  id: z.string().uuid(),
  mood: z.enum(MOOD_KEYS),
  note: z.string().trim().max(140).nullish(),
});

export type AddMoodInput = z.infer<typeof addMoodSchema>;
