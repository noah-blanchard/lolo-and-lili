import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** A tappable grid tile linking to a feature, used by the Maison/Nous hubs. */
export function HubCard({
  href,
  label,
  description,
  icon: Icon,
  className,
}: {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col gap-2 rounded-cute bg-surface p-4 shadow-soft transition-transform active:scale-95",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Icon className="size-6" strokeWidth={2.2} />
      </span>
      <span className="font-display font-semibold leading-tight">{label}</span>
      {description && (
        <span className="text-xs text-muted leading-snug">{description}</span>
      )}
    </Link>
  );
}
