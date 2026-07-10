"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, Trash2 } from "lucide-react";
import { celebrate } from "@/lib/confetti";
import { vibrate } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { springSnappy, tapScale } from "@/lib/motion";
import { useDeleteGrocery, useToggleGrocery } from "@/hooks/use-grocery";
import type { GroceryItem as GroceryItemRow } from "@/lib/supabase/types";

export function GroceryItem({ item }: { item: GroceryItemRow }) {
  const t = useTranslations("grocery");
  const toggle = useToggleGrocery();
  const del = useDeleteGrocery();

  function onToggle() {
    if (!item.checked) {
      celebrate();
      vibrate(15);
    }
    toggle.mutate(item.id);
  }

  return (
    <motion.div layout>
      <Card className="flex items-center gap-3 py-3">
        <motion.button
          type="button"
          aria-label={t("toggle")}
          onClick={onToggle}
          whileTap={tapScale}
          animate={{
            backgroundColor: item.checked ? "var(--primary)" : "rgba(0,0,0,0)",
            borderColor: item.checked ? "var(--primary)" : "var(--border)",
          }}
          className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-white"
        >
          <AnimatePresence>
            {item.checked && (
              <motion.span
                key="check"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={springSnappy}
              >
                <Check className="size-4" strokeWidth={3} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        <span className={cn("flex-1 font-medium", item.checked && "text-muted line-through")}>
          {item.name}
        </span>
        {item.quantity && (
          <span className="text-sm text-muted">{item.quantity}</span>
        )}
        <motion.button
          type="button"
          aria-label={t("delete")}
          whileTap={tapScale}
          onClick={() => del.mutate(item.id)}
          className="text-muted/50 transition-colors hover:text-busy"
        >
          <Trash2 className="size-4" />
        </motion.button>
      </Card>
    </motion.div>
  );
}
