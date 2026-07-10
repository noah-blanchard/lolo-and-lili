"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, Trash2 } from "lucide-react";
import { useDeleteChore, useToggleChore } from "@/hooks/use-chores";
import { useCouple } from "@/components/providers/couple-provider";
import { celebrate } from "@/lib/confetti";
import type { ChoreWithStatus } from "@/lib/chores";
import { cn } from "@/lib/utils";
import { springBouncy, springSnappy, tapScale } from "@/lib/motion";

export function ChoreCard({ chore }: { chore: ChoreWithStatus }) {
  const t = useTranslations("a11y");
  const toggle = useToggleChore();
  const del = useDeleteChore();
  const { me, partner } = useCouple();
  const done = chore.completed_today;

  const assignee =
    chore.assignee_id === me.id
      ? me
      : chore.assignee_id && chore.assignee_id === partner?.id
        ? partner
        : null;

  function onToggle() {
    if (!done) celebrate();
    toggle.mutate(chore.id);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-cute bg-surface p-3 shadow-soft transition-opacity",
        done && "opacity-60",
      )}
    >
      <motion.button
        whileTap={tapScale}
        transition={springBouncy}
        onClick={onToggle}
        aria-label={t("toggle")}
        animate={{
          backgroundColor: done ? "var(--free)" : "rgba(0,0,0,0)",
          borderColor: done ? "var(--free)" : "var(--border)",
        }}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-white",
        )}
      >
        <AnimatePresence>
          {done && (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={springSnappy}
            >
              <Check className="size-5" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-semibold", done && "line-through")}>
          {chore.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted">
          {assignee && <span>{assignee.avatar_emoji ?? "🐣"}</span>}
          {chore.points > 0 && <span>+{chore.points} 🪙</span>}
        </div>
      </div>

      <button
        onClick={() => del.mutate(chore.id)}
        aria-label={t("delete")}
        className="p-1.5 text-muted/50 transition-colors hover:text-busy"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
