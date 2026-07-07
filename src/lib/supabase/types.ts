/**
 * App-level Supabase type aliases. The raw schema lives in ./database.types
 * (regenerate with `bun run gen:types`); this file adds convenience row
 * aliases and app-level refinements so nothing app-side breaks on regen.
 */
import type { Database as GeneratedDatabase, Json } from "./database.types";

export type { Json };

// --- Manual table shapes for migrations not yet reflected in generated types ---
// Teach the client about tables/columns before the migration is applied +
// `bun run gen:types` runs. Harmless once regenerated (the intersections/adds
// just become redundant). Covers 0002 (profiles.accent_color), 0003 (pets),
// and 0004 (profiles.notification_prefs + push_subscriptions.locale).

type PetsTable = {
  Row: {
    id: string;
    couple_id: string;
    name: string;
    skin: string;
    stage: number;
    level: number;
    xp: number;
    streak_count: number;
    streak_last_day: string | null;
    hunger: number;
    affection: number;
    energy: number;
    cleanliness: number;
    meters_at: string;
    ran_away_at: string | null;
    treats: number;
    equipped: Json;
    unlocked: Json;
    created_by: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    name: string;
    skin?: string;
    stage?: number;
    level?: number;
    xp?: number;
    streak_count?: number;
    streak_last_day?: string | null;
    hunger?: number;
    affection?: number;
    energy?: number;
    cleanliness?: number;
    meters_at?: string;
    ran_away_at?: string | null;
    treats?: number;
    equipped?: Json;
    unlocked?: Json;
    created_by?: string | null;
    created_at?: string;
  };
  Update: Partial<PetsTable["Insert"]>;
  Relationships: [];
};

type PetActionsTable = {
  Row: {
    id: string;
    couple_id: string;
    pet_id: string;
    type: string;
    performed_by: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    pet_id: string;
    type: string;
    performed_by?: string | null;
    created_at?: string;
  };
  Update: Partial<PetActionsTable["Insert"]>;
  Relationships: [];
};

type PetMemoriesTable = {
  Row: {
    id: string;
    couple_id: string;
    pet_id: string;
    kind: string;
    title: string;
    emoji: string;
    meta: Json;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    pet_id: string;
    kind: string;
    title: string;
    emoji?: string;
    meta?: Json;
    created_at?: string;
  };
  Update: Partial<PetMemoriesTable["Insert"]>;
  Relationships: [];
};

// --- P3+ feature tables (until each migration is applied + gen:types runs) ---

type LoveNotesTable = {
  Row: {
    id: string;
    couple_id: string;
    author_id: string | null;
    body: string;
    accent: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    author_id?: string | null;
    body: string;
    accent?: string | null;
    created_at?: string;
  };
  Update: Partial<LoveNotesTable["Insert"]>;
  Relationships: [];
};

type CouponsTable = {
  Row: {
    id: string;
    couple_id: string;
    created_by: string | null;
    title: string;
    emoji: string;
    cost_treats: number;
    status: string;
    redeemed_by: string | null;
    redeemed_at: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    created_by?: string | null;
    title: string;
    emoji?: string;
    cost_treats?: number;
    status?: string;
    redeemed_by?: string | null;
    redeemed_at?: string | null;
    created_at?: string;
  };
  Update: Partial<CouponsTable["Insert"]>;
  Relationships: [];
};

export type Database = Omit<GeneratedDatabase, "public"> & {
  public: Omit<GeneratedDatabase["public"], "Tables"> & {
    Tables: Omit<
      GeneratedDatabase["public"]["Tables"],
      "profiles" | "push_subscriptions"
    > & {
      profiles: {
        Row: GeneratedDatabase["public"]["Tables"]["profiles"]["Row"] & {
          accent_color: string | null;
          notification_prefs: Json;
        };
        Insert: GeneratedDatabase["public"]["Tables"]["profiles"]["Insert"] & {
          accent_color?: string | null;
          notification_prefs?: Json;
        };
        Update: GeneratedDatabase["public"]["Tables"]["profiles"]["Update"] & {
          accent_color?: string | null;
          notification_prefs?: Json;
        };
        Relationships: GeneratedDatabase["public"]["Tables"]["profiles"]["Relationships"];
      };
      push_subscriptions: {
        Row: GeneratedDatabase["public"]["Tables"]["push_subscriptions"]["Row"] & {
          locale: string;
        };
        Insert: GeneratedDatabase["public"]["Tables"]["push_subscriptions"]["Insert"] & {
          locale?: string;
        };
        Update: GeneratedDatabase["public"]["Tables"]["push_subscriptions"]["Update"] & {
          locale?: string;
        };
        Relationships: GeneratedDatabase["public"]["Tables"]["push_subscriptions"]["Relationships"];
      };
      pets: PetsTable;
      pet_actions: PetActionsTable;
      pet_memories: PetMemoriesTable;
      love_notes: LoveNotesTable;
      coupons: CouponsTable;
    };
  };
};

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
export type Pet = Tables["pets"]["Row"];
export type PetAction = Tables["pet_actions"]["Row"];
export type PetMemory = Tables["pet_memories"]["Row"];
export type LoveNote = Tables["love_notes"]["Row"];
export type Coupon = Tables["coupons"]["Row"];
