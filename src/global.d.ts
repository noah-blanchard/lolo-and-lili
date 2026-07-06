import type messages from "@/i18n/messages/fr.json";

// Typed message keys for useTranslations/getTranslations. We intentionally do
// NOT augment `Locale` here: Next.js' generated Page/LayoutProps type route
// params as `string`, and narrowing them would break the route validator.
declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages;
  }
}
