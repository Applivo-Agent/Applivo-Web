"use client";

import { useState, useEffect } from "react";
import { SettingSection, SettingCard, SettingRow } from "@/components/settings/card";
import { Toggle } from "@/components/settings/toggle";
import { useSettings } from "@/lib/settings-context";
import { toast } from "sonner";
import { PREF_MOTION, readBoolPref, writeBoolPref } from "@/lib/prefs";
import { cn } from "@/lib/utils";
import { useThemePreference } from "@/lib/theme-client";
import type { ThemePreference } from "@/lib/theme";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function AppearanceSection() {
  const { settings, saveSection } = useSettings();

  const { mounted, preference, setPreference, enabled } = useThemePreference();
  const [smoothAnimations, setSmoothAnimations] = useState(true);

  useEffect(() => {
    setSmoothAnimations(readBoolPref(PREF_MOTION, true));
  }, []);

  const handleToggleAnimations = (checked: boolean) => {
    setSmoothAnimations(checked);
    writeBoolPref(PREF_MOTION, checked);               // applied app-wide through <html data-motion>
    toast.success(checked ? "Smooth transitions enabled" : "Reduced motion enabled");
  };

  return (
    <SettingSection>
      <SettingCard
        title="Theme & layout"
        description="How Applivo looks and how densely it lays out content."
      >
        <div className="space-y-1">
          <SettingRow
            label="Theme"
            description={enabled ? "Light, dark, or follow your system. Shared with the toggle in the top bar." : "Dark is currently the only theme."}
          >
            {enabled ? (
              <div role="radiogroup" aria-label="Theme" className="flex items-center gap-0.5 border border-[var(--app-border-strong)] rounded-lg p-0.5 w-full sm:w-auto">
                {THEME_OPTIONS.map((o) => {
                  const selected = mounted && preference === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setPreference(o.value)}
                      className={cn(
                        "flex-1 sm:flex-initial h-8 px-3 rounded-md text-[13px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
                        selected ? "bg-[var(--app-active)] text-white" : "text-zinc-500 hover:text-zinc-200"
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="inline-flex h-9 items-center rounded-lg border border-[var(--app-border-strong)] px-3 text-[13px] text-zinc-200">Dark (default)</span>
            )}
          </SettingRow>

          <SettingRow
            label="Density"
            description="Spacing between sections, card padding, table rows and grids across the app. Saved to your account."
          >
            <div className="flex items-center gap-0.5 border border-[var(--app-border-strong)] rounded-lg p-0.5 w-full sm:w-auto">
              {(["compact", "comfortable", "spacious"] as const).map((density) => (
                <button
                  key={density}
                  type="button"
                  onClick={() => saveSection("general", { dashboard_layout: density })}
                  className={cn(
                    "flex-1 sm:flex-initial h-8 px-3 rounded-md text-[13px] transition-colors capitalize",
                    settings.dashboardLayout === density
                      ? "bg-white/[0.1] text-white"
                      : "text-zinc-500 hover:text-zinc-200"
                  )}
                >
                  {density}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow
            label="Smooth transitions"
            description="Turn off to remove animated transitions across the app. Stored in this browser."
          >
            <Toggle checked={smoothAnimations} onChange={handleToggleAnimations} label="Smooth transitions" />
          </SettingRow>
        </div>
      </SettingCard>
    </SettingSection>
  );
}
