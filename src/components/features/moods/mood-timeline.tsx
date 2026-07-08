"use client";

import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useCouple } from "@/components/providers/couple-provider";
import { useMoods } from "@/hooks/use-moods";
import { moodEmoji } from "@/lib/moods";
import { timeAgo } from "@/lib/dates";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { popIn } from "@/lib/motion";

export function MoodTimeline() {
  const t = useTranslations("moods");
  const ts = useTranslations("status");
  const locale = useLocale();
  const { me, partner } = useCouple();
  const { data: moods, isLoading } = useMoods();

  const nameFor = (userId: string) =>
    userId === me.id
      ? (me.display_name ?? ts("me"))
      : (partner?.display_name ?? ts("partner"));

  if (isLoading) {
    return (
      <Card className="flex flex-col gap-3">
        <CardTitle>{t("recent")}</CardTitle>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-cute bg-surface-muted px-3 py-2">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-3 w-12 shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!moods || moods.length === 0) {
    return (
      <Card>
        <CardDescription>{t("empty")}</CardDescription>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>{t("recent")}</CardTitle>
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {moods.map((m) => (
            <motion.li
              key={m.id}
              variants={popIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className="flex items-center gap-3 rounded-cute bg-surface-muted px-3 py-2"
            >
              <span className="text-2xl">{moodEmoji(m.mood)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {nameFor(m.user_id)}
                </p>
                {m.note && (
                  <p className="truncate text-sm text-muted">{m.note}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted">
                {timeAgo(m.created_at, locale)}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Card>
  );
}
