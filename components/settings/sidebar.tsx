"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Sliders,
  Bell,
  Zap,
  Brain,
  Sparkles,
  Globe,
  Puzzle,
  Shield,
  Terminal,
  ChevronDown,
} from "lucide-react";

export interface SettingsItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export interface SettingsGroup {
  name: string;
  items: SettingsItem[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    name: "Preferences",
    items: [
      {
        id: "general",
        label: "General",
        icon: Sliders,
        description: "Platform-wide defaults, timezone, language, and display layout.",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        description: "Alert delivery channels, telegram integration, and automated event triggers.",
      },
    ],
  },
  {
    name: "Automation",
    items: [
      {
        id: "job-automation",
        label: "Job Automation",
        icon: Zap,
        description: "Autonomous agent execution mode, daily scrape frequency, and pipeline limits.",
      },
      {
        id: "agent-strategy",
        label: "Agent Strategy",
        icon: Brain,
        description: "Target roles, seniority levels, match score criteria, and question answer preferences.",
      },
    ],
  },
  {
    name: "AI",
    items: [
      {
        id: "ai-settings",
        label: "AI Settings",
        icon: Sparkles,
        description: "Inference provider models, fallback routing, and prompt generation settings.",
      },
    ],
  },
  {
    name: "Connections",
    items: [
      {
        id: "platform-connections",
        label: "Platforms",
        icon: Globe,
        description: "Status and sync health for integrated job boards and platforms.",
      },
      {
        id: "extension",
        label: "Extension",
        icon: Puzzle,
        description: "Manage the Applivo browser extension connection and local session pairing.",
      },
    ],
  },
  {
    name: "Security",
    items: [
      {
        id: "security",
        label: "Security",
        icon: Shield,
        description: "Password updates, two-factor authentication, and active browser sessions.",
      },
    ],
  },
  {
    name: "System",
    items: [
      {
        id: "advanced",
        label: "Advanced",
        icon: Terminal,
        description: "Data export, diagnostic controls, and environment configuration.",
      },
    ],
  },
];

interface SettingsSidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <nav className="space-y-4" aria-label="Settings navigation">
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.name} className="space-y-1">
          <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            {group.name}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors text-left",
                    isActive
                      ? "bg-white/[0.08] text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-zinc-400")} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function SettingsMobileSelect({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <div className="relative w-full">
      <select
        value={activeTab}
        onChange={(e) => onTabChange(e.target.value)}
        className="w-full h-10 px-3 pr-9 rounded-lg bg-[var(--app-card)] border border-[var(--app-border-strong)] text-[13px] font-medium text-white focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
      >
        {SETTINGS_GROUPS.map((group) => (
          <optgroup key={group.name} label={group.name} className="bg-[#171717] text-zinc-400">
            {group.items.map((item) => (
              <option key={item.id} value={item.id} className="text-white bg-[#171717]">
                {group.name} &rsaquo; {item.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
    </div>
  );
}
