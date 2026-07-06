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
  }, [coupleId, userId, queryClient]);

  return (
    <PresenceContext.Provider value={online}>
      {children}
    </PresenceContext.Provider>
  );
}
