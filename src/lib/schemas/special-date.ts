import { z } from "zod";

export const DATE_KINDS = ["anniversary", "birthday", "custom"] as const;
export type DateKind = (typeof DATE_KINDS)[number];

export const addSpecialDateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(60),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.enum(DATE_KINDS),
  recurring: z.boolean(),
  emoji: z.string().trim().min(1).max(8),
});
export type AddSpecialDateInput = z.infer<typeof addSpecialDateSchema>;
