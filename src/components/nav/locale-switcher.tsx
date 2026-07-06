"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { locales, type Locale } from "@/i18n/routing";

const labels: Record<Locale, string> = {
  fr: "FR",
  zh: "中文",
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  return (
    <SegmentedToggle
      value={locale}
      onChange={(next) =>
        startTransition(() => {
          // usePathname() from next-intl is locale-agnostic; router adds prefix.
          router.replace(pathname, { locale: next });
        })
      }
      options={locales.map((l) => ({ value: l, label: labels[l] }))}
      className="w-40"
    />
  );
}
