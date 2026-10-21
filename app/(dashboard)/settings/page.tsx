"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsProvider } from "@/lib/settings-context";
import { SaveStatus } from "@/components/settings/save-status";
import { GeneralSection } from "./_sections/general";
import { NotificationsSection } from "./_sections/notifications";
import { AppearanceSection } from "./_sections/appearance";
import { Sliders, Bell, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "general" | "notifications" | "appearance";

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: "general", label: "General", icon: Sliders },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as TabId;
      if (tab && (tab === "general" || tab === "notifications" || tab === "appearance")) {
        setActiveTab(tab);
      }
    }
  }, []);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <SettingsProvider>
      <div className="dash-page max-w-4xl space-y-6 pb-16">
        {/* Compact Page Header (System Overview Baseline) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">
              Settings
            </h1>
            <p className="text-[13px] text-zinc-400 mt-1">
              Manage your application preferences.
            </p>
          </div>
          <SaveStatus />
        </div>

        {/* Single-Row Horizontal Tab Navigation */}
        <div className="border-b border-[var(--app-border-strong)] pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#141416] border border-[var(--app-border-strong)] rounded-lg overflow-x-auto no-scrollbar w-fit max-w-full">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "h-8 px-3.5 rounded-md text-[12px] font-medium transition-colors flex items-center gap-2 shrink-0 select-none",
                    isActive
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Settings Single-Column Content Area */}
        <div className="pt-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "general" && <GeneralSection />}
              {activeTab === "notifications" && <NotificationsSection />}
              {activeTab === "appearance" && <AppearanceSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SettingsProvider>
  );
}
