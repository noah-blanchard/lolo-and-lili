/**
 * Cute avatar emojis + accent colors for profile customization.
 * The emoji / accent-key lists mirror the SQL arrays in
 * supabase/migrations/0002_profile_customization.sql — keep them in sync.
 */

export const AVATAR_EMOJIS = [
  "🐣", "🐥", "🐨", "🐸", "🦊", "🐰", "🐻", "🐼",
  "🐧", "🐙", "🦄", "🐝", "🐳", "🦋", "🐢", "🐌",
  "🌸", "🌷", "🌟", "💫", "💖", "🍑", "🍓", "🌈",
] as const;

export type AvatarEmoji = (typeof AVATAR_EMOJIS)[number];

export const ACCENTS = [
  { key: "coral", hex: "#ff8fa3" },
  { key: "mint", hex: "#9ee6cf" },
  { key: "sky", hex: "#8fbcff" },
  { key: "lavender", hex: "#c9a3ff" },
  { key: "peach", hex: "#ffb38f" },
  { key: "lemon", hex: "#ffd76b" },
  { key: "bubblegum", hex: "#ff9de0" },
  { key: "sage", hex: "#a8d5a2" },
] as const;

export type AccentKey = (typeof ACCENTS)[number]["key"];

export const ACCENT_KEYS = ACCENTS.map((a) => a.key) as [AccentKey, ...AccentKey[]];

const DEFAULT_ACCENT_HEX = "#ff8fa3"; // coral — matches the app's --primary

/** Resolve a stored accent key to a hex value, falling back to coral. */
export function accentHex(key: string | null | undefined): string {
  return ACCENTS.find((a) => a.key === key)?.hex ?? DEFAULT_ACCENT_HEX;
}
