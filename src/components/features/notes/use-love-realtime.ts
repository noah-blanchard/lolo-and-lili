"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useCouple } from "@/components/providers/couple-provider";

/**
 * Ephemeral couple "love" channel (Broadcast, no DB write): floating hearts +
 * a typing indicator. Mirrors the pet realtime flourish, but Broadcast instead
 * of Postgres Changes. Returns senders; delivers via the callbacks.
 */
export function useLoveRealtime({
  onHeart,
  onTyping,
}: {
  onHeart?: () => void;
  onTyping?: (typing: boolean) => void;
}) {
  const { coupleId, me } = useCouple();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartCb = useRef(onHeart);
  const typingCb = useRef(onTyping);
  useEffect(() => {
    heartCb.current = onHeart;
  }, [onHeart]);
  useEffect(() => {
    typingCb.current = onTyping;
  }, [onTyping]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`love:${coupleId}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "heart" }, ({ payload }) => {
        if (payload?.from !== me.id) heartCb.current?.();
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.from !== me.id) typingCb.current?.(!!payload?.typing);
      })
      .subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [coupleId, me.id]);

  const sendHeart = useCallback(() => {
    channelRef.current?.send({
      type: "broadcast",
      event: "heart",
      payload: { from: me.id },
    });
  }, [me.id]);

  const setTyping = useCallback(
    (typing: boolean) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { from: me.id, typing },
      });
    },
    [me.id],
  );

  return { sendHeart, setTyping };
}
