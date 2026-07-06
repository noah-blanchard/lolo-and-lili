"use client";

import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { springBouncy } from "@/lib/motion";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  activeClassName?: string;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedToggleProps<T>) {
  const layoutId = useId();

  return (
    <div
      role="tablist"
      className={cn(
        "relative flex gap-1 rounded-cute bg-surface-muted p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className="relative flex-1 rounded-[1.25rem] px-4 py-2.5 text-sm font-semibold"
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={springBouncy}
                className={cn(
                  "absolute inset-0 rounded-[1.25rem] bg-surface shadow-soft",
                  option.activeClassName,
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex items-center justify-center gap-1.5 transition-colors",
                active ? "text-foreground" : "text-muted",
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
