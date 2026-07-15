"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { ACCESSORIES, SKIN_EMOJI, type PetView } from "@/lib/pets";
import { useLottieJson } from "@/lib/use-lottie-json";

// Client-only Lottie player; falls back gracefully when no JSON is present.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type Base = "idle" | "sleep" | "sick" | "away" | "happy";

function baseState(pet: PetView): Base {
  if (pet.status === "away") return "away";
  if (pet.status === "sick") return "sick";
  if (pet.meters.energy < 25) return "sleep";
  return "idle";
}

function accessoryEmoji(id: string | null | undefined): string | null {
  if (!id) return null;
  return ACCESSORIES.find((a) => a.id === id)?.emoji ?? null;
}

const idleAnim: Record<Base, { y: number | number[]; rotate: number | number[] }> = {
  idle: { y: [0, -6, 0], rotate: 0 },
  sleep: { y: 0, rotate: [-3, 3, -3] },
  sick: { y: 0, rotate: [-1.5, 1.5, -1.5] },
  away: { y: 0, rotate: 0 },
  happy: { y: [0, -12, 0], rotate: 0 },
};

export function PetAvatar({
  pet,
  reaction,
  size = 128,
}: {
  pet: PetView;
  reaction?: { id: number; emoji: string } | null;
  size?: number;
}) {
  const state = baseState(pet);
  // Per-skin, per-stage, per-state slot (e.g. "classic-2-happy"). Missing slots
  // (e.g. the "away" basket) fall back to the animated emoji pet below.
  const lottie = useLottieJson(
    state === "away" ? null : `/lottie/pet/${pet.skin}-${pet.stage}-${state}.json`,
  );
  const equipped = (pet.equipped ?? {}) as Record<string, string | null>;
  const hatId = equipped.hat ?? null;
  const collarId = equipped.collar ?? null;
  // Vector accessories are registered to the pet's head/neck on the same 256
  // canvas, so they only line up when the vector pet is on screen. When we fall
  // back to the emoji pet, use the emoji accessory spans instead.
  const vectorMode = !!lottie;
  const hatJson = useLottieJson(vectorMode && hatId ? `/lottie/accessory/${hatId}.json` : null);
  const collarJson = useLottieJson(vectorMode && collarId ? `/lottie/accessory/${collarId}.json` : null);
  const hat = accessoryEmoji(hatId);
  const collar = accessoryEmoji(collarId);
  const catEmoji = SKIN_EMOJI[pet.skin as keyof typeof SKIN_EMOJI] ?? "🐶";
  // Puppies (stage 1) are drawn shrunk about (128,150) on the pet canvas; match
  // that so hats/collars sit on the smaller body. (58% ≈ 150/256.)
  const stageStyle =
    pet.stage === 1
      ? ({ transform: "scale(0.9)", transformOrigin: "50% 58%" } as const)
      : undefined;
  // Gentle bob that keeps accessories glued to the bobbing pet, per state.
  const accBob = idleAnim[state];
  const accTransition = {
    duration: state === "happy" ? 0.5 : 2.4,
    repeat: Infinity,
    ease: "easeInOut",
  } as const;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Floating reaction burst (hearts / 🍚 / Zzz …) */}
      <AnimatePresence>
        {reaction && (
          <motion.span
            key={reaction.id}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -size * 0.55, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 text-2xl"
          >
            {reaction.emoji}
          </motion.span>
        )}
      </AnimatePresence>

      {state === "away" ? (
        <div className="flex flex-col items-center gap-1 text-center opacity-60">
          <span style={{ fontSize: size * 0.4 }}>🧺</span>
          <span className="text-sm">🐾 …</span>
        </div>
      ) : lottie ? (
        <Lottie animationData={lottie} loop style={{ width: size, height: size }} />
      ) : (
        <motion.div
          animate={idleAnim[state]}
          transition={{
            duration: state === "happy" ? 0.5 : 2.4,
            repeat: state === "happy" ? 0 : Infinity,
            ease: "easeInOut",
          }}
          style={{ fontSize: size * 0.62, lineHeight: 1 }}
          className={state === "sick" ? "grayscale-[0.4]" : undefined}
        >
          {catEmoji}
        </motion.div>
      )}

      {/* Accessory overlays — registered vector art worn on the pet, bobbing
          in sync. Falls back to emoji spans when the emoji pet is showing. */}
      {state !== "away" && vectorMode && (hatJson || collarJson) && (
        <div className="pointer-events-none absolute inset-0" style={stageStyle}>
          <motion.div
            className="absolute inset-0"
            animate={accBob}
            transition={accTransition}
          >
            {hatJson && (
              <Lottie
                animationData={hatJson}
                loop
                className="absolute inset-0"
                style={{ width: size, height: size }}
              />
            )}
            {collarJson && (
              <Lottie
                animationData={collarJson}
                loop
                className="absolute inset-0"
                style={{ width: size, height: size }}
              />
            )}
          </motion.div>
        </div>
      )}
      {!vectorMode && hat && state !== "away" && (
        <span
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{ top: size * 0.02, fontSize: size * 0.26 }}
        >
          {hat}
        </span>
      )}
      {!vectorMode && collar && state !== "away" && (
        <span
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{ bottom: size * 0.14, fontSize: size * 0.2 }}
        >
          {collar}
        </span>
      )}

      {/* Status badges */}
      {state === "sleep" && (
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3], y: [-2, -8, -2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute right-2 top-2 text-lg"
        >
          💤
        </motion.span>
      )}
      {state === "sick" && (
        <span className="absolute right-2 top-2 text-lg">🤒</span>
      )}
      <span className="sr-only">{pet.name}</span>
    </div>
  );
}
