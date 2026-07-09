export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bucket_items: {
        Row: {
          couple_id: string
          created_at: string
          created_by: string | null
          done: boolean
          done_at: string | null
          done_by: string | null
          id: string
          note: string | null
          title: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          created_by?: string | null
          done?: boolean
          done_at?: string | null
          done_by?: string | null
          id?: string
          note?: string | null
          title: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          created_by?: string | null
          done?: boolean
          done_at?: string | null
          done_by?: string | null
          id?: string
          note?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bucket_items_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bucket_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bucket_items_done_by_fkey"
            columns: ["done_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_completions: {
        Row: {
          chore_id: string
          completed_at: string
          completed_by: string | null
          id: string
          occurrence_date: string
        }
        Insert: {
          chore_id: string
          completed_at?: string
          completed_by?: string | null
          id?: string
          occurrence_date?: string
        }
        Update: {
          chore_id?: string
          completed_at?: string
          completed_by?: string | null
          id?: string
          occurrence_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "chore_completions_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "chores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_completions_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chores: {
        Row: {
          assignee_id: string | null
          couple_id: string
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          points: number
          recurrence: string
          title: string
        }
        Insert: {
          assignee_id?: string | null
          couple_id: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          points?: number
          recurrence?: string
          title: string
        }
        Update: {
          assignee_id?: string | null
          couple_id?: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          points?: number
          recurrence?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chores_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chores_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chores_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          cost_treats: number
          couple_id: string
          created_at: string
          created_by: string | null
          emoji: string
          id: string
          redeemed_at: string | null
          redeemed_by: string | null
          status: string
          title: string
        }
        Insert: {
          cost_treats?: number
          couple_id: string
          created_at?: string
          created_by?: string | null
          emoji?: string
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
          title: string
        }
        Update: {
          cost_treats?: number
          couple_id?: string
          created_at?: string
          created_by?: string | null
          emoji?: string
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_settlements: {
        Row: {
          amount_cents: number
          couple_id: string
          created_at: string
          from_id: string | null
          id: string
          to_id: string | null
        }
        Insert: {
          amount_cents: number
          couple_id: string
          created_at?: string
          from_id?: string | null
          id?: string
          to_id?: string | null
        }
        Update: {
          amount_cents?: number
          couple_id?: string
          created_at?: string
          from_id?: string | null
          id?: string
          to_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_settlements_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_settlements_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_settlements_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount_cents: number
          couple_id: string
          created_at: string
          currency: string
          description: string
          id: string
          payer_id: string | null
        }
        Insert: {
          amount_cents: number
          couple_id: string
          created_at?: string
          currency?: string
          description: string
          id?: string
          payer_id?: string | null
        }
        Update: {
          amount_cents?: number
          couple_id?: string
          created_at?: string
          currency?: string
          description?: string
          id?: string
          payer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_items: {
        Row: {
          checked: boolean
          checked_by: string | null
          couple_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          quantity: string | null
        }
        Insert: {
          checked?: boolean
          checked_by?: string | null
          couple_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          quantity?: string | null
        }
        Update: {
          checked?: boolean
          checked_by?: string | null
          couple_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          quantity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grocery_items_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_items_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grocery_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      love_notes: {
        Row: {
          accent: string | null
          author_id: string | null
          body: string
          couple_id: string
          created_at: string
          id: string
          opened_at: string | null
        }
        Insert: {
          accent?: string | null
          author_id?: string | null
          body: string
          couple_id: string
          created_at?: string
          id?: string
          opened_at?: string | null
        }
        Update: {
          accent?: string | null
          author_id?: string | null
          body?: string
          couple_id?: string
          created_at?: string
          id?: string
          opened_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "love_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "love_notes_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          cook_id: string | null
          couple_id: string
          created_at: string
          created_by: string | null
          date: string
          id: string
          notes: string | null
          slot: string
          title: string
        }
        Insert: {
          cook_id?: string | null
          couple_id: string
          created_at?: string
          created_by?: string | null
          date: string
          id?: string
          notes?: string | null
          slot: string
          title: string
        }
        Update: {
          cook_id?: string | null
          couple_id?: string
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          slot?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meals_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moods: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          mood: string
          note: string | null
          user_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          mood: string
          note?: string | null
          user_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          mood?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moods_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string
          category: string
          couple_id: string
          created_at: string
          id: string
          key: string
          read: boolean
          recipient_id: string
          target: string
          target_id: string | null
          title: string
        }
        Insert: {
          actor_id?: string | null
          body: string
          category: string
          couple_id: string
          created_at?: string
          id?: string
          key: string
          read?: boolean
          recipient_id: string
          target: string
          target_id?: string | null
          title: string
        }
        Update: {
          actor_id?: string | null
          body?: string
          category?: string
          couple_id?: string
          created_at?: string
          id?: string
          key?: string
          read?: boolean
          recipient_id?: string
          target?: string
          target_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      nudges: {
        Row: {
          couple_id: string
          created_at: string
          from_user: string | null
          id: string
          kind: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          from_user?: string | null
          id?: string
          kind: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          from_user?: string | null
          id?: string
          kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "nudges_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nudges_from_user_fkey"
            columns: ["from_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_actions: {
        Row: {
          couple_id: string
          created_at: string
          id: string
          performed_by: string | null
          pet_id: string
          type: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          id?: string
          performed_by?: string | null
          pet_id: string
          type: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          id?: string
          performed_by?: string | null
          pet_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_actions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_actions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_actions_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_memories: {
        Row: {
          couple_id: string
          created_at: string
          emoji: string
          id: string
          kind: string
          meta: Json
          pet_id: string
          title: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          emoji?: string
          id?: string
          kind: string
          meta?: Json
          pet_id: string
          title: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          emoji?: string
          id?: string
          kind?: string
          meta?: Json
          pet_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_memories_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_memories_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          affection: number
          cleanliness: number
          couple_id: string
          created_at: string
          created_by: string | null
          energy: number
          equipped: Json
          hunger: number
          id: string
          level: number
          meters_at: string
          name: string
          ran_away_at: string | null
          skin: string
          stage: number
          streak_count: number
          streak_last_day: string | null
          treats: number
          unlocked: Json
          xp: number
        }
        Insert: {
          affection?: number
          cleanliness?: number
          couple_id: string
          created_at?: string
          created_by?: string | null
          energy?: number
          equipped?: Json
          hunger?: number
          id?: string
          level?: number
          meters_at?: string
          name: string
          ran_away_at?: string | null
          skin?: string
          stage?: number
          streak_count?: number
          streak_last_day?: string | null
          treats?: number
          unlocked?: Json
          xp?: number
        }
        Update: {
          affection?: number
          cleanliness?: number
          couple_id?: string
          created_at?: string
          created_by?: string | null
          energy?: number
          equipped?: Json
          hunger?: number
          id?: string
          level?: number
          meters_at?: string
          name?: string
          ran_away_at?: string | null
          skin?: string
          stage?: number
          streak_count?: number
          streak_last_day?: string | null
          treats?: number
          unlocked?: Json
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "pets_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: true
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accent_color: string | null
          avatar_emoji: string | null
          couple_id: string | null
          created_at: string
          display_name: string | null
          id: string
          notification_prefs: Json
          theme_pref: string | null
        }
        Insert: {
          accent_color?: string | null
          avatar_emoji?: string | null
          couple_id?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          notification_prefs?: Json
          theme_pref?: string | null
        }
        Update: {
          accent_color?: string | null
          avatar_emoji?: string | null
          couple_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          notification_prefs?: Json
          theme_pref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          locale: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          locale?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          locale?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      question_answers: {
        Row: {
          answer: string
          couple_id: string
          created_at: string
          id: string
          question_date: string
          question_key: string
          user_id: string
        }
        Insert: {
          answer: string
          couple_id: string
          created_at?: string
          id?: string
          question_date?: string
          question_key: string
          user_id: string
        }
        Update: {
          answer?: string
          couple_id?: string
          created_at?: string
          id?: string
          question_date?: string
          question_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_answers_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      special_dates: {
        Row: {
          couple_id: string
          created_at: string
          created_by: string | null
          date: string
          emoji: string
          id: string
          kind: string
          recurring: boolean
          title: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          created_by?: string | null
          date: string
          emoji?: string
          id?: string
          kind?: string
          recurring?: boolean
          title: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          created_by?: string | null
          date?: string
          emoji?: string
          id?: string
          kind?: string
          recurring?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_dates_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_dates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      statuses: {
        Row: {
          couple_id: string
          emoji: string | null
          note: string | null
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          couple_id: string
          emoji?: string | null
          note?: string | null
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          couple_id?: string
          emoji?: string | null
          note?: string | null
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "statuses_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "statuses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_couple_id: { Args: never; Returns: string }
      adjust_treats: { Args: { p_pet_id: string; p_delta: number }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
