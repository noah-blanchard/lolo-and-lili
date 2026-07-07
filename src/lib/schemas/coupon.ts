import { z } from "zod";

export const mintCouponSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(60),
  emoji: z.string().trim().min(1).max(8),
  cost_treats: z.number().int().min(0).max(999),
});
export type MintCouponInput = z.infer<typeof mintCouponSchema>;
