import type { Chore } from "@/lib/supabase/types";

/** A chore plus whether it's been completed for today's occurrence. */
export type ChoreWithStatus = Chore & {
  completed_today: boolean;
  completed_by: string | null;
};

export const recurrences = ["none", "daily", "weekly", "monthly"] as const;
export type Recurrence = (typeof recurrences)[number];

/** Today's date as YYYY-MM-DD (matches Postgres `current_date`). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
