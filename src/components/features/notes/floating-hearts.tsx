"use client";

import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface FloatingHeartsHandle {
  burst: () => void;
}

const HEART_EMOJIS = ["💕", "💗", "💖", "❤️", "🥰", "💞"];
let uid = 0;

/** A full-screen overlay that floats a burst of hearts upward on `burst()`. */
export const FloatingHearts = forwardRef<FloatingHeartsHandle>(
  function FloatingHearts(_props, ref) {
    const [hearts, setHearts] = useState<{ id: number; x: number; emoji: string }[]>([]);

    const burst = useCallback(() => {
      const batch = Array.from({ length: 6 }, () => ({
        id: uid++,
        x: Math.random() * 120 - 60,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      }));
      setHearts((h) => [...h, ...batch]);
    }, []);

    useImperativeHandle(ref, () => ({ burst }), [burst]);

    const remove = (id: number) =>
      setHearts((h) => h.filter((x) => x.id !== id));

    return (
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.span
              key={h.id}
              initial={{ opacity: 0, y: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 1, 0], y: -560, scale: 1.2 }}
              transition={{ duration: 2.4, ease: "easeOut" }}
              onAnimationComplete={() => remove(h.id)}
              className="absolute bottom-28 text-3xl"
              style={{ left: `calc(50% + ${h.x}px)` }}
            >
              {h.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    );
  },
);
