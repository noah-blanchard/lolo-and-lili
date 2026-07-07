"use client";

import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { usePetMemories } from "@/hooks/use-pet";
import type { PetMemory } from "@/lib/supabase/types";
import { timeAgo } from "@/lib/dates";
import { Card, CardTitle } from "@/components/ui/card";
import { popIn } from "@/lib/motion";

type T = ReturnType<typeof useTranslations>;

function label(t: T, m: PetMemory): string {
  const meta = (m.meta ?? {}) as Record<string, unknown>;
  switch (m.kind) {
    case "adopted":
      return t("memory.adopted", { name: m.title });
    case "stageUp":
      return t("memory.stageUp");
    case "unlock":
      return t("memory.unlock");
    case "streak":
      return t("memory.streak", { count: String(meta.streak ?? "") });
    case "recovered":
      return t("memory.recovered");
    default:
      return m.title;
  }
}

export function PetMemories() {
  const t = useTranslations("pet");
  const locale = useLocale();
  const { data: memories } = usePetMemories();

  if (!memories || memories.length === 0) return null;

  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>{t("memoriesTitle")}</CardTitle>
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {memories.map((m) => (
            <motion.li
              key={m.id}
              variants={popIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className="flex items-center gap-3 rounded-cute bg-surface-muted px-3 py-2"
            >
              <span className="text-xl">{m.emoji}</span>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                {label(t, m)}
              </p>
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
