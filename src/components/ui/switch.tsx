"use client";

import { cn } from "@/lib/utils";

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
      <span
        className={cn(
          "absolute left-1 top-1 size-5 rounded-full bg-white shadow-soft transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
