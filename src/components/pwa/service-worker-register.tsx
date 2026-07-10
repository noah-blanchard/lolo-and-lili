"use client";

import { useEffect } from "react";

/**
 * Registers the service worker. Production always; in dev only when
 * NEXT_PUBLIC_SW_DEV=1 (so push can be tested on localhost — a secure context —
 * without the usual dev cache headaches).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const enabled =
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_SW_DEV === "1";

    // In dev with the SW disabled, a leftover service worker (e.g. registered by
    // a prior `next start` on localhost) keeps intercepting Turbopack HMR chunks
    // and can trap the page in a reload loop. Proactively unregister any existing
    // workers and drop their caches so dev is clean.
    if (!enabled) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      if (typeof caches !== "undefined") {
        caches
          .keys()
          .then((keys) =>
            Promise.all(
              keys.filter((k) => k.startsWith("lolo-lili-")).map((k) => caches.delete(k)),
            ),
          )
          .catch(() => {});
      }
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          /* registration failures are non-fatal */
        });
    };

    // If hydration finishes after `window.load` already fired (slow JS / fast
    // cached page), the listener would never run and the SW would silently never
    // register (F-027). Register immediately in that case.
    if (document.readyState === "complete") {
      onLoad();
      return;
    }
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
