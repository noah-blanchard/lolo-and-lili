"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { springBouncy } from "@/lib/motion";

/** A cute pill toggle. Controlled via `checked` / `onChange`. */
export function Switch({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
        "disabled:opacity-40",
        checked ? "bg-primary" : "bg-surface-muted",
      )}
    >
      <motion.span
        className="absolute left-1 top-1 size-5 rounded-full bg-white shadow-soft"
        animate={{ x: checked ? 20 : 0 }}
        transition={springBouncy}
      />
    </button>
  );
}
