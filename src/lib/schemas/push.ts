import { z } from "zod";

/** The four notification categories a user can independently mute. */
export const NOTIFY_CATEGORIES = ["chores", "moods", "status", "pet"] as const;
export type NotifyCategory = (typeof NOTIFY_CATEGORIES)[number];

/** Browser PushSubscription (from `subscription.toJSON()`) + the device locale. */
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  locale: z.string().min(2).max(5).default("fr"),
});
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

export const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
});
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;

export const notificationPrefsSchema = z.object({
  chores: z.boolean(),
  moods: z.boolean(),
  status: z.boolean(),
  pet: z.boolean(),
});
export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>;

/** Fallback when a profile has no prefs yet (mirrors the SQL column default). */
export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  chores: true,
  moods: true,
  status: true,
  pet: true,
};
