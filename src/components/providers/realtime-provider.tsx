"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
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

/** Map of userId → ISO timestamp of when they last went offline. */
const LastSeenContext = createContext<Map<string, string>>(new Map());
export function useLastSeen() {
  return useContext(LastSeenContext);
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
  const [lastSeen, setLastSeen] = useState<Map<string, string>>(new Map());
  const prevPresenceRef = useRef<Record<string, { online_at: string }[]>>({});
  const profileRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: RealtimeChannel | undefined;

    const invalidate = (key: readonly unknown[]) =>
      queryClient.invalidateQueries({ queryKey: key });

    (async () => {
      // Ensure realtime uses the user's JWT so RLS lets Postgres Changes through.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
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
          // Unlike every other listener, chore_completions has no couple_id
          // column to filter on (it references a chore, which is couple-scoped).
          // Delivery is still couple-scoped: realtime enforces the same RLS as
          // the user's JWT (set via setAuth above), so only completions the
          // caller can read are pushed. We accept the wider subscription rather
          // than denormalize couple_id onto the table (F-024, F-013).
          "postgres_changes",
          { event: "*", schema: "public", table: "chore_completions" },
          () => invalidate(queryKeys.chores()),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profiles", filter: `couple_id=eq.${coupleId}` },
          (payload) => {
            // A profile change affects server-rendered layout data (partner
            // name/avatar/theme), so it needs a router.refresh() rather than a
            // query invalidation. But: (1) our OWN edits are already reflected
            // optimistically + via the action's revalidatePath, so only the
            // partner's changes need this; (2) debounce so a burst coalesces into
            // one refresh instead of re-running every RSC repeatedly (F-023).
            const changedId =
              (payload.new as { id?: string })?.id ??
              (payload.old as { id?: string })?.id;
            if (changedId === userId) return;
            if (profileRefreshTimer.current) clearTimeout(profileRefreshTimer.current);
            profileRefreshTimer.current = setTimeout(() => router.refresh(), 300);
          },
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
          const raw = channel!.presenceState() as Record<string, { online_at: string }[]>;
          const nextIds = new Set(Object.keys(raw));
          const prevIds = new Set(Object.keys(prevPresenceRef.current));

          setLastSeen((prev) => {
            const updated = new Map(prev);
            for (const id of prevIds) {
              if (!nextIds.has(id)) {
                const entry = prevPresenceRef.current[id]?.[0];
                updated.set(id, entry?.online_at ?? new Date().toISOString());
              }
            }
            return updated;
          });

          prevPresenceRef.current = raw;
          setOnline(nextIds);
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED" && !cancelled) {
            channel?.track({ online_at: new Date().toISOString() });
          }
        });
    })();

    return () => {
      cancelled = true;
      if (profileRefreshTimer.current) clearTimeout(profileRefreshTimer.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [coupleId, userId, queryClient, router]);

  return (
    <PresenceContext.Provider value={online}>
      <LastSeenContext.Provider value={lastSeen}>
        {children}
      </LastSeenContext.Provider>
    </PresenceContext.Provider>
  );
}
