"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { setConfettiReduced } from "@/lib/confetti";

interface MotionPrefContextValue {
  /** User override: force full motion even if the OS asks to reduce it. */
  forceFullMotion: boolean;
  setForceFullMotion: (next: boolean) => void;
  /** Effective reduced-motion state (OS asks to reduce AND no override). */
  reducedMotion: boolean;
}

const MotionPrefContext = createContext<MotionPrefContextValue | null>(null);

/**
 * Global motion policy. `<MotionConfig reducedMotion="user">` makes every
 * `motion/react` animation auto-soften for users whose OS requests reduced
 * motion. The in-app override flips it to `"never"` (full motion for anyone who
 * wants it). Confetti isn't governed by MotionConfig (it's a canvas), so we push
 * the effective reduced state into `setConfettiReduced` (mirrors feedback.ts mute).
 * The override persists in a cookie so the locale layout can SSR the initial value.
 */
export function MotionPrefProvider({
  initialForceFull = false,
  children,
}: {
  initialForceFull?: boolean;
  children: ReactNode;
}) {
  const [forceFullMotion, setForce] = useState(initialForceFull);
  const osReduced = useReducedMotion();
  const reducedMotion = !forceFullMotion && !!osReduced;

  useEffect(() => {
    setConfettiReduced(reducedMotion);
  }, [reducedMotion]);

  const setForceFullMotion = (next: boolean) => {
    setForce(next);
    document.cookie = `force-full-motion=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <MotionPrefContext.Provider
      value={{ forceFullMotion, setForceFullMotion, reducedMotion }}
    >
      <MotionConfig reducedMotion={forceFullMotion ? "never" : "user"}>
        {children}
      </MotionConfig>
    </MotionPrefContext.Provider>
  );
}

export function useMotionPref() {
  const ctx = useContext(MotionPrefContext);
  if (!ctx)
    throw new Error("useMotionPref must be used within a MotionPrefProvider");
  return ctx;
}
