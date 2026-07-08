/**
 * Quick affection "nudges" — one-tap pings a partner sends from the home screen.
 * Shared between client (buttons, countdown) and server (cooldown, push copy).
 */
export const NUDGE_KINDS = ["miss", "love", "think", "kiss", "hug"] as const;
export type NudgeKind = (typeof NUDGE_KINDS)[number];

/** One send per kind per this window (per user). */
export const NUDGE_COOLDOWN_MS = 10 * 60_000;

export const NUDGE_EMOJI: Record<NudgeKind, string> = {
  miss: "🥺",
  love: "❤️",
  think: "💭",
  kiss: "😘",
  hug: "🤗",
};

/** Remaining cooldown (ms) per kind for the current user. 0 = ready. */
export interface NudgeState {
  cooldowns: Record<NudgeKind, number>;
}
