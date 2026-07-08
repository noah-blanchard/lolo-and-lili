/**
 * Pastel color themes for the app. Each theme overrides the palette CSS
 * variables (see globals.css `[data-color-theme="..."]` blocks) while keeping
 * the same soft, rounded, pillowy look. The `key` is persisted in
 * profiles.theme_pref and applied as a `data-color-theme` attribute on <html>.
 *
 * Keep the keys in sync with the SQL default in supabase/migrations/0001_init.sql
 * (`theme_pref text default 'peach'`) and the CSS selectors in globals.css.
 */

export const COLOR_THEMES = [
  {
    key: "peach",
    label: "Peach",
    emoji: "🍑",
    // soft coral / cream
    swatch: ["#ff8fa3", "#9ee6cf", "#ffd670"],
  },
  {
    key: "blue",
    label: "Blue",
    emoji: "💙",
    // soft sky / periwinkle
    swatch: ["#8fb8ff", "#a7e8e0", "#cdd7ff"],
  },
  {
    key: "lilac",
    label: "Lilac",
    emoji: "💜",
    // soft lavender / mauve
    swatch: ["#c3a3ff", "#ffb3e6", "#b8c4ff"],
  },
  {
    key: "mint",
    label: "Mint",
    emoji: "🌿",
    // soft mint / sage
    swatch: ["#8fe0c0", "#bde8a0", "#a7e8e0"],
  },
] as const;

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
