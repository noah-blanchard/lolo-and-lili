import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { webpush } from "@/lib/notifications/web-push";
import { buildPayload, CATEGORY_OF, type NotifyKey } from "@/lib/notifications/messages";

interface NotifyPartnerParams {
  /** The user who performed the action (never notified about their own action). */
  actorId: string;
  coupleId: string;
  message: NotifyKey;
  /** Interpolated into the copy (e.g. chore title, mood emoji). */
  extra?: string;
}

/**
 * Push `message` to every partner device that hasn't muted its category.
 * Best-effort by contract: it swallows all errors so a push failure can never
 * break the mutation that triggered it (same shape as pets `rewardFromChore`).
 * Uses the service-role client to cross the RLS boundary into the partner's rows.
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

      for (const sub of subs) {
        const payload = JSON.stringify(
          buildPayload(params.message, sub.locale, { actor: actorName, extra: params.extra }),
        );
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
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
