"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { overlayFade, popIn } from "@/lib/motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  className?: string;
  /** Accessible label for the dialog. */
  ariaLabel?: string;
}

/**
 * Generic centered dialog with an animated backdrop + content.
 *
 * Follows docs/UI_ANIMATION_GOTCHAS.md: `AnimatePresence` is rendered
 * unconditionally (no early `return null` before it) and the visibility is
 * guarded *inside* via `{open && ...}`, so the exit variants always play.
 */
export function Modal({ open, onClose, children, className, ariaLabel }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={overlayFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            variants={popIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative z-10 w-full max-w-md rounded-cute bg-background p-6 shadow-cute",
              className,
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
