"use client";

import { motion } from "motion/react";
import { springSoft } from "@/lib/motion";

// A template re-mounts on every navigation, so each page gets a soft
// pop-in transition instead of snapping in.
export default function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={springSoft}
    >
      {children}
    </motion.div>
  );
}
