import React from "react";
import type { Decorator, Preview } from "@storybook/react-vite";

import "@fontsource/fredoka/400.css";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/500.css";
import "@fontsource/quicksand/600.css";

// Real design tokens (pastel themes, rounded radii, cute shadows) from the app.
import "../../src/app/globals.css";

// App-shell providers the feature components rely on (couple, intl, query, theme).
import { withAppProviders } from "../src/mocks/providers";

const THEMES = ["peach", "blue", "lilac", "mint", "midnight", "cocoa"] as const;

// next/font normally injects these; mirror them so font-family resolves in SB.
function useAppFonts() {
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--font-fredoka", "Fredoka");
    root.style.setProperty("--font-quicksand", "Quicksand");
  }, []);
}

const withTheme: Decorator = (Story, context) => {
  useAppFonts();
  const theme = (context.globals.theme as (typeof THEMES)[number]) ?? "peach";

  return (
    <div
      data-color-theme={theme}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    backgrounds: { disabled: true },
  },
  globalTypes: {
    theme: {
      description: "Pastel color theme (data-color-theme)",
      defaultValue: "peach",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        dynamicTitle: true,
        items: THEMES.map((t) => ({ value: t, title: t })),
      },
    },
  },
  decorators: [withTheme, withAppProviders],
};

export default preview;
