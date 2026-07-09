"use client";

import { type HTMLAttributes } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { springBouncy } from "@/lib/motion";

type SpinnerSize = "sm" | "md" | "lg";

const sizeMap: Record<SpinnerSize, { px: number; border: number }> = {
  sm: { px: 16, border: 2 },
  md: { px: 24, border: 2.5 },
  lg: { px: 32, border: 3 },
};

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
}

export const Spinner = ({ size = "md", className, ...props }: SpinnerProps) => {
  const { px, border } = sizeMap[size];

  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <motion.div
        style={{
          width: px,
          height: px,
          borderWidth: border,
          borderStyle: "solid",
          borderColor: "var(--primary)",
          borderTopColor: "transparent",
          borderRadius: "9999px",
        }}
        animate={{ rotate: 360 }}
        transition={{ ...springBouncy, repeat: Infinity }}
      />
    </div>
  );
};
