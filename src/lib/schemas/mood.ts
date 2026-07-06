import { z } from "zod";
import { MOOD_KEYS } from "@/lib/moods";

export const addMoodSchema = z.object({
  mood: z.enum(MOOD_KEYS),
  note: z.string().trim().max(140).nullish(),
});

export type AddMoodInput = z.infer<typeof addMoodSchema>;
