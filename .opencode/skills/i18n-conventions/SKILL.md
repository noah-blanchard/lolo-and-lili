---
name: i18n-conventions
description: next-intl usage patterns, locale handling, message file structure, and the fr-default convention
---

## What This Skill Covers

All user-facing copy goes through `next-intl`. The default locale is `fr` (French).
Do NOT assume English.

## Configuration

- Locales: `fr` (default), `zh`
- Locale prefix: always in URL (`/fr/...`, `/zh/...`)
- Routing: `src/i18n/routing.ts` defines `locales`, `defaultLocale`, `localePrefix`
- Navigation: `src/i18n/navigation.ts` exports locale-aware `Link`, `useRouter`, `usePathname`

## Client Components

```tsx
"use client";
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("feature");
  return <h1>{t("title")}</h1>;
}
```

## Server Components

```tsx
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("feature");
  return <h1>{t("title")}</h1>;
}
```

## Message File Structure

`src/i18n/messages/fr.json` and `src/i18n/messages/zh.json`:
```json
{
  "feature": {
    "title": "...",
    "description": "...",
    "actions": {
      "create": "...",
      "delete": "..."
    }
  }
}
```

Namespaces: `app`, `nav`, `home`, `status`, `chores`, `moods`, `notes`, `expenses`, `meals`, `grocery`, `bucket`, `dates`, `question`, `coupons`, `pet`, `auth`, `onboarding`, `profile`, `hub`, `notifications`, `common`.

## Rules

1. **Never hard-code** UI text in components.
2. **Always add keys to BOTH** `fr.json` and `zh.json`.
3. Default locale is `fr` — write copy in French first.
4. Use namespace-scoped keys: `t("namespace.key")`.
5. Interpolation: `t("greeting", { name })` → `Bonjour {name}!`.
6. Use locale-aware routing from `@/i18n/navigation` — not `next/link`.
