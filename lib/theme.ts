/** Pure theme helpers (no React) so they can be unit-tested with node:test. */
export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "applivo-theme";   // namespaced: never collides with the applivo_* preference keys

const VALID: readonly string[] = ["light", "dark", "system"];

/** Returns a valid preference or null for anything else (missing, corrupted, legacy values). */
export function normalizeTheme(value: unknown): ThemePreference | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  return VALID.includes(v) ? (v as ThemePreference) : null;
}

/**
 * Preference precedence: explicit local choice, then the saved account preference (only when there is no local choice),
 * then the system, then dark. `systemAvailable` is false where matchMedia is unavailable.
 */
export function resolveInitialTheme(input: { local?: unknown; account?: unknown; systemAvailable?: boolean }): ThemePreference {
  const local = normalizeTheme(input.local);
  if (local) return local;
  const account = normalizeTheme(input.account);
  if (account) return account;
  return input.systemAvailable ? "system" : "dark";
}

/** The switch is staged behind NEXT_PUBLIC_THEME_SWITCH=1. Without it every page renders in the original dark theme. */
export function isThemeSwitchEnabled(): boolean {
  return process.env.NEXT_PUBLIC_THEME_SWITCH === "1";
}

/** Every route follows the user's theme: the signed-in app, admin, landing, pricing, docs, blog, contact and auth pages. */
export function isThemedPath(pathname: string | null | undefined): boolean {
  return typeof pathname === "string" && pathname.length > 0;
}

/** The theme actually applied to <html> for a route given the flag and the stored preference. */
export function effectiveTheme(opts: { pathname: string | null; enabled: boolean; preference: ThemePreference; systemLight: boolean }): "light" | "dark" {
  if (!opts.enabled || !isThemedPath(opts.pathname)) return "dark";
  if (opts.preference === "system") return opts.systemLight ? "light" : "dark";
  return opts.preference;
}
