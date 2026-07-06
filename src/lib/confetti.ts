import confetti from "canvas-confetti";

const CUTE_COLORS = ["#ff8fa3", "#9ee6cf", "#ffd670", "#c3b1e1"];

/** A small, joyful confetti burst. Client-only. */
export function celebrate() {
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 32,
    scalar: 0.9,
    origin: { y: 0.75 },
    colors: CUTE_COLORS,
  });
}
