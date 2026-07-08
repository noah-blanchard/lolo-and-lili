"use client";

import { AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { useChores } from "@/hooks/use-chores";
import { ChoreCard } from "./chore-card";
import { AddChore } from "./add-chore";
import { Card, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChoreList() {
  const t = useTranslations("chores");
  const { data: chores, isLoading } = useChores();

  // Unfinished first, completed sink to the bottom.
  const sorted = [...(chores ?? [])].sort(
    (a, b) => Number(a.completed_today) - Number(b.completed_today),
  );

  return (
    <div className="flex flex-col gap-4">
      <AddChore />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-cute bg-surface p-5 shadow-soft">
              <Skeleton className="size-5 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardDescription>{t("empty")}</CardDescription>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {sorted.map((chore) => (
              <ChoreCard key={chore.id} chore={chore} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
