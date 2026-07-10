"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { celebrate } from "@/lib/confetti";
import { useClearChecked, useGrocery } from "@/hooks/use-grocery";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { staggerContainer, popIn } from "@/lib/motion";
import { AddGrocery } from "./add-grocery";
import { GroceryItem } from "./grocery-item";

export function GroceryList() {
  const t = useTranslations("grocery");
  const { data, isLoading } = useGrocery();
  const clear = useClearChecked();
  const unchecked = (data ?? []).filter((i) => !i.checked);
  const checked = (data ?? []).filter((i) => i.checked);

  function onClear() {
    celebrate();
    clear.mutate();
  }

  return (
    <div className="flex flex-col gap-5">
      <AddGrocery />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-cute bg-surface p-5 shadow-soft">
              <Skeleton className="size-5 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState emoji="🛒" title={t("empty")} description={t("emptyHint")} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-3">
          <AnimatePresence initial={false} mode="popLayout">
            {unchecked.map((i) => (
              <motion.div key={i.id} variants={popIn} exit="exit" layout>
                <GroceryItem item={i} />
              </motion.div>
            ))}
          </AnimatePresence>
          {checked.length > 0 && (
            <>
              <div className="flex items-center justify-between px-1 pt-2">
                <h2 className="text-sm font-semibold text-muted">{t("checkedTitle")}</h2>
                <button
                  type="button"
                  onClick={onClear}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {t("clear")}
                </button>
              </div>
              <AnimatePresence initial={false} mode="popLayout">
                {checked.map((i) => (
                  <motion.div key={i.id} variants={popIn} exit="exit" layout>
                    <GroceryItem item={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
