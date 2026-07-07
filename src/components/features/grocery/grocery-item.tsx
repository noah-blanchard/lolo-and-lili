"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Check, Trash2 } from "lucide-react";
import { vibrate } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useDeleteGrocery, useToggleGrocery } from "@/hooks/use-grocery";
import type { GroceryItem as GroceryItemRow } from "@/lib/supabase/types";

export function GroceryItem({ item }: { item: GroceryItemRow }) {
  const t = useTranslations("grocery");
  const toggle = useToggleGrocery();
  const del = useDeleteGrocery();

  function onToggle() {
    vibrate(15);
    toggle.mutate(item.id);
  }

  return (
    <motion.div layout>
      <Card className="flex items-center gap-3 py-3">
        <button
          type="button"
          aria-label={t("toggle")}
          onClick={onToggle}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            item.checked ? "border-primary bg-primary text-white" : "border-border",
          )}
        >
          {item.checked && <Check className="size-4" strokeWidth={3} />}
        </button>
        <span className={cn("flex-1 font-medium", item.checked && "text-muted line-through")}>
          {item.name}
        </span>
        {item.quantity && (
          <span className="text-sm text-muted">{item.quantity}</span>
        )}
        <button
          type="button"
          aria-label={t("delete")}
          onClick={() => del.mutate(item.id)}
          className="text-muted/50 transition-colors hover:text-busy"
        >
          <Trash2 className="size-4" />
        </button>
      </Card>
    </motion.div>
  );
}
