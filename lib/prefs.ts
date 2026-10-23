/** Browser-local display preferences that the app really consumes. Everything else lives on the server. */
export const PREF_24H = "applivo_pref_24h";
export const PREF_MOTION = "applivo_pref_animations";   // "true" (default) = animated, "false" = reduced motion

export function readBoolPref(key: string, fallback: boolean): boolean {
  try {
    const v = typeof window === "undefined" ? null : window.localStorage.getItem(key);
    return v === null ? fallback : v === "true";
  } catch {
    return fallback;
  }
}

export function writeBoolPref(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, String(value));
    window.dispatchEvent(new Event("applivo-pref"));
  } catch {
    /* storage unavailable: the preference simply does not persist */
  }
}

/** Reflect the motion preference on <html data-motion="reduced"> so one CSS rule can switch animations off. */
export function applyMotionPref(): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.motion = readBoolPref(PREF_MOTION, true) ? "full" : "reduced";
}

export type Density = "compact" | "comfortable" | "spacious";
const DENSITY_KEY = "applivo_density_cache";   // cache of the server-side setting, so the first paint is already correct

export function applyDensity(density?: string): void {
  if (typeof document === "undefined") return;
  let d = density;
  try {
    if (d) window.localStorage.setItem(DENSITY_KEY, d);
    else d = window.localStorage.getItem(DENSITY_KEY) ?? undefined;
  } catch { /* cache unavailable */ }
  document.documentElement.dataset.density = d === "compact" || d === "spacious" ? d : "comfortable";
}

const TZ_KEY = "applivo_timezone_cache";

/** Display timezone for dates and times (display only; schedules are not affected). */
export function getDisplayTimezone(): string | undefined {
  try {
    return (typeof window === "undefined" ? null : window.localStorage.getItem(TZ_KEY)) || undefined;
  } catch {
    return undefined;
  }
}

export function applyTimezone(tz?: string): void {
  try {
    if (tz) window.localStorage.setItem(TZ_KEY, tz);
    window.dispatchEvent(new Event("applivo-pref"));
  } catch { /* cache unavailable */ }
}
