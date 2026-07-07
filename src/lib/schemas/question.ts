import { z } from "zod";

export const submitAnswerSchema = z.object({
  answer: z.string().trim().min(1).max(500),
});
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
