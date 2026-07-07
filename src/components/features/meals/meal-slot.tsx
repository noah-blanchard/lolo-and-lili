"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { MealEditor } from "./meal-editor";
import type { MealSlot as Slot } from "@/lib/schemas/meal";
import type { Meal } from "@/lib/supabase/types";

export function MealSlot({
  date,
  slot,
  meal,
}: {
  date: string;
  slot: Slot;
  meal: Meal | null;
}) {
  const t = useTranslations("meals");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-cute bg-surface-muted px-3 py-2 text-left"
      >
        <span className="w-16 shrink-0 text-xs font-semibold uppercase text-muted">
          {t(`slots.${slot}`)}
        </span>
        <span className={cn("flex-1 truncate text-sm", !meal && "text-muted/60")}>
          {meal?.title ?? t("addMeal")}
        </span>
      </button>
      <MealEditor date={date} slot={slot} meal={meal} open={open} onOpenChange={setOpen} />
    </>
  );
}
