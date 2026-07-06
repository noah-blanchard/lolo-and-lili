import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "zh"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "fr",
  // Auto-detect from the Accept-Language header, falling back to French.
  localeDetection: true,
  // Always prefix the locale in the URL (/fr, /zh) for clarity & shareable links.
  localePrefix: "always",
});
