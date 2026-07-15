"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import type { LottieRefCurrentProps } from "lottie-react";
import { useLottieJson } from "@/lib/use-lottie-json";
import { celebrateFrom } from "@/lib/confetti";
import { playSound, vibrate } from "@/lib/feedback";
import type { PetView } from "@/lib/pets";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type Phase = "walkIn" | "pooping" | "wait" | "cleaning" | "walkOut";

// Phase durations (ms). The walk lasts ~10s end to end (less if you tap early).
const WALK_IN = 2800;
const POOPING = 1200;
const WAIT_AUTO = 3500; // auto-clean fallback so it never stalls
const CLEANING = 650;
const WALK_OUT = 2400;

/**
 * Fullscreen "take the dog out" animation: the dog walks in from the left,
 * stops and poops, you tap the poop to clean it up, then it walks off and the
 * overlay closes. Follows the note-lightbox pattern (AnimatePresence rendered
 * unconditionally; inner content guarded by `open`) — see UI_ANIMATION_GOTCHAS.
 *
 * The scene lives in an inner component that only mounts while open, so its
 * phase/timeline state resets by remount — no reset effect needed.
 */
export function PetWalkOverlay({
  open,
  pet,
  onCleaned,
  onClose,
}: {
  open: boolean;
  pet: PetView;
  onCleaned: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("pet");
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="walk"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 overflow-hidden"
          aria-label={t("walk.title")}
          role="dialog"
        >
          <WalkScene pet={pet} onCleaned={onCleaned} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WalkScene({
  pet,
  onCleaned,
  onClose,
}: {
  pet: PetView;
  onCleaned: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("pet");
  const reduced = useReducedMotion();
  const walk = useLottieJson("/lottie/pet/walk-side.json");
  const poop = useLottieJson("/lottie/pet/poop.json");

  const [phase, setPhase] = useState<Phase>("walkIn");
  const [vw, setVw] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 360,
  );
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const cleanedRef = useRef(false);
  const onCleanedRef = useRef(onCleaned);
  onCleanedRef.current = onCleaned;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const cleanOnce = () => {
    if (!cleanedRef.current) {
      cleanedRef.current = true;
      onCleanedRef.current();
    }
  };

  // Track viewport width (subscribe pattern) for px-based locomotion.
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Reduced motion: skip the scene but still reset the meter.
  useEffect(() => {
    if (!reduced) return;
    cleanOnce();
    const id = setTimeout(() => onCloseRef.current(), 500);
    return () => clearTimeout(id);
  }, [reduced]);

  // Drive the phase timeline (all state changes fire from timers, not the body).
  useEffect(() => {
    if (reduced) return;
    let id: ReturnType<typeof setTimeout>;
    if (phase === "walkIn") {
      lottieRef.current?.play?.();
      id = setTimeout(() => setPhase("pooping"), WALK_IN);
    } else if (phase === "pooping") {
      lottieRef.current?.pause?.(); // freeze the leg cycle while squatting
      id = setTimeout(() => setPhase("wait"), POOPING);
    } else if (phase === "wait") {
      id = setTimeout(() => clean(), WAIT_AUTO);
    } else if (phase === "cleaning") {
      id = setTimeout(() => setPhase("walkOut"), CLEANING);
    } else {
      lottieRef.current?.play?.();
      id = setTimeout(() => onCloseRef.current(), WALK_OUT);
    }
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reduced]);

  function clean(e?: { clientX: number; clientY: number }) {
    if (phase !== "wait") return;
    cleanOnce();
    playSound("pop");
    vibrate(30);
    if (e) celebrateFrom(e.clientX, e.clientY);
    setPhase("cleaning");
  }

  function skip() {
    cleanOnce();
    onCloseRef.current();
  }

  // Locomotion + poop position, in px from the measured viewport width.
  const { dogW, dogX, dogDur, dogEase, poopLeft } = useMemo(() => {
    const w = vw || 360;
    const dw = Math.min(280, Math.max(180, w * 0.46));
    const stopX = w * 0.28;
    return {
      dogW: dw,
      dogX: phase === "walkIn" ? stopX : phase === "walkOut" ? w * 1.25 : stopX,
      dogDur:
        phase === "walkIn" ? WALK_IN / 1000 : phase === "walkOut" ? WALK_OUT / 1000 : 0,
      dogEase: (phase === "walkOut" ? "easeIn" : "linear") as "easeIn" | "linear",
      poopLeft: stopX + dw * 0.12,
    };
  }, [vw, phase]);

  const showPoop = phase === "pooping" || phase === "wait" || phase === "cleaning";
  const squatting = phase === "pooping" || phase === "wait";

  return (
    <>
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#bfe6ff] via-[#d9f0ff] to-[#eaf7e6]" />
      <motion.div
        className="absolute left-[10%] top-[14%] text-5xl opacity-80"
        animate={{ x: [0, 14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute right-[16%] top-[24%] text-4xl opacity-70"
        animate={{ x: [0, -12, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁️
      </motion.div>
      <span className="absolute right-[10%] top-[8%] text-5xl">☀️</span>

      {/* Grass */}
      <div className="absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-b from-[#a9dd8f] to-[#8ccf6f]" />
      <div className="absolute inset-x-0 bottom-[26%] h-[3px] bg-[#7cbf5f]/60" />

      {/* Skip / close */}
      <button
        onClick={skip}
        className="absolute right-4 top-4 z-20 rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-[#4a3b30] shadow"
      >
        {t("walk.skip")}
      </button>

      {/* Poop (clickable during wait) */}
      <AnimatePresence>
        {showPoop && (
          <motion.button
            key="poop"
            initial={{ scale: 0, y: 6 }}
            animate={{ scale: phase === "cleaning" ? 0 : 1, y: 0 }}
            exit={{ scale: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 18,
              delay: phase === "pooping" ? 0.4 : 0,
            }}
            onClick={(e) => clean(e)}
            disabled={phase !== "wait"}
            aria-label={t("walk.hint")}
            className="absolute z-10 h-16 w-16"
            style={{ left: poopLeft, bottom: "23%" }}
          >
            {poop ? (
              <Lottie animationData={poop} loop style={{ width: "100%", height: "100%" }} />
            ) : (
              <span className="text-4xl">💩</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tap hint */}
      <AnimatePresence>
        {phase === "wait" && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-[30%] text-center"
          >
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="inline-block rounded-full bg-white/80 px-4 py-2 text-base font-bold text-[#4a3b30] shadow"
            >
              {t("walk.hint")}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dog — outer div does locomotion, inner does the squat */}
      <motion.div
        className="absolute bottom-[22%]"
        style={{ left: 0, width: dogW }}
        initial={{ x: -vw * 0.5 }}
        animate={{ x: dogX }}
        transition={{ duration: dogDur, ease: dogEase }}
      >
        <motion.div
          animate={squatting ? { scaleY: 0.9, y: 6 } : { scaleY: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformOrigin: "50% 100%" }}
        >
          {walk ? (
            <Lottie
              lottieRef={lottieRef}
              animationData={walk}
              loop
              autoplay
              style={{ width: "100%", height: "auto" }}
            />
          ) : (
            <span className="text-6xl">🐕</span>
          )}
        </motion.div>
      </motion.div>

      <span className="sr-only">{pet.name}</span>
    </>
  );
}
