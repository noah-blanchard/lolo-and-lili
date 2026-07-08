/**
 * Pastel color themes for the app. Each theme is a *complete* palette — it
 * overrides every CSS variable (background, surface, text, accents…) so there
 * is a single control: pick a theme, get its full look. Some themes are light,
 * some are dark; all stay soft and coherent. The `key` is persisted in
 * profiles.theme_pref and applied as a `data-color-theme` attribute on <html>.
 *
 * Keep the keys in sync with the CSS selectors in globals.css and the SQL
 * default in supabase/migrations/0001_init.sql (`theme_pref text default 'peach'`).
 */

export type ThemeMode = "light" | "dark";

export interface ThemePalette {
  key: string;
  label: string;
  emoji: string;
  mode: ThemeMode;
  /** Three representative colors for the picker swatch: [bg, primary, secondary]. */
  swatch: [string, string, string];
}

export const COLOR_THEMES = [
  {
    key: "peach",
    label: "Peach",
    emoji: "🍑",
    mode: "light",
    swatch: ["#fff7f0", "#ff8fa3", "#9ee6cf"],
  },
  {
    key: "blue",
    label: "Blue",
    emoji: "💙",
    mode: "light",
    swatch: ["#f2f7ff", "#6fa8ff", "#9fe3da"],
  },
  {
    key: "lilac",
    label: "Lilac",
    emoji: "💜",
    mode: "light",
    swatch: ["#faf5ff", "#b48cff", "#ffb3e6"],
  },
  {
    key: "mint",
    label: "Mint",
    emoji: "🌿",
    mode: "light",
    swatch: ["#f1fbf5", "#5fcfa6", "#b6e89a"],
  },
  {
    key: "midnight",
    label: "Midnight",
    emoji: "🌌",
    mode: "dark",
    swatch: ["#161a2e", "#8fa8ff", "#7fd6cd"],
  },
  {
    key: "cocoa",
    label: "Cocoa",
    emoji: "🍫",
    mode: "dark",
    swatch: ["#241c1f", "#ff9db0", "#7fd9be"],
  },
] as const satisfies readonly ThemePalette[];

export type ColorThemeKey = (typeof COLOR_THEMES)[number]["key"];

export const COLOR_THEME_KEYS = COLOR_THEMES.map(
  (t) => t.key,
) as [ColorThemeKey, ...ColorThemeKey[]];

export const DEFAULT_COLOR_THEME: ColorThemeKey = "peach";

/** Resolve a stored theme key, falling back to the default peach theme. */
export function resolveColorTheme(
  key: string | null | undefined,
): ColorThemeKey {
  return (
    COLOR_THEMES.find((t) => t.key === key)?.key ?? DEFAULT_COLOR_THEME
  );
}
