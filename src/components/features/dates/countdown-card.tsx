"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { nextOccurrence, yearsAt } from "@/lib/countdowns";
import { Card } from "@/components/ui/card";
import { useDeleteSpecialDate } from "@/hooks/use-special-dates";
import type { SpecialDate } from "@/lib/supabase/types";

export function CountdownCard({ item, days }: { item: SpecialDate; days: number }) {
  const t = useTranslations("dates");
  const locale = useLocale();
  const del = useDeleteSpecialDate();
  const occ = nextOccurrence(item.date, item.recurring, new Date());
  const years = item.recurring ? yearsAt(item.date, occ) : 0;
  const dateLabel = occ.toLocaleDateString(locale === "zh" ? "zh-CN" : "fr-FR", {
    day: "numeric",
    month: "long",
  });

  return (
    <motion.div layout>
      <Card className="relative flex items-center gap-4">
        <span className="text-4xl">{item.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-semibold leading-tight">{item.title}</p>
          <p className="text-sm text-muted">
            {dateLabel}
            {item.recurring && years > 0 ? ` · ${t("years", { count: years })}` : ""}
          </p>
        </div>
        <div className="pr-4 text-right">
          {days === 0 ? (
            <span className="font-display text-lg font-bold text-primary">{t("today")}</span>
          ) : (
            <>
              <span className="font-display text-2xl font-bold text-primary">{days}</span>
              <span className="block text-xs text-muted">{t("daysLeft")}</span>
            </>
          )}
        </div>
        <button
          type="button"
          aria-label={t("delete")}
          onClick={() => del.mutate(item.id)}
          className="absolute right-2 top-2 text-muted/50 transition-colors hover:text-busy"
        >
          <Trash2 className="size-4" />
        </button>
      </Card>
    </motion.div>
  );
}
