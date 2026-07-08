"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_COLOR_THEME,
  resolveColorTheme,
  type ColorThemeKey,
} from "@/lib/themes";

interface ColorThemeContextValue {
  theme: ColorThemeKey;
  setTheme: (theme: ColorThemeKey) => void;
}

const ColorThemeContext = createContext<ColorThemeContextValue | null>(null);

/** Apply the chosen color theme to <html> so CSS variables cascade. */
function applyTheme(theme: ColorThemeKey) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-color-theme", theme);
}

export function ColorThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme?: string | null;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<ColorThemeKey>(
    resolveColorTheme(initialTheme),
  );

  // Sync the attribute on mount and whenever the theme changes.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: ColorThemeKey) => {
    setThemeState(next);
    applyTheme(next);
  }, []);

  return (
    <ColorThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const ctx = useContext(ColorThemeContext);
  if (!ctx) {
    // Safe no-op fallback so consumers don't crash outside the provider.
    return {
      theme: DEFAULT_COLOR_THEME,
      setTheme: () => {},
    } satisfies ColorThemeContextValue;
  }
  return ctx;
}
