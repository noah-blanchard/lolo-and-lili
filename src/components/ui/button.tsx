"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { springBouncy, tapScale } from "@/lib/motion";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-cute hover:brightness-105",
  secondary: "bg-secondary text-secondary-foreground hover:brightness-105",
  accent: "bg-accent text-accent-foreground hover:brightness-105",
  ghost: "bg-transparent text-foreground hover:bg-surface-muted",
  outline:
    "bg-surface text-foreground border border-border hover:bg-surface-muted",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-12 px-6 text-base gap-2",
  lg: "h-14 px-8 text-lg gap-2.5",
  icon: "h-12 w-12",
};

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        whileTap={disabled ? undefined : tapScale}
        transition={springBouncy}
        className={cn(
          "inline-flex select-none items-center justify-center rounded-cute font-display font-semibold",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
