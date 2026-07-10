"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { popIn } from "@/lib/motion";

/** Friendly empty placeholder: big emoji + a line of copy (+ optional action). */
export function EmptyState({
  emoji,
  title,
  description,
  action,
  className,
}: {
  emoji: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={popIn}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col items-center gap-2 rounded-cute bg-surface px-6 py-10 text-center shadow-soft",
        className,
      )}
    >
      <motion.span
        className="text-4xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
      >
        {emoji}
      </motion.span>
      <p className="font-display font-semibold">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </motion.div>
  );
}
