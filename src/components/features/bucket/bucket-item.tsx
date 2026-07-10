"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, Trash2 } from "lucide-react";
import { celebrate } from "@/lib/confetti";
import { vibrate } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { springSnappy, tapScale } from "@/lib/motion";
import { useDeleteBucket, useToggleBucket } from "@/hooks/use-bucket";
import type { BucketItem as BucketItemRow } from "@/lib/supabase/types";

export function BucketItem({ item }: { item: BucketItemRow }) {
  const t = useTranslations("bucket");
  const toggle = useToggleBucket();
  const del = useDeleteBucket();

  function onToggle() {
    if (!item.done) {
      celebrate();
      vibrate(20);
    }
    toggle.mutate(item.id);
  }

  return (
    <motion.div layout>
      <Card className="flex items-center gap-3">
        <motion.button
          type="button"
          aria-label={t("toggle")}
          onClick={onToggle}
          whileTap={tapScale}
          animate={{
            backgroundColor: item.done ? "var(--primary)" : "rgba(0,0,0,0)",
            borderColor: item.done ? "var(--primary)" : "var(--border)",
          }}
          className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-white"
        >
          <AnimatePresence>
            {item.done && (
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
        <div className="min-w-0 flex-1">
          <p className={cn("font-semibold leading-tight", item.done && "text-muted line-through")}>
            {item.title}
          </p>
          {item.note && <p className="text-sm text-muted">{item.note}</p>}
        </div>
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
