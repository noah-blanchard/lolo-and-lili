import { z } from "zod";

export const addGrocerySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  quantity: z.string().trim().max(40).optional(),
});
export type AddGroceryInput = z.infer<typeof addGrocerySchema>;
