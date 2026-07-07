import { z } from "zod";

export const addBucketSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  note: z.string().trim().max(280).optional(),
});
export type AddBucketInput = z.infer<typeof addBucketSchema>;
