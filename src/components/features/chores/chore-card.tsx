"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Check, Trash2 } from "lucide-react";
import { useDeleteChore, useToggleChore } from "@/hooks/use-chores";
import { useCouple } from "@/components/providers/couple-provider";
import { celebrate } from "@/lib/confetti";
import type { ChoreWithStatus } from "@/lib/chores";
import { cn } from "@/lib/utils";
import { popIn, springBouncy, tapScale } from "@/lib/motion";

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
    <motion.div
      layout
      variants={popIn}
      initial="hidden"
      animate="visible"
      exit="exit"
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
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full border-2",
          done ? "border-free bg-free text-white" : "border-border",
        )}
      >
        {done && <Check className="size-5" strokeWidth={3} />}
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
    </motion.div>
  );
}
