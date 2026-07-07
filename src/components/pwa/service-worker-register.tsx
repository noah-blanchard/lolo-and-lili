"use client";

import { useEffect } from "react";

/**
 * Registers the service worker. Production always; in dev only when
 * NEXT_PUBLIC_SW_DEV=1 (so push can be tested on localhost — a secure context —
 * without the usual dev cache headaches).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    const enabled =
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_SW_DEV === "1";
    if (!enabled || !("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          /* registration failures are non-fatal */
        });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
