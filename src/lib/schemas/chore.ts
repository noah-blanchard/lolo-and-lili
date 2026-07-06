import { z } from "zod";
import { recurrences } from "@/lib/chores";

export const createChoreSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(80),
  assignee_id: z.string().uuid().nullish(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
    .nullish(),
  recurrence: z.enum(recurrences).default("none"),
  points: z.number().int().min(0).max(100).default(1),
});

export type CreateChoreInput = z.infer<typeof createChoreSchema>;
