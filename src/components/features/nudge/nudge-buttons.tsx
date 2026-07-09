"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCouple } from "@/components/providers/couple-provider";
import { useNudgeState, useSendNudge } from "@/hooks/use-nudge";
import { NUDGE_KINDS, NUDGE_EMOJI, type NudgeKind } from "@/lib/nudges";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { vibrate } from "@/lib/feedback";
import { tapScale, springBouncy } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

/** Quick one-tap affection pings ("I miss you", "I love you", …) with cooldown. */
export function NudgeButtons() {
  const t = useTranslations("home.nudge");
  const { coupleId, me } = useCouple();
  const { data } = useNudgeState();
  const send = useSendNudge();

  // Toast the partner's incoming nudges while the home screen is open.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`nudges:${coupleId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "nudges", filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          const row = payload.new as { from_user: string | null; kind: string };
          if (row.from_user && row.from_user !== me.id) {
            toast(t("received", { emoji: NUDGE_EMOJI[row.kind as NudgeKind] ?? "💕" }));
            vibrate(20);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, me.id, t]);

  function fire(kind: NudgeKind) {
    if ((data?.cooldowns[kind] ?? 0) > 0 || send.isPending) return;
    vibrate(15);
    send.mutate(kind, {
      onSuccess: () => toast.success(t("sent")),
      onError: (e) => toast.error((e as Error).message),
    });
  }

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {NUDGE_KINDS.map((kind) => {
          const left = data?.cooldowns[kind] ?? 0;
          const onCooldown = left > 0;
          return (
            <motion.button
              key={kind}
              whileTap={onCooldown ? undefined : tapScale}
              transition={springBouncy}
              disabled={onCooldown || send.isPending}
              aria-busy={send.isPending || undefined}
              onClick={() => fire(kind)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-cute bg-surface-muted py-3",
                "disabled:opacity-40",
              )}
            >
              {send.isPending ? <Spinner size="sm" /> : <span className="text-2xl">{NUDGE_EMOJI[kind]}</span>}
              <span className="text-[0.7rem] font-semibold text-muted">
                {t(`kinds.${kind}`)}
              </span>
              {onCooldown && (
                <span className="text-[0.6rem] text-muted">
                  {t("cooldown", { min: Math.ceil(left / 60000) })}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
}
