"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { ACCESSORIES, SKIN_EMOJI, type PetView } from "@/lib/pets";

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

/** Fetch a Lottie JSON for the current slot; null until/if present. */
function useLottie(slot: string): object | null {
  const [entry, setEntry] = useState<{ slot: string; data: object } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/lottie/pet/${slot}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (alive && json) setEntry({ slot, data: json as object });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [slot]);
  return entry && entry.slot === slot ? entry.data : null;
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
  const lottie = useLottie(`${pet.stage}-${state}`);
  const equipped = (pet.equipped ?? {}) as Record<string, string | null>;
  const hat = accessoryEmoji(equipped.hat);
  const collar = accessoryEmoji(equipped.collar);
  const catEmoji = SKIN_EMOJI[pet.skin as keyof typeof SKIN_EMOJI] ?? "🐶";

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

      {/* Accessory overlays */}
      {hat && (
        <span
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{ top: size * 0.02, fontSize: size * 0.26 }}
        >
          {hat}
        </span>
      )}
      {collar && state !== "away" && (
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
