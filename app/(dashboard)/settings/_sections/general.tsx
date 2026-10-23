"use client";

import { useState, useEffect } from "react";
import { SettingSection, SettingCard, SettingRow, selectCls } from "@/components/settings/card";
import { Toggle } from "@/components/settings/toggle";
import { useSettings } from "@/lib/settings-context";
import { toast } from "sonner";
import { PREF_24H, readBoolPref, writeBoolPref } from "@/lib/prefs";

const TIMEZONES = ["Asia/Kolkata", "America/New_York", "America/Los_Angeles", "America/Chicago", "Europe/London", "Europe/Berlin", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "UTC"];

export function GeneralSection() {
  const { settings, saveSection } = useSettings();

  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    setIs24Hour(readBoolPref(PREF_24H, false));
  }, []);

  const handle24HourToggle = (checked: boolean) => {
    setIs24Hour(checked);
    writeBoolPref(PREF_24H, checked);
    toast.success(checked ? "24-hour clock enabled" : "12-hour clock enabled");
  };

  return (
    <SettingSection>
      <SettingCard
        title="Regional & localization"
        description="How dates and times are shown."
      >
        <div className="space-y-1">
          <SettingRow
            label="Timezone"
            description="Dates and times in the app are shown in this timezone. It does not change when automations run."
          >
            <select
              value={settings.timezone}
              onChange={(e) => saveSection("general", { timezone: e.target.value })}
              className={selectCls}
            >
              {!TIMEZONES.includes(settings.timezone) && settings.timezone && (
                <option value={settings.timezone}>{settings.timezone} (current)</option>
              )}
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

          <SettingRow label="Language" description="The interface is currently available in English only.">
            <span className="inline-flex h-9 items-center rounded-lg border border-[var(--app-border-strong)] px-3 text-[13px] text-zinc-200">English</span>
          </SettingRow>

          <SettingRow
            label="24-hour time"
            description="Show times in detail views as 20:00 instead of 8:00 PM. Stored in this browser."
          >
            <Toggle checked={is24Hour} onChange={handle24HourToggle} label="24-hour time" />
          </SettingRow>
        </div>
      </SettingCard>
    </SettingSection>
  );
}
