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

/** Fast, high-stiffness spring for check/toggle affordances. */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 700,
  damping: 22,
  mass: 0.5,
};

/**
 * Duration-based transition for 3-keyframe "pop" arrays (scale/y overshoot →
 * settle). Springs only support two keyframes, so multi-keyframe pops must be
 * tween-driven; `times` + segmented easing keep the crisp overshoot the frames
 * were authored for. Use wherever a value animates through three keyframes.
 */
export const keyframePop: Transition = {
  duration: 0.4,
  times: [0, 0.55, 1],
  ease: ["easeOut", "easeInOut"],
};

/**
 * Canonical list-row enter/exit. Same intent as `popIn` but tuned for rows that
 * add/remove/reorder inside an `AnimatePresence` + `layout` list. Use this as the
 * one variant every feature list shares.
 */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springBouncy },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

/**
 * Checkbox/tick fill — overshoots then settles. Drive with `animate` when a
 * boolean flips (chores/grocery/bucket completion).
 */
export const checkPop: Variants = {
  unchecked: { scale: 1 },
  checked: { scale: [1, 1.25, 1], transition: keyframePop },
};

/**
 * SVG path draw-on. Apply to a `motion.path`/`motion.line` with `initial="hidden"`
 * `animate="visible"` — used for checkmarks and strikethroughs that "draw".
 */
export const drawCheck: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.3, ease: "easeOut" }, opacity: { duration: 0.05 } },
  },
};

/**
 * Element launches up + shrinks + fades — for "logged/sent" confirmations
 * (mood select, nudge send).
 */
export const flyUp: Variants = {
  initial: { opacity: 1, y: 0, scale: 1 },
  animate: {
    opacity: 0,
    y: -80,
    scale: 0.4,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/** Slow overlay fade for dim backdrops (see UI_ANIMATION_GOTCHAS.md). */
export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.7 } },
};

/**
 * Emphatic celebratory pop for headline moments (coupon redeem, settle-up,
 * question reveal, pet level-up).
 */
export const celebratePop: Variants = {
  hidden: { scale: 0.6, opacity: 0, rotate: -6 },
  visible: {
    scale: [0.6, 1.12, 1],
    opacity: 1,
    rotate: [-6, 3, 0],
    transition: { duration: 0.5, ease: "easeOut" },
  },
};
