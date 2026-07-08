import { z } from "zod";
import { NUDGE_KINDS } from "@/lib/nudges";

export const sendNudgeSchema = z.object({
  kind: z.enum(NUDGE_KINDS),
});

export type SendNudgeInput = z.infer<typeof sendNudgeSchema>;
