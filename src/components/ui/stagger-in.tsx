"use client";

import { Children, type ReactNode } from "react";
import { motion } from "motion/react";
import { popIn, staggerContainer } from "@/lib/motion";

/**
 * Wraps a set of children in a staggered pop-in entrance. Each direct child is
 * wrapped in its own `popIn` motion element, so the container's flex/grid
 * classes still control layout (the wrappers become the flex/grid items).
 * Safe to feed server-rendered children — it only adds a client boundary.
 */
export function StaggerIn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {Children.toArray(children).map((child, i) => (
        <motion.div key={i} variants={popIn}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
