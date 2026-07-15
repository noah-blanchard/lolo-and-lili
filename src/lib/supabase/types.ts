/**
 * App-level Supabase type aliases. The raw schema lives in ./database.types
 * (regenerate with `bun run gen:types`); this file adds convenience row
 * aliases and app-level refinements so nothing app-side breaks on regen.
 */
import type { Database as GeneratedDatabase, Json } from "./database.types";
import type { NotifyKey } from "@/lib/schemas/notification";
import type { NotifyCategory } from "@/lib/schemas/push";

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
    bladder: number;
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
    bladder?: number;
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
    opened_at: string | null;
  };
  Insert: {
    id?: string;
    couple_id: string;
    author_id?: string | null;
    body: string;
    accent?: string | null;
    created_at?: string;
    opened_at?: string | null;
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

type QuestionAnswersTable = {
  Row: {
    id: string;
    couple_id: string;
    question_date: string;
    question_key: string;
    user_id: string;
    answer: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    question_date?: string;
    question_key: string;
    user_id: string;
    answer: string;
    created_at?: string;
  };
  Update: Partial<QuestionAnswersTable["Insert"]>;
  Relationships: [];
};

type SpecialDatesTable = {
  Row: {
    id: string;
    couple_id: string;
    title: string;
    date: string;
    kind: string;
    recurring: boolean;
    emoji: string;
    created_by: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    title: string;
    date: string;
    kind?: string;
    recurring?: boolean;
    emoji?: string;
    created_by?: string | null;
    created_at?: string;
  };
  Update: Partial<SpecialDatesTable["Insert"]>;
  Relationships: [];
};

type BucketItemsTable = {
  Row: {
    id: string;
    couple_id: string;
    title: string;
    note: string | null;
    done: boolean;
    done_by: string | null;
    done_at: string | null;
    created_by: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    title: string;
    note?: string | null;
    done?: boolean;
    done_by?: string | null;
    done_at?: string | null;
    created_by?: string | null;
    created_at?: string;
  };
  Update: Partial<BucketItemsTable["Insert"]>;
  Relationships: [];
};

type GroceryItemsTable = {
  Row: {
    id: string;
    couple_id: string;
    name: string;
    quantity: string | null;
    checked: boolean;
    checked_by: string | null;
    created_by: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    name: string;
    quantity?: string | null;
    checked?: boolean;
    checked_by?: string | null;
    created_by?: string | null;
    created_at?: string;
  };
  Update: Partial<GroceryItemsTable["Insert"]>;
  Relationships: [];
};

type MealsTable = {
  Row: {
    id: string;
    couple_id: string;
    date: string;
    slot: string;
    title: string;
    cook_id: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    date: string;
    slot: string;
    title: string;
    cook_id?: string | null;
    notes?: string | null;
    created_by?: string | null;
    created_at?: string;
  };
  Update: Partial<MealsTable["Insert"]>;
  Relationships: [];
};

type ExpensesTable = {
  Row: {
    id: string;
    couple_id: string;
    payer_id: string | null;
    amount_cents: number;
    currency: string;
    description: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    payer_id?: string | null;
    amount_cents: number;
    currency?: string;
    description: string;
    created_at?: string;
  };
  Update: Partial<ExpensesTable["Insert"]>;
  Relationships: [];
};

type ExpenseSettlementsTable = {
  Row: {
    id: string;
    couple_id: string;
    from_id: string | null;
    to_id: string | null;
    amount_cents: number;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    from_id?: string | null;
    to_id?: string | null;
    amount_cents: number;
    created_at?: string;
  };
  Update: Partial<ExpenseSettlementsTable["Insert"]>;
  Relationships: [];
};

type NotificationsTable = {
  Row: {
    id: string;
    couple_id: string;
    recipient_id: string;
    actor_id: string | null;
    key: NotifyKey;
    category: NotifyCategory;
    title: string;
    body: string;
    target: string;
    target_id: string | null;
    read: boolean;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    recipient_id: string;
    actor_id?: string | null;
    key: string;
    category: string;
    title: string;
    body: string;
    target: string;
    target_id?: string | null;
    read?: boolean;
    created_at?: string;
  };
  Update: Partial<NotificationsTable["Insert"]>;
  Relationships: [];
};

type NudgesTable = {
  Row: {
    id: string;
    couple_id: string;
    from_user: string | null;
    kind: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    couple_id: string;
    from_user?: string | null;
    kind: string;
    created_at?: string;
  };
  Update: Partial<NudgesTable["Insert"]>;
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
          theme_pref: string | null;
        };
        Insert: GeneratedDatabase["public"]["Tables"]["profiles"]["Insert"] & {
          accent_color?: string | null;
          notification_prefs?: Json;
          theme_pref?: string | null;
        };
        Update: GeneratedDatabase["public"]["Tables"]["profiles"]["Update"] & {
          accent_color?: string | null;
          notification_prefs?: Json;
          theme_pref?: string | null;
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
      question_answers: QuestionAnswersTable;
      special_dates: SpecialDatesTable;
      bucket_items: BucketItemsTable;
      grocery_items: GroceryItemsTable;
      meals: MealsTable;
      expenses: ExpensesTable;
      expense_settlements: ExpenseSettlementsTable;
      nudges: NudgesTable;
      notifications: NotificationsTable;
    };
  };
};

// App-level column refinements (Postgres CHECK constraints — the generator
// emits plain `string`, so we keep these unions here for stronger typing).
export type StatusState = "free" | "busy" | "sieste";
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
export type QuestionAnswer = Tables["question_answers"]["Row"];
export type SpecialDate = Tables["special_dates"]["Row"];
export type BucketItem = Tables["bucket_items"]["Row"];
export type GroceryItem = Tables["grocery_items"]["Row"];
export type Meal = Tables["meals"]["Row"];
export type Expense = Tables["expenses"]["Row"];
export type ExpenseSettlement = Tables["expense_settlements"]["Row"];
export type Nudge = Tables["nudges"]["Row"];
export type Notification = Tables["notifications"]["Row"];
