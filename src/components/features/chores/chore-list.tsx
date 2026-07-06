"use client";

import { AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { useChores } from "@/hooks/use-chores";
import { ChoreCard } from "./chore-card";
import { AddChore } from "./add-chore";
import { Card, CardDescription } from "@/components/ui/card";

export function ChoreList() {
  const t = useTranslations("chores");
  const { data: chores } = useChores();

  // Unfinished first, completed sink to the bottom.
  const sorted = [...(chores ?? [])].sort(
    (a, b) => Number(a.completed_today) - Number(b.completed_today),
  );

  return (
    <div className="flex flex-col gap-4">
      <AddChore />

      {sorted.length === 0 ? (
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
