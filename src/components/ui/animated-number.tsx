"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { useMotionPref } from "@/components/providers/motion-pref-provider";

/**
 * Rolls from the previous value to the new one (odometer/count-up). Used for
 * balances, treat counts, countdown digits, unread badges. Honors reduced
 * motion by snapping to the target instantly.
 */
export function AnimatedNumber({
  value,
  format,
  className,
  duration = 0.5,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const { reducedMotion } = useMotionPref();
  const [animated, setAnimated] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    // Reduced motion: skip the tween; `shown` renders the target directly.
    if (reducedMotion) {
      prev.current = value;
      return;
    }
    // onUpdate fires on animation frames (async), so this isn't a synchronous
    // setState-in-effect.
    const controls = animate(prev.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: setAnimated,
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration, reducedMotion]);

  const shown = reducedMotion ? value : animated;
  return (
    <span className={className}>
      {format ? format(shown) : Math.round(shown).toString()}
    </span>
  );
}
