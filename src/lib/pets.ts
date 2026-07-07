/**
 * "Our cat" — pure, shared tamagotchi logic (no Supabase here).
 * Wellbeing decays over time and is computed on read from the stored meter
 * values + `meters_at` (no cron exists). Both client and server import this so
 * optimistic UI and the authoritative write agree.
 */
import type { Pet } from "@/lib/supabase/types";

export type PetActionType =
  | "feed"
  | "pet"
  | "play"
  | "groom"
  | "heal"
  | "gift"
  | "cuddle"
  | "callback";

export type PetStatus = "ok" | "sick" | "away";
export type MeterKey = "hunger" | "affection" | "energy" | "cleanliness";
export type Meters = Record<MeterKey, number>;

export type PetEventKind =
  | "adopted"
  | "levelUp"
  | "stageUp"
  | "unlock"
  | "streak"
  | "recovered";

export interface PetEvent {
  kind: PetEventKind;
  value?: string; // e.g. accessory id, new level, streak count
}

/** A settled pet: stored row + live (decayed) meters, bond, and status. */
export interface PetState extends Pet {
  meters: Meters;
  bond: number;
  status: PetStatus;
}

/** What the client receives: settled state + per-action availability. */
export interface PetView extends PetState {
  cooldowns: Record<string, number>;
  cuddledToday: boolean;
  partnerCuddledToday: boolean;
}

/** Response of a care action: updated pet + milestone events for FX. */
export interface CareResult {
  pet: PetView;
  events: PetEvent[];
}

// --- Tuning (all in one place; tweak freely) --------------------------------

/** Meter points lost per hour. */
export const DECAY_PER_HOUR: Meters = {
  hunger: 4,
  affection: 2.5,
  energy: 3,
  cleanliness: 1.5,
};

/** How much each action refills, per meter. */
const REFILL: Partial<Record<PetActionType, Partial<Meters>>> = {
  feed: { hunger: 35 },
  pet: { affection: 30 },
  play: { energy: 30, affection: 8 },
  groom: { cleanliness: 40 },
  heal: { hunger: 20, affection: 20, energy: 20, cleanliness: 20 },
  gift: { affection: 25, energy: 15 },
  cuddle: { affection: 20, energy: 10 },
};

/** Cooldown between two actions of the same type (ms). 0 = no cooldown. */
export const COOLDOWN_MS: Record<PetActionType, number> = {
  feed: 3 * 3_600_000,
  pet: 30 * 60_000,
  play: 2 * 3_600_000,
  groom: 6 * 3_600_000,
  heal: 4 * 3_600_000,
  gift: 12 * 3_600_000,
  cuddle: 0, // gated to once/day/user instead
  callback: 0,
};

/** Treat cost (chore-earned currency). */
export const TREAT_COST: Partial<Record<PetActionType, number>> = {
  gift: 15,
  heal: 10,
};

const XP_PER_ACTION: Record<PetActionType, number> = {
  feed: 4,
  pet: 4,
  play: 5,
  groom: 4,
  heal: 6,
  gift: 8,
  cuddle: 10,
  callback: 12,
};

const XP_PER_LEVEL = 100;
/** Kitten (stage 1) grows into a cat (stage 2) at this level. */
const STAGE_UP_LEVEL = 6;
const SICK_BOND = 25;
const AWAY_BOND = 2;
/** How much a co-op call-back restores each meter to. */
const RECOVER_TO = 60;

export const SKINS = ["classic", "tuxedo", "ginger", "calico", "gray"] as const;
export type Skin = (typeof SKINS)[number];

export const SKIN_EMOJI: Record<Skin, string> = {
  classic: "🐶",
  tuxedo: "🐕‍🦺",
  ginger: "🐕",
  calico: "🐩",
  gray: "🦮",
};

/** Floating emoji shown when an action happens (own or partner's). */
export function reactionEmoji(type: PetActionType): string {
  switch (type) {
    case "feed":
      return "🍚";
    case "pet":
    case "cuddle":
      return "💕";
    case "play":
      return "✨";
    case "groom":
      return "🫧";
    case "gift":
      return "💖";
    case "heal":
      return "💗";
    case "callback":
      return "🏡";
    default:
      return "✨";
  }
}

export interface Accessory {
  id: string;
  slot: "hat" | "collar";
  emoji: string;
  unlock:
    | { by: "level"; value: number }
    | { by: "stage"; value: number }
    | { by: "streak"; value: number };
}

export const ACCESSORIES: Accessory[] = [
  { id: "bow", slot: "collar", emoji: "🎀", unlock: { by: "level", value: 2 } },
  { id: "party", slot: "hat", emoji: "🎉", unlock: { by: "streak", value: 3 } },
  { id: "flower", slot: "hat", emoji: "🌸", unlock: { by: "level", value: 4 } },
  { id: "bell", slot: "collar", emoji: "🔔", unlock: { by: "stage", value: 2 } },
  { id: "crown", slot: "hat", emoji: "👑", unlock: { by: "level", value: 10 } },
];

// --- Helpers ----------------------------------------------------------------

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

function hoursBetween(fromISO: string, now: Date): number {
  return Math.max(0, (now.getTime() - new Date(fromISO).getTime()) / 3_600_000);
}

