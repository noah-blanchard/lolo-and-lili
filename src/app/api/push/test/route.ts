import { defineRoute } from "@/lib/api/define-route";
import { rateLimit } from "@/lib/api/rate-limit";
import { webpush } from "@/lib/notifications/web-push";
import { buildTestPayload } from "@/lib/notifications/messages";
import { listOwnSubscriptions } from "@/lib/services/push";

export const runtime = "nodejs";

/** Send a test push to all of the caller's own devices. */
export const POST = defineRoute({
  handler: async ({ supabase, user }) => {
    // Self-amplification guard: 3 test pushes per minute.
    rateLimit(user.id, "push-test", { limit: 3, windowMs: 60 * 1000 });
    const subs = await listOwnSubscriptions(supabase, user);
    await Promise.all(
      subs.map((s) =>
        webpush
          .sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            // Localize per device using the subscription's saved locale.
            JSON.stringify(buildTestPayload(s.locale ?? "fr")),
          )
          .catch(() => {}),
      ),
    );
    return { sent: subs.length };
  },
});
