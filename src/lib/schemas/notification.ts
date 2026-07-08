import { z } from "zod";
import { NOTIFY_CATEGORIES } from "./push";

export const NOTIFY_KEYS = [
  "chore_done",
  "mood",
  "status_busy",
  "status_free",
  "status_sieste",
  "pet_cuddle",
  "pet_callback",
  "love_note",
  "love_nudge",
  "nudge_miss",
  "nudge_love",
  "nudge_think",
  "nudge_kiss",
  "nudge_hug",
  "coupon_gifted",
  "coupon_redeemed",
  "question_answered",
  "date_today",
  "date_soon",
  "meal_assigned",
  "expense_added",
  "expense_settled",
] as const;
export type NotifyKey = (typeof NOTIFY_KEYS)[number];

export const notificationSchema = z.object({
  id: z.uuid(),
  couple_id: z.uuid(),
  recipient_id: z.uuid(),
  actor_id: z.uuid().nullish(),
  key: z.enum(NOTIFY_KEYS),
  category: z.enum(NOTIFY_CATEGORIES),
  title: z.string(),
  body: z.string(),
  target: z.string(),
  target_id: z.string().nullish(),
  read: z.boolean(),
  created_at: z.string(),
});
export type AppNotification = z.infer<typeof notificationSchema>;
