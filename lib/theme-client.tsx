"use client";
import { ThemeProvider, useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { settingsV2Api } from "@/lib/api";
import { THEME_STORAGE_KEY, isThemeSwitchEnabled, isThemedPath, normalizeTheme, resolveInitialTheme, type ThemePreference } from "@/lib/theme";

/** One provider for the whole app. Outside the authenticated shells (or with the flag off) the theme is forced to dark. */
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const forced = !isThemeSwitchEnabled() || !isThemedPath(pathname) ? "dark" : undefined;
  return (
    <ThemeProvider
      attribute="class"
      themes={["light", "dark"]}
      defaultTheme="dark"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      forcedTheme={forced}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

/** Toasts follow the active theme through CSS variables. */
export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme === "light" ? "light" : "dark"}
      toastOptions={{ style: { background: "var(--app-menu)", color: "var(--app-text)", border: "1px solid var(--app-border-strong)" } }}
    />
  );
}

/**
 * The single source of theme state for every control (header toggle and Settings). Both read next-themes, so they cannot diverge.
 * Choosing a theme also saves it to the account through the existing settings endpoint; a failed save never changes the UI.
 */
export function useThemePreference() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const qc = useQueryClient();
  // false on the server and during hydration, true afterwards: avoids rendering a theme-dependent label before the preference is known
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const preference: ThemePreference = normalizeTheme(theme) ?? "dark";
  const setPreference = useCallback((next: ThemePreference) => {
    setTheme(next);
    let signedIn = false;
    try { signedIn = !!window.localStorage.getItem("applivo_token"); } catch { /* storage unavailable */ }
    if (!signedIn) return;                                  // visitors keep the choice in this browser only
    settingsV2Api
      .updateGeneral({ theme: next })
      .then(() => qc.invalidateQueries({ queryKey: ["settings-v2"] }))
      .catch(() => { /* account sync is best effort */ });
  }, [setTheme, qc]);

  return { mounted, preference, resolved: (resolvedTheme === "light" ? "light" : "dark") as "light" | "dark", setPreference, enabled: isThemeSwitchEnabled() };
}

/** Applies the saved account preference once when this browser has no explicit local choice. Render inside an authenticated shell. */
export function useAccountThemeSync(accountTheme: unknown) {
  const { setTheme } = useTheme();
  useEffect(() => {
    if (!isThemeSwitchEnabled() || accountTheme == null) return;
    let local: string | null = null;
    try { local = window.localStorage.getItem(THEME_STORAGE_KEY); } catch { /* storage unavailable */ }
    if (normalizeTheme(local)) return;                       // explicit local choice wins
    const initial = resolveInitialTheme({ local, account: accountTheme, systemAvailable: true });
    setTheme(initial);
  }, [accountTheme, setTheme]);
}
