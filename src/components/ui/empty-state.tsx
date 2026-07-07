import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-cute bg-surface px-6 py-10 text-center shadow-soft",
        className,
      )}
    >
      <span className="text-4xl">{emoji}</span>
      <p className="font-display font-semibold">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
