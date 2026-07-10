"use client";

import { type HTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { spinLinear } from "@/lib/motion";

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
  const t = useTranslations("a11y");

  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      role="status"
      aria-label={t("loading")}
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
        transition={spinLinear}
      />
    </div>
  );
};
