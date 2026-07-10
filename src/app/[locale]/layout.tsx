import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Toaster } from "sonner";

import { routing } from "@/i18n/routing";
import { COLOR_THEMES, resolveColorTheme } from "@/lib/themes";
import { fontVariables } from "@/lib/fonts";
import { QueryProvider } from "@/components/providers/query-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return {
    title: t("name"),
    description: t("tagline"),
    applicationName: t("name"),
    appleWebApp: { capable: true, title: t("name"), statusBarStyle: "default" },
  };
}

// Dynamic so the browser/status-bar chrome matches the user's saved theme from
// first paint (the color-theme cookie is written client-side on theme change).
export async function generateViewport(): Promise<Viewport> {
  const cookieStore = await cookies();
  const theme = resolveColorTheme(cookieStore.get("color-theme")?.value);
  const bg = COLOR_THEMES.find((t) => t.key === theme)?.swatch[0] ?? "#fff7f0";
  return {
    themeColor: bg,
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  // SSR the color theme so dark-theme users don't flash the default peach
  // palette before hydration (F-030). The client applier keeps live switching.
  const cookieStore = await cookies();
  const colorTheme = resolveColorTheme(cookieStore.get("color-theme")?.value);
  const colorScheme =
    COLOR_THEMES.find((t) => t.key === colorTheme)?.mode ?? "light";

  return (
    <html
      lang={locale}
      className={fontVariables}
      data-color-theme={colorTheme}
      style={{ colorScheme }}
    >
      <body>
        <NextIntlClientProvider>
          <QueryProvider>{children}</QueryProvider>
          <Toaster position="top-center" richColors />
          <ServiceWorkerRegister />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
