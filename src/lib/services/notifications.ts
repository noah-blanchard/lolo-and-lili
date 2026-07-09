import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { webpush } from "@/lib/notifications/web-push";
import { buildPayload, CATEGORY_OF, type NotifyKey } from "@/lib/notifications/messages";
import { ApiError, ErrorCode } from "@/lib/api/result";
import type { AppNotification } from "@/lib/schemas/notification";
import type { Database, Notification } from "@/lib/supabase/types";
import type { NotifyCategory } from "@/lib/schemas/push";

interface NotifyPartnerParams {
  /** The user who performed the action (never notified about their own action). */
  actorId: string;
  coupleId: string;
  message: NotifyKey;
  /** Interpolated into the copy (e.g. chore title, mood emoji). */
  extra?: string;
  /** Optional resource id for deep-linking the in-app entry (e.g. love-note id). */
  targetId?: string;
}

interface PersistNotificationParams {
  coupleId: string;
  recipientId: string;
  actorId: string;
  key: NotifyKey;
  category: NotifyCategory;
  title: string;
  body: string;
  target: string;
  targetId?: string | null;
}

/**
 * Insert an in-app notification row for one recipient, bypassing RLS via the
 * service-role client. Best-effort: a persist failure must never break the
 * mutation that triggered it (mirrors how pushes are sent).
 */
async function persistNotification(
  admin: SupabaseClient<Database>,
  params: PersistNotificationParams,
): Promise<void> {
  const { error } = await admin.from("notifications").insert({
    couple_id: params.coupleId,
    recipient_id: params.recipientId,
    actor_id: params.actorId,
    key: params.key,
    category: params.category,
    title: params.title,
    body: params.body,
    target: params.target,
    target_id: params.targetId ?? null,
  });
  if (error) {
    console.error("[persistNotification] insert failed:", error);
  }
}

/**
 * Push `message` to every partner device that hasn't muted its category.
 * Best-effort by contract: it swallows all errors so a push failure can never
 * break the mutation that triggered it (same shape as pets `rewardFromChore`).
 * Uses the service-role client to cross the RLS boundary into the partner's rows.
 *
 * Every push now also persists an in-app notification row (localized to the
 * recipient's device locale) so the in-app center mirrors what was pushed.
 */
export async function notifyPartner(params: NotifyPartnerParams): Promise<void> {
  try {
    const admin = createAdminClient();
    const category = CATEGORY_OF[params.message];

    const { data: members } = await admin
      .from("profiles")
      .select("id, display_name, notification_prefs")
      .eq("couple_id", params.coupleId);
    if (!members?.length) return;

    const actor = members.find((m) => m.id === params.actorId);
    const actorName = actor?.display_name?.trim() || "Ton amour";
    const partners = members.filter((m) => m.id !== params.actorId);

    for (const partner of partners) {
      const prefs = (partner.notification_prefs ?? {}) as Record<string, boolean>;
      if (prefs[category] === false) continue;

      const { data: subs } = await admin
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", partner.id);
      if (!subs?.length) continue;

      const locale = subs[0]?.locale ?? "fr";
      const payload = buildPayload(params.message, locale, {
        actor: actorName,
        extra: params.extra,
      });

      // Persist the in-app entry (best-effort) so it matches the push exactly.
      await persistNotification(admin, {
        coupleId: params.coupleId,
        recipientId: partner.id,
        actorId: params.actorId,
        key: params.message,
        category,
        title: payload.title,
        body: payload.body,
        target: payload.url,
        targetId: params.targetId ?? null,
      });

      for (const sub of subs) {
        const wirePayload = JSON.stringify({
          ...payload,
          targetId: params.targetId ?? null,
        });
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            wirePayload,
          );
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode;
          // 404/410 = subscription is gone; prune it so we stop retrying.
          if (code === 404 || code === 410) {
            await admin.from("push_subscriptions").delete().eq("id", sub.id);
          } else {
            console.error("[notifyPartner] send failed:", e);
          }
        }
      }
    }
  } catch (e) {
    console.error("[notifyPartner] error:", e);
  }
}

/**
 * Push `message` to EVERY member of a couple (no actor exclusion) — used by the
 * daily cron for countdown reminders. Best-effort; prunes dead subscriptions.
 */
export async function notifyCouple(params: {
  coupleId: string;
  message: NotifyKey;
  extra?: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const category = CATEGORY_OF[params.message];

    const { data: members } = await admin
      .from("profiles")
      .select("id, notification_prefs")
      .eq("couple_id", params.coupleId);
    if (!members?.length) return;

    for (const member of members) {
      const prefs = (member.notification_prefs ?? {}) as Record<string, boolean>;
      if (prefs[category] === false) continue;

      const { data: subs } = await admin
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", member.id);
      if (!subs?.length) continue;

      for (const sub of subs) {
        const payload = JSON.stringify(
          buildPayload(params.message, sub.locale, { actor: "", extra: params.extra }),
        );
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          );
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) {
            await admin.from("push_subscriptions").delete().eq("id", sub.id);
          } else {
            console.error("[notifyCouple] send failed:", e);
          }
        }
      }
    }
  } catch (e) {
    console.error("[notifyCouple] error:", e);
  }
}

/** List a recipient's notifications, newest first (capped at 100). */
export async function listNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return (data as Notification[] | null) ?? [];
}

/** Mark a single notification read (recipient-scoped). */
export async function markNotificationRead(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
): Promise<{ id: string }> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("recipient_id", userId);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { id };
}

/** Mark every unread notification read for a recipient. */
export async function markAllNotificationsRead(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ updated: number }> {
  const { error, count } = await supabase
    .from("notifications")
    .update({ read: true }, { count: "exact" })
    .eq("recipient_id", userId)
    .eq("read", false);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { updated: count ?? 0 };
}

/** Delete a single notification (recipient-scoped, for swipe-to-dismiss). */
export async function deleteNotification(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
): Promise<{ id: string }> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("recipient_id", userId);
  if (error) throw new ApiError(ErrorCode.INTERNAL, error.message);
  return { id };
}
