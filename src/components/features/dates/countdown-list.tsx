"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { daysUntil, nextOccurrence } from "@/lib/countdowns";
import { useSpecialDates } from "@/hooks/use-special-dates";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { staggerContainer, popIn } from "@/lib/motion";
import { CountdownCard } from "./countdown-card";
import { AddDate } from "./add-date";

export function CountdownList() {
  const t = useTranslations("dates");
  const { data, isLoading } = useSpecialDates();
  const now = new Date();
  const items = (data ?? [])
    .map((d) => ({ item: d, days: daysUntil(nextOccurrence(d.date, d.recurring, now), now) }))
    .sort((a, b) => a.days - b.days);

  return (
    <div className="flex flex-col gap-5">
      <AddDate />
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-cute bg-surface p-5 shadow-soft">
              <Skeleton className="mb-2 h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState emoji="🗓️" title={t("empty")} description={t("emptyHint")} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-3">
          {items.map(({ item, days }) => (
            <motion.div key={item.id} variants={popIn}>
              <CountdownCard item={item} days={days} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
