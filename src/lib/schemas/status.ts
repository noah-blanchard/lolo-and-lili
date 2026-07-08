import { z } from "zod";

export const statusStates = ["free", "busy", "sieste"] as const;

export const setStatusSchema = z.object({
  state: z.enum(statusStates),
  note: z.string().trim().max(140).nullish(),
});

export type SetStatusInput = z.infer<typeof setStatusSchema>;
