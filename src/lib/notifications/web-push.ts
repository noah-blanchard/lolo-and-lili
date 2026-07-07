import "server-only";
import webpush from "web-push";

/**
 * VAPID-configured web-push singleton. Server-only — the private key must never
 * reach the browser. Configured once at module load from env.
 */
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:hello@lolo-lili.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? "",
);

export { webpush };
