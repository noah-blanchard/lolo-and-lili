import type { Transition, Variants } from "motion/react";

/** Bouncy spring for taps/toggles — the signature "cute" feel. */
export const springBouncy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 18,
  mass: 0.6,
};

/** Softer spring for layout & page transitions. */
export const springSoft: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
};

/** Steady infinite rotation for spinners. */
export const spinLinear: Transition = {
  type: "tween",
  duration: 0.8,
  ease: "linear",
  repeat: Infinity,
};

/** Tap/press feedback for interactive elements. */
export const tapScale = { scale: 0.94 } as const;
export const hoverScale = { scale: 1.03 } as const;

/** Joyful pop-in for cards / list items. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: springBouncy },
  exit: { opacity: 0, scale: 0.9, y: 8, transition: springSoft },
};

/** Staggered container for lists of popIn children. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
