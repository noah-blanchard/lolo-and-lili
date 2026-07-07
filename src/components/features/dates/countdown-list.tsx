"use client";

import { useTranslations } from "next-intl";
import { daysUntil, nextOccurrence } from "@/lib/countdowns";
import { useSpecialDates } from "@/hooks/use-special-dates";
import { EmptyState } from "@/components/ui/empty-state";
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
      {isLoading ? null : items.length === 0 ? (
        <EmptyState emoji="🗓️" title={t("empty")} description={t("emptyHint")} />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(({ item, days }) => (
            <CountdownCard key={item.id} item={item} days={days} />
          ))}
        </div>
      )}
    </div>
  );
}
