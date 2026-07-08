import type { StorybookConfig } from "@storybook/react-vite";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
  addons: [getAbsolutePath("@storybook/addon-a11y"), getAbsolutePath("@storybook/addon-docs")],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: async (cfg) => {
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias ?? {}),
      // Specific aliases MUST come before the catch-all `@` so they win.
      // next-intl navigation relies on the Next.js router, which does not exist
      // in a plain Vite runtime. Mock it so Link-based components render as a
      // plain anchor without touching app source.
      "@/i18n/navigation": path.resolve(here, "../src/mocks/navigation.tsx"),
      "next-intl/navigation": path.resolve(here, "../src/mocks/navigation.tsx"),
      // Feature components read data from these hooks; alias them to mock
      // modules so stories render with static fixtures (no Supabase/network).
      "@/hooks/use-moods": path.resolve(here, "../src/mocks/hooks/use-moods.ts"),
      "@/hooks/use-pet": path.resolve(here, "../src/mocks/hooks/use-pet.ts"),
      "@/hooks/use-nudge": path.resolve(here, "../src/mocks/hooks/use-nudge.ts"),
      "@/hooks/use-coupons": path.resolve(here, "../src/mocks/hooks/use-coupons.ts"),
      "@/hooks/use-bucket": path.resolve(here, "../src/mocks/hooks/use-bucket.ts"),
      "@/hooks/use-chores": path.resolve(here, "../src/mocks/hooks/use-chores.ts"),
      "@/hooks/use-grocery": path.resolve(here, "../src/mocks/hooks/use-grocery.ts"),
      "@/hooks/use-expenses": path.resolve(here, "../src/mocks/hooks/use-expenses.ts"),
      "@/hooks/use-special-dates": path.resolve(here, "../src/mocks/hooks/use-special-dates.ts"),
      "@/hooks/use-meals": path.resolve(here, "../src/mocks/hooks/use-meals.ts"),
      "@/hooks/use-statuses": path.resolve(here, "../src/mocks/hooks/use-statuses.ts"),
      "@/hooks/use-notifications": path.resolve(here, "../src/mocks/hooks/use-notifications.ts"),
      "@/hooks/use-question": path.resolve(here, "../src/mocks/hooks/use-question.ts"),
      "@/hooks/use-love-notes": path.resolve(here, "../src/mocks/hooks/use-love-notes.ts"),
      "@/hooks/use-push": path.resolve(here, "../src/mocks/hooks/use-push.ts"),
      // Realtime presence (no real channel in stories).
      "@/components/providers/realtime-provider": path.resolve(here, "../src/mocks/realtime-provider.tsx"),
      // `server-only` guard used by server actions — no-op in Storybook.
      "server-only": path.resolve(here, "../src/mocks/empty.ts"),
      // Stub Supabase client + server action (server-only `next/cache`).
      "@/lib/supabase/client": path.resolve(here, "../src/mocks/supabase-client.ts"),
      "@/app/actions/profiles": path.resolve(here, "../src/mocks/actions-profiles.ts"),
      "@/app/actions/couples": path.resolve(here, "../src/mocks/actions-couples.ts"),
      // Catch-all: map `@` → the app `src`. Keep last so specific aliases win.
      "@": path.resolve(here, "../../src"),
    };

    cfg.define = {
      ...cfg.define,
      "process.env": JSON.stringify({}),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
    };

    return cfg;
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
