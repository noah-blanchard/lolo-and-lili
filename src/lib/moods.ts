/** The fixed set of cute mood faces. Stored by `key`; emoji rendered in UI. */
export const MOODS = [
  { key: "happy", emoji: "😊" },
  { key: "loved", emoji: "🥰" },
  { key: "calm", emoji: "😌" },
  { key: "excited", emoji: "🤩" },
  { key: "tired", emoji: "😴" },
  { key: "meh", emoji: "😐" },
  { key: "sad", emoji: "😢" },
  { key: "stressed", emoji: "😩" },
] as const;

export type MoodKey = (typeof MOODS)[number]["key"];

export const MOOD_KEYS = MOODS.map((m) => m.key) as [MoodKey, ...MoodKey[]];

export function moodEmoji(key: string): string {
  return MOODS.find((m) => m.key === key)?.emoji ?? "🌸";
}
