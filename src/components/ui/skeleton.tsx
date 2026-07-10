"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Loading placeholder with a shimmer sweep (replaces `animate-pulse`). Under
 * reduced motion the sweep is disabled by the global MotionConfig and it reads
 * as a plain muted block.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-cute bg-surface-muted",
        className,
      )}
      {...props}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  );
}
