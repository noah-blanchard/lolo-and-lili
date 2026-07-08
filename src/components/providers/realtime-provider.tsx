"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { queryKeys } from "@/lib/query/keys";

/** Set of currently-online user ids (via Presence). */
const PresenceContext = createContext<Set<string>>(new Set());
export function useOnlineUsers() {
  return useContext(PresenceContext);
}

/**
 * One realtime channel per couple. Reconciles the TanStack Query cache from
 * Postgres Changes and tracks online presence. Mounted once in the (app) shell.
 */
export function RealtimeProvider({
  coupleId,
  userId,
  children,
}: {
  coupleId: string;
  userId: string;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [online, setOnline] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel | undefined;

    const invalidate = (key: readonly unknown[]) =>
      queryClient.invalidateQueries({ queryKey: key });

    (async () => {
      // Ensure realtime uses the user's JWT so RLS lets Postgres Changes through.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`couple:${coupleId}`, {
          config: { presence: { key: userId } },
        })
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "statuses", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.status()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "moods", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.moods()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "chores", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.chores()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "chore_completions" },
          () => invalidate(queryKeys.chores()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profiles", filter: `couple_id=eq.${coupleId}` },
          // Identity (name/emoji/color) lives in the server-rendered layout,
          // not a query — refresh so a partner's edits appear live.
          () => router.refresh(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pets", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.pet()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pet_actions", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.pet()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pet_memories", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.petMemories()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "nudges", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.nudges()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "love_notes", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.loveNotes()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "coupons", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.coupons()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "question_answers", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.question()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "special_dates", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.specialDates()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bucket_items", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.bucket()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "grocery_items", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.grocery()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "meals", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.meals()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "expenses", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.expenses()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "expense_settlements", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.expenses()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications", filter: `couple_id=eq.${coupleId}` },
          () => invalidate(queryKeys.notifications()),
        )
        .on("presence", { event: "sync" }, () => {
          setOnline(new Set(Object.keys(channel!.presenceState())));
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            channel?.track({ online_at: new Date().toISOString() });
          }
        });
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [coupleId, userId, queryClient, router]);

  return (
    <PresenceContext.Provider value={online}>
      {children}
    </PresenceContext.Provider>
  );
}
