/**
 * Centralised TanStack Query keys. Keep every cache key here so realtime
 * reconcilers and mutations can invalidate/patch consistently.
 */
export const queryKeys = {
  status: () => ["status"] as const,
  chores: () => ["chores"] as const,
  chore: (id: string) => ["chores", id] as const,
  moods: () => ["moods"] as const,
  grocery: () => ["grocery"] as const,
  meals: () => ["meals"] as const,
  expenses: () => ["expenses"] as const,
  loveNotes: () => ["loveNotes"] as const,
  coupons: () => ["coupons"] as const,
  question: () => ["question"] as const,
  specialDates: () => ["specialDates"] as const,
  bucket: () => ["bucket"] as const,
  profile: () => ["profile"] as const,
  pet: () => ["pet"] as const,
  petMemories: () => ["pet", "memories"] as const,
} as const;
