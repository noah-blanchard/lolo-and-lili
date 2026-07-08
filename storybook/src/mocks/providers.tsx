import React from "react";
import type { Decorator } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { CoupleProvider } from "@/components/providers/couple-provider";
import { ColorThemeProvider } from "@/components/providers/color-theme-provider";
import frMessages from "@/i18n/messages/fr.json";

/**
 * Static "couple" used by every story. Components read `me` / `partner` from
 * `useCouple()`, and most feature stories render both. Cast because the real
 * `Profile` type has many DB columns we don't need for visual stories.
 */
const coupleValue = {
  coupleId: "couple-storybook",
  me: {
    id: "me-storybook",
    display_name: "Lolo",
    avatar_emoji: "🐰",
    accent_color: "#ff8fa3",
  },
  partner: {
    id: "partner-storybook",
    display_name: "Lili",
    avatar_emoji: "🐱",
    accent_color: "#9ee6cf",
  },
} as unknown as React.ComponentProps<typeof CoupleProvider>["value"];

// One shared client; feature stories mock their own data hooks on top of it.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      <QueryClientProvider client={queryClient}>
        <CoupleProvider value={coupleValue}>
          <ColorThemeProvider initialTheme="peach">
            {children}
          </ColorThemeProvider>
        </CoupleProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}

/** Wraps every story in the providers the app shell normally supplies. */
export const withAppProviders: Decorator = (Story) => (
  <AppProviders>
    <Story />
  </AppProviders>
);
