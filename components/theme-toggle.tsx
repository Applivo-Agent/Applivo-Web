"use client";
import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useThemePreference } from "@/lib/theme-client";
import { isThemedPath } from "@/lib/theme";

/**
 * Header switch: a pill whose knob slides between the two themes (dark track with a white sun knob on the left, white track with a
 * black moon knob on the right). The look is driven by the `html.light` class, so it is correct on first paint with no hydration
 * mismatch; state comes from the same provider as Settings.
 */
export function ThemeToggle() {
  const { mounted, resolved, setPreference, enabled } = useThemePreference();
  const pathname = usePathname();
  if (!enabled || !isThemedPath(pathname)) return null;   // staged behind NEXT_PUBLIC_THEME_SWITCH
  const next = resolved === "dark" ? "light" : "dark";
  const label = mounted ? `Switch to ${next} theme` : "Switch theme";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={mounted ? resolved === "light" : false}
      aria-label={label}
      title={label}
      onClick={() => setPreference(next)}
      className="group relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border border-[#3f3f46] bg-[#303134] p-[3px] outline-none transition-colors duration-200 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] [html.light_&]:border-[#d4d4d8] [html.light_&]:bg-[#ffffff]"
    >
      <span
        aria-hidden="true"
        className="relative flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#ffffff] text-[#000000] shadow-sm transition-transform duration-200 motion-reduce:transition-none translate-x-0 [html.light_&]:translate-x-6 [html.light_&]:bg-[#000000] [html.light_&]:text-[#ffffff]"
      >
        <Sun className="h-3.5 w-3.5 [html.light_&]:hidden" strokeWidth={1.75} />
        <Moon className="hidden h-3.5 w-3.5 [html.light_&]:block" strokeWidth={1.75} fill="currentColor" />
      </span>
    </button>
  );
}
