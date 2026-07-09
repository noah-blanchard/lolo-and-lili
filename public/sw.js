/* Lolo & Lili service worker — dependency-free, Turbopack-safe.
 * Handles: offline shell caching, static asset SWR, and Web Push (P4). */

const VERSION = "v2";
const CACHE = `lolo-lili-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to cache then the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL)),
      ),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});

// --- Web Push (wired up fully in P4) ---
self.addEventListener("push", (event) => {
  let payload = { title: "Lolo & Lili", body: "💕", url: "/" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    /* keep defaults */
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Prefer an already-open same-origin app window and NAVIGATE it to the
      // target, so the tap deep-links instead of just focusing whatever page was
      // last open (F-043). Fall back to opening a fresh window.
      const appClients = clients.filter((c) => {
        try {
          return new URL(c.url).origin === self.location.origin && "focus" in c;
        } catch {
          return false;
        }
      });
      const existing = appClients[0] || clients.find((c) => "focus" in c);
      if (existing) {
        return Promise.resolve(existing.navigate(target))
          .then((w) => (w || existing).focus())
          .catch(() => self.clients.openWindow(target));
      }
      return self.clients.openWindow(target);
    }),
  );
});
