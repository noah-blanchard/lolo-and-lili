/**
 * App-level Supabase type aliases. The raw schema lives in ./database.types
 * (regenerate with `bun run gen:types`); this file adds convenience row
 * aliases and app-level refinements so nothing app-side breaks on regen.
 */
import type { Database } from "./database.types";

export type { Database };

// App-level column refinements (Postgres CHECK constraints — the generator
// emits plain `string`, so we keep these unions here for stronger typing).
export type StatusState = "free" | "busy";
export type Recurrence = "none" | "daily" | "weekly" | "monthly";

type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type Couple = Tables["couples"]["Row"];
export type Status = Tables["statuses"]["Row"];
export type Chore = Tables["chores"]["Row"];
export type ChoreCompletion = Tables["chore_completions"]["Row"];
export type Mood = Tables["moods"]["Row"];
export type PushSubscription = Tables["push_subscriptions"]["Row"];
