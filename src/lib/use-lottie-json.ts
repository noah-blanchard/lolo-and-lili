"use client";

import { useEffect, useState } from "react";

// Module-level cache so repeated mounts / slot flips reuse already-fetched JSON
// instead of re-fetching every time (F-025).
const lottieCache = new Map<string, object>();

/** Fetch a Lottie JSON by URL; null until/if present. Pass null to skip. */
export function useLottieJson(url: string | null): object | null {
  const [, bump] = useState(0);
  useEffect(() => {
    if (!url || lottieCache.has(url)) return;
    let alive = true;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json) return;
        lottieCache.set(url, json as object);
        if (alive) bump((n) => n + 1);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url]);
  return url ? (lottieCache.get(url) ?? null) : null;
}
