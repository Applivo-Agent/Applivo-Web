"use client";

import { useState, useEffect } from "react";
import { SettingSection, SettingCard, SettingRow } from "@/components/settings/card";
import { Toggle } from "@/components/settings/toggle";
import { useSettings } from "@/lib/settings-context";
import { Globe, Clock } from "lucide-react";
import { toast } from "sonner";

export function GeneralSection() {
  const { settings, saveSection } = useSettings();

  const [startOfWeek, setStartOfWeek] = useState("Monday");
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWeek = localStorage.getItem("applivo_pref_start_week");
      if (savedWeek) setStartOfWeek(savedWeek);

      const saved24h = localStorage.getItem("applivo_pref_24h");
      if (saved24h) setIs24Hour(saved24h === "true");
    }
  }, []);

  const handleStartOfWeekChange = (value: string) => {
    setStartOfWeek(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("applivo_pref_start_week", value);
    }
    toast.success("Start of week updated");
  };

  const handle24HourToggle = (checked: boolean) => {
    setIs24Hour(checked);
    if (typeof window !== "undefined") {
      localStorage.setItem("applivo_pref_24h", String(checked));
    }
    toast.success(checked ? "24-hour clock enabled" : "12-hour clock enabled");
  };

  return (
    <SettingSection>
      <SettingCard
        title="Regional & Localization"
        description="Platform-wide timezone, language, and regional date formatting"
        icon={<Globe className="w-4 h-4 text-white" />}
      >
        <div className="space-y-1">
          <SettingRow
            label="Timezone"
            description="All automation schedules, job discovery, and notification digests use this timezone."
          >
            <select
              value={settings.timezone}
              onChange={(e) => saveSection("general", { timezone: e.target.value })}
              className="h-9 px-3 w-full sm:w-auto min-w-[200px] bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg text-[13px] text-white focus:outline-none focus:border-white/40 transition-colors"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
              <option value="America/New_York">America/New_York (EST, UTC-5)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST, UTC-8)</option>
              <option value="America/Chicago">America/Chicago (CST, UTC-6)</option>
              <option value="Europe/London">Europe/London (GMT/BST, UTC+0)</option>
              <option value="Europe/Berlin">Europe/Berlin (CET, UTC+1)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+9)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEST, UTC+10)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
            </select>
          </SettingRow>

          <SettingRow
            label="Interface Language"
            description="Interface language for navigation, labels, and system messages."
          >
            <select
              value={settings.language}
              onChange={(e) => saveSection("general", { language: e.target.value })}
              className="h-9 px-3 w-full sm:w-auto min-w-[180px] bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg text-[13px] text-white focus:outline-none focus:border-white/40 transition-colors"
            >
              <option value="en">English (US/UK)</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
            </select>
          </SettingRow>

          <SettingRow
            label="Date Format"
            description="How dates are displayed across dashboards, logs, and activity reports."
          >
            <select
              value={settings.dateFormat}
              onChange={(e) => saveSection("general", { date_format: e.target.value })}
              className="h-9 px-3 w-full sm:w-auto min-w-[180px] bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg text-[13px] text-white focus:outline-none focus:border-white/40 transition-colors"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 19/10/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/19/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
            </select>
          </SettingRow>

          <SettingRow
            label="Start of the Week"
            description="First day shown on weekly analytics heatmaps and application quota counters."
          >
            <select
              value={startOfWeek}
              onChange={(e) => handleStartOfWeekChange(e.target.value)}
              className="h-9 px-3 w-full sm:w-auto min-w-[180px] bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg text-[13px] text-white focus:outline-none focus:border-white/40 transition-colors"
            >
              <option value="Monday">Monday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </SettingRow>

          <SettingRow
            label="24-Hour Time Format"
            description="Display timestamps in 24-hour notation (e.g. 20:00 instead of 8:00 PM)."
          >
            <Toggle checked={is24Hour} onChange={handle24HourToggle} />
          </SettingRow>
        </div>
      </SettingCard>
    </SettingSection>
  );
}