export function levelForXp(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export function stageForLevel(level: number): number {
  return level >= STAGE_UP_LEVEL ? 2 : 1;
}

/** Weighted wellbeing (hunger + affection matter a little more). */
export function bondOf(m: Meters): number {
  const score =
    m.hunger * 1.2 + m.affection * 1.2 + m.energy * 0.8 + m.cleanliness * 0.8;
  return Math.round(score / 4);
}

/** Decay each meter from its stored value since `meters_at`. */
export function decayMeters(pet: Pet, now: Date): Meters {
  const h = hoursBetween(pet.meters_at, now);
  return {
    hunger: clamp(pet.hunger - DECAY_PER_HOUR.hunger * h),
    affection: clamp(pet.affection - DECAY_PER_HOUR.affection * h),
    energy: clamp(pet.energy - DECAY_PER_HOUR.energy * h),
    cleanliness: clamp(pet.cleanliness - DECAY_PER_HOUR.cleanliness * h),
  };
}

export function statusOf(pet: Pet, meters: Meters): PetStatus {
  const bond = bondOf(meters);
  if (pet.ran_away_at || bond <= AWAY_BOND) return "away";
  if (bond < SICK_BOND) return "sick";
  return "ok";
}

/** Settle a stored pet row into live display state. Pure; no persistence. */
export function settle(pet: Pet, now: Date = new Date()): PetState {
  const meters = decayMeters(pet, now);
  return { ...pet, meters, bond: bondOf(meters), status: statusOf(pet, meters) };
}

function unlockableAt(
  level: number,
  stage: number,
  streak: number,
  already: string[],
): string[] {
  return ACCESSORIES.filter((a) => {
    if (already.includes(a.id)) return false;
    if (a.unlock.by === "level") return level >= a.unlock.value;
    if (a.unlock.by === "stage") return stage >= a.unlock.value;
    return streak >= a.unlock.value;
  }).map((a) => a.id);
}

/**
 * Apply a care action to a stored pet. Pure: handles meters, xp, level, stage
 * and accessory unlocks. The service layer handles cooldowns, treat costs,
 * the once/day co-op cuddle streak, both-partner call-back, and persistence
 * (it passes the resulting `streakCount` so unlocks see the current streak).
 */
export function applyCare(
  pet: Pet,
  type: PetActionType,
  streakCount: number,
  now: Date = new Date(),
): { store: Partial<Pet>; events: PetEvent[] } {
  const events: PetEvent[] = [];
  const meters = decayMeters(pet, now);

  if (type === "callback") {
    // Coax the wanderer home — a co-op recovery.
    const recovered: Meters = {
      hunger: Math.max(meters.hunger, RECOVER_TO),
      affection: Math.max(meters.affection, RECOVER_TO),
      energy: Math.max(meters.energy, RECOVER_TO),
      cleanliness: Math.max(meters.cleanliness, RECOVER_TO),
    };
    events.push({ kind: "recovered" });
    return {
      store: { ...recovered, meters_at: now.toISOString(), ran_away_at: null },
      events,
    };
  }

  const refill = REFILL[type] ?? {};
  const next: Meters = {
    hunger: clamp(meters.hunger + (refill.hunger ?? 0)),
    affection: clamp(meters.affection + (refill.affection ?? 0)),
    energy: clamp(meters.energy + (refill.energy ?? 0)),
    cleanliness: clamp(meters.cleanliness + (refill.cleanliness ?? 0)),
  };

  const xp = pet.xp + XP_PER_ACTION[type];
  const level = levelForXp(xp);
  const stage = stageForLevel(level);
  if (level > pet.level) events.push({ kind: "levelUp", value: String(level) });
  if (stage > pet.stage) events.push({ kind: "stageUp", value: String(stage) });

  const already = Array.isArray(pet.unlocked) ? (pet.unlocked as string[]) : [];
  const newlyUnlocked = unlockableAt(level, stage, streakCount, already);
  for (const id of newlyUnlocked) events.push({ kind: "unlock", value: id });
  const unlocked = [...already, ...newlyUnlocked];

  return {
    store: {
      ...next,
      meters_at: now.toISOString(),
      xp,
      level,
      stage,
      unlocked,
      // Any care nudges a wanderer back toward home.
      ran_away_at: bondOf(next) > AWAY_BOND ? null : pet.ran_away_at,
    },
    events,
  };
}

/** Remaining cooldown (ms) for an action type given its last occurrence. */
export function cooldownRemaining(
  type: PetActionType,
  lastAtISO: string | null,
  now: Date = new Date(),
): number {
  if (!lastAtISO) return 0;
  const elapsed = now.getTime() - new Date(lastAtISO).getTime();
  return Math.max(0, COOLDOWN_MS[type] - elapsed);
}

/** The wellbeing meters shown in the UI, with their labels/emoji. */
export const METERS: { key: MeterKey; emoji: string }[] = [
  { key: "hunger", emoji: "🍚" },
  { key: "affection", emoji: "❤️" },
  { key: "energy", emoji: "🧶" },
  { key: "cleanliness", emoji: "🧼" },
];
