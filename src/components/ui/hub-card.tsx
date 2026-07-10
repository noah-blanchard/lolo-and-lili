import type { LucideIcon } from "lucide-react";
import { HubCardLink } from "./hub-card-link";

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
    <HubCardLink href={href} className={className}>
      <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Icon className="size-6" strokeWidth={2.2} />
      </span>
      <span className="font-display font-semibold leading-tight">{label}</span>
      {description && (
        <span className="text-xs text-muted leading-snug">{description}</span>
      )}
    </HubCardLink>
  );
}
