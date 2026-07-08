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
    };
    return cfg;
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
