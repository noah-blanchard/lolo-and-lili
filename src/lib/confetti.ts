import confetti from "canvas-confetti";

const CUTE_COLORS = ["#ff8fa3", "#9ee6cf", "#ffd670", "#c3b1e1"];

/**
 * Whether celebratory confetti is suppressed. Set by the reduced-motion
 * provider (module-level, mirroring `feedback.ts`'s `muted` flag) so bursts stay
 * SSR/hydration-safe and every `celebrate*` call is a no-op under reduced motion.
 */
let motionReduced = false;

export function setConfettiReduced(next: boolean): void {
  motionReduced = next;
}

/** A small, joyful confetti burst. Client-only. */
export function celebrate() {
  if (motionReduced) return;
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 32,
    scalar: 0.9,
    origin: { y: 0.75 },
    colors: CUTE_COLORS,
  });
}

/** A bigger, wider burst for headline moments (settle-up, level-up). */
export function celebrateBig() {
  if (motionReduced) return;
  confetti({
    particleCount: 140,
    spread: 110,
    startVelocity: 45,
    scalar: 1.1,
    origin: { y: 0.7 },
    colors: CUTE_COLORS,
  });
}

/**
 * Burst originating at a screen point (viewport pixels) — e.g. the tapped
 * coupon. Converts to canvas-confetti's normalized 0–1 origin.
 */
export function celebrateFrom(x: number, y: number) {
  if (motionReduced) return;
  if (typeof window === "undefined") return;
  confetti({
    particleCount: 80,
    spread: 80,
    startVelocity: 34,
    scalar: 0.95,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: CUTE_COLORS,
  });
}
