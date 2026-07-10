"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { hoverScale, springBouncy, tapScale } from "@/lib/motion";

const MotionLink = motion.create(Link);

/**
 * Client motion wrapper for HubCard. Kept separate so `HubCard` can stay a
 * Server Component and render the lucide icon server-side — passing an icon
 * *component* across the server→client boundary isn't serializable, but passing
 * the already-rendered icon as `children` is.
 */
export function HubCardLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <MotionLink
      href={href}
      prefetch
      whileTap={tapScale}
      whileHover={hoverScale}
      transition={springBouncy}
      className={cn(
        "flex flex-col gap-2 rounded-cute bg-surface p-4 shadow-soft",
        className,
      )}
    >
      {children}
    </MotionLink>
  );
}
