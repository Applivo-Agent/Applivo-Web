"use client";

import { useState, useEffect } from "react";
import { SettingSection, SettingCard, SettingRow } from "@/components/settings/card";
import { Toggle } from "@/components/settings/toggle";
import { useSettings } from "@/lib/settings-context";
import { Palette, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AppearanceSection() {
  const { settings, saveSection } = useSettings();

  const [showActiveDot, setShowActiveDot] = useState(true);
  const [smoothAnimations, setSmoothAnimations] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDot = localStorage.getItem("applivo_pref_active_dot");
      if (savedDot !== null) setShowActiveDot(savedDot === "true");

      const savedAnim = localStorage.getItem("applivo_pref_animations");
      if (savedAnim !== null) setSmoothAnimations(savedAnim === "true");
    }
  }, []);

  const handleToggleActiveDot = (checked: boolean) => {
    setShowActiveDot(checked);
    if (typeof window !== "undefined") {
      localStorage.setItem("applivo_pref_active_dot", String(checked));
    }
    toast.success(checked ? "Active status indicator enabled" : "Active status indicator hidden");
  };

  const handleToggleAnimations = (checked: boolean) => {
    setSmoothAnimations(checked);
    if (typeof window !== "undefined") {
      localStorage.setItem("applivo_pref_animations", String(checked));
    }
    toast.success(checked ? "Smooth animations enabled" : "Reduced motion mode enabled");
  };

  return (
    <SettingSection>
      <SettingCard
        title="Theme & Workspace Density"
        description="Visual presentation, layout density, and interface aesthetics"
        icon={<Palette className="w-4 h-4 text-white" />}
      >
        <div className="space-y-1">
          <SettingRow
            label="Interface Theme"
            description="Applivo uses a signature monochrome dark palette optimized for contrast, clarity, and extended coding/application sessions."
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-white shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Monochrome Dark</span>
                <span className="text-[10px] text-zinc-400 font-normal border-l border-zinc-700 pl-2 ml-0.5">
                  Standard
                </span>
              </span>
            </div>
          </SettingRow>

          <SettingRow
            label="Dashboard Density"
            description="Control the vertical spacing and row height across table lists, cards, and application queues."
          >
            <div className="flex items-center gap-1 bg-[#171717] border border-[var(--app-border-strong)] rounded-lg p-0.5 w-full sm:w-auto">
              {(["compact", "comfortable", "spacious"] as const).map((density) => (
                <button
                  key={density}
                  type="button"
                  onClick={() => saveSection("general", { dashboard_layout: density })}
                  className={cn(
                    "flex-1 sm:flex-initial h-7.5 px-3 rounded-md text-[12px] font-medium transition-colors capitalize",
                    settings.dashboardLayout === density
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {density}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow
            label="Show Active Indicator"
            description="Display a green online indicator dot on your avatar across the dashboard header and profile."
          >
            <Toggle checked={showActiveDot} onChange={handleToggleActiveDot} />
          </SettingRow>

          <SettingRow
            label="Smooth Page Transitions"
            description="Enable micro-animations, modal easing, and smooth tab switching transitions."
          >
            <Toggle checked={smoothAnimations} onChange={handleToggleAnimations} />
          </SettingRow>
        </div>
      </SettingCard>
    </SettingSection>
  );
}
