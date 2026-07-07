"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCouple } from "@/components/providers/couple-provider";

/**
 * Fire `onPartnerCare(type)` when the OTHER partner performs a pet action —
 * drives the live cat reaction + toast. The global realtime provider already
 * invalidates the pet query; this is just the flourish.
 */
export function usePartnerCare(onPartnerCare: (type: string) => void) {
  const { coupleId, me } = useCouple();
  const cb = useRef(onPartnerCare);
  useEffect(() => {
    cb.current = onPartnerCare;
  }, [onPartnerCare]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`petcare:${coupleId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pet_actions",
          filter: `couple_id=eq.${coupleId}`,
        },
        (payload) => {
          const row = payload.new as { performed_by: string | null; type: string };
          if (row.performed_by && row.performed_by !== me.id) cb.current(row.type);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, me.id]);
}
