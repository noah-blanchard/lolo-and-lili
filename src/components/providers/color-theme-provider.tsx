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
  COLOR_THEMES,
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
  const root = document.documentElement;
  root.setAttribute("data-color-theme", theme);
  const palette = COLOR_THEMES.find((t) => t.key === theme);
  // Tell the browser the scheme so native controls/scrollbars match.
  root.style.colorScheme = palette?.mode ?? "light";
  // Keep the browser/status-bar chrome (theme-color) in sync with the active
  // theme so dark themes don't get a cream status bar (F-042). swatch[0] is the
  // theme's --background.
  const bg = palette?.swatch[0] ?? "#fff7f0";
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = bg;
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
    // Persist for SSR: the root layout reads this cookie to render
    // <html data-color-theme> so a returning user's theme paints with no flash
    // before hydration (F-030).
    document.cookie = `color-theme=${theme}; path=/; max-age=31536000; samesite=lax`;
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
  // Fail loudly like useCouple: a missing provider is a wiring bug, and the
  // error boundaries (TASK-05) now contain the throw gracefully. Consistent
  // failure philosophy across provider hooks (F-013).
  if (!ctx) throw new Error("useColorTheme must be used within a ColorThemeProvider");
  return ctx;
}
