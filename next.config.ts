import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    // Cache visited dynamic pages in the client Router Cache so revisiting a
    // page (within the window) is instant — no server round-trip, no repeat
    // loading.tsx skeleton. Row data stays live via TanStack Query + realtime,
    // so the cached RSC shell being a few minutes old is harmless.
    staleTimes: {
      dynamic: 300,
      static: 300,
    },
  },
  async headers() {
    return [
      {
        // Always revalidate the service worker so push/handler updates ship fast.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
