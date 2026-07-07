"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { apiFetch, jsonBody } from "@/lib/query/client";

/** Read a browser-only value without tripping the set-state-in-effect rule and
 *  without hydration mismatch (server render uses `serverValue`). */
const noopSubscribe = () => () => {};
function useClientValue<T>(get: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, get, () => serverValue);
}

/** VAPID public key → the Uint8Array `applicationServerKey` expects. Backed by
 *  an explicit ArrayBuffer so it satisfies BufferSource (not SharedArrayBuffer). */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as Mac; sniff touch support to catch it.
  const iPadOS = ua.includes("Mac") && "ontouchend" in document;
  return iOS || iPadOS;
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari-only legacy flag.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export interface PushState {
  /** Browser exposes the Push API + a service worker. */
  supported: boolean;
  /** Notification.permission ("default" | "granted" | "denied"). */
  permission: NotificationPermission;
  /** This device currently has an active subscription saved. */
  subscribed: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  /** iOS blocks push unless the app runs installed to the home screen. */
  iosNeedsInstall: boolean;
  busy: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  sendTest: () => Promise<void>;
}

export function usePush(): PushState {
  const locale = useLocale();
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  // Browser capabilities — read via useSyncExternalStore so we never call
  // setState synchronously in an effect (banned) and avoid hydration mismatch.
  const supported = useClientValue(
    () =>
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window,
    false,
  );
  const isIOS = useClientValue(detectIOS, false);
  const isStandalone = useClientValue(detectStandalone, false);
  const permission = useClientValue<NotificationPermission>(
    () => (typeof Notification === "undefined" ? "default" : Notification.permission),
    "default",
  );

  useEffect(() => {
    if (!supported) return;
    // Async — allowed inside an effect (not a synchronous setState).
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {});
  }, [supported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (busy) return false;
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!supported || !vapid) return false;
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      if (result !== "granted") return false;

      // Ensure the SW is registered even if the auto-register hasn't run yet.
      await navigator.serviceWorker.register("/sw.js").catch(() => {});
      const reg = await navigator.serviceWorker.ready;

      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid),
        }));

      await apiFetch("/api/push/subscribe", jsonBody({ ...sub.toJSON(), locale }));
      setSubscribed(true);
      return true;
    } finally {
      setBusy(false);
    }
  }, [busy, supported, locale]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (busy || !supported) return;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await apiFetch("/api/push/unsubscribe", jsonBody({ endpoint: sub.endpoint }));
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  }, [busy, supported]);

  const sendTest = useCallback(async (): Promise<void> => {
    await apiFetch("/api/push/test", { method: "POST" });
  }, []);

  return {
    supported,
    permission,
    subscribed,
    isIOS,
    isStandalone,
    iosNeedsInstall: isIOS && !isStandalone,
    busy,
    subscribe,
    unsubscribe,
    sendTest,
  };
}
