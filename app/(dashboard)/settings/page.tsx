"use client";

import { useState, useEffect, useRef } from "react";
import { SettingsProvider } from "@/lib/settings-context";
import { SaveStatus } from "@/components/settings/save-status";
import { GeneralSection } from "./_sections/general";
import { NotificationsSection } from "./_sections/notifications";
import { AppearanceSection } from "./_sections/appearance";
import { cn } from "@/lib/utils";

type TabId = "general" | "notifications" | "appearance";

interface TabItem {
  id: TabId;
  label: string;
}

const TABS: TabItem[] = [
  { id: "general", label: "General" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const read = () => {
      const tab = new URLSearchParams(window.location.search).get("tab");
      setActiveTab(TABS.some((t) => t.id === tab) ? (tab as TabId) : "general");
    };
    read();
    window.addEventListener("popstate", read);   // browser back/forward keeps the right tab
    return () => window.removeEventListener("popstate", read);
  }, []);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    window.history.pushState({}, "", url.toString());
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const move = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!move) return;
    e.preventDefault();
    const next = TABS[(index + move + TABS.length) % TABS.length];
    handleTabChange(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <SettingsProvider>
      <div className="dash-page pb-16">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--app-border-strong)] pb-3">
          <div role="tablist" aria-label="Settings categories" className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
            {TABS.map((tab, i) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => { tabRefs.current[tab.id] = el; }}
                  role="tab"
                  id={`settings-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls="settings-panel"
                  tabIndex={isActive ? 0 : -1}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    "h-8 px-3.5 rounded-lg text-[13px] transition-colors shrink-0 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                    isActive ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-200"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <SaveStatus />
        </div>

        <div id="settings-panel" role="tabpanel" aria-labelledby={`settings-tab-${activeTab}`}>
          {activeTab === "general" && <GeneralSection />}
          {activeTab === "notifications" && <NotificationsSection />}
          {activeTab === "appearance" && <AppearanceSection />}
        </div>
      </div>
    </SettingsProvider>
  );
}
