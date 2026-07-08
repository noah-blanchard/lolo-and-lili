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
      "@": path.resolve(here, "../../src"),
      // next-intl navigation relies on the Next.js router, which does not exist
      // in a plain Vite runtime. Mock it so HubCard (and future Link-based
      // components) render as a plain anchor without touching app source.
      "@/i18n/navigation": path.resolve(here, "./src/mocks/navigation.tsx"),
      // Feature components read data from these hooks; alias them to mock
      // modules so stories render with static fixtures (no Supabase/network).
      "@/hooks/use-moods": path.resolve(here, "./src/mocks/hooks/use-moods.ts"),
      "@/hooks/use-pet": path.resolve(here, "./src/mocks/hooks/use-pet.ts"),
      "@/hooks/use-nudge": path.resolve(here, "./src/mocks/hooks/use-nudge.ts"),
      "@/hooks/use-coupons": path.resolve(here, "./src/mocks/hooks/use-coupons.ts"),
      "@/hooks/use-bucket": path.resolve(here, "./src/mocks/hooks/use-bucket.ts"),
      "@/hooks/use-chores": path.resolve(here, "./src/mocks/hooks/use-chores.ts"),
      "@/hooks/use-grocery": path.resolve(here, "./src/mocks/hooks/use-grocery.ts"),
      "@/hooks/use-expenses": path.resolve(here, "./src/mocks/hooks/use-expenses.ts"),
      "@/hooks/use-special-dates": path.resolve(here, "./src/mocks/hooks/use-special-dates.ts"),
      "@/hooks/use-meals": path.resolve(here, "./src/mocks/hooks/use-meals.ts"),
      // Stub Supabase client + server action (server-only `next/cache`).
      "@/lib/supabase/client": path.resolve(here, "./src/mocks/supabase-client.ts"),
      "@/app/actions/profiles": path.resolve(here, "./src/mocks/actions-profiles.ts"),
    };
    return cfg;
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
