"use client";

import { AnimatePresence } from "motion/react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
