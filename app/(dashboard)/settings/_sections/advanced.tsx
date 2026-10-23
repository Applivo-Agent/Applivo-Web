"use client";

import { SettingSection, SettingCard, SettingRow } from "@/components/settings/card";
import { Toggle } from "@/components/settings/toggle";
import { useSettings } from "@/lib/settings-context";
import { settingsV2Api } from "@/lib/api";
import { FlaskConical, Bug, Download, Key, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function AdvancedSection() {
  const { settings, saveSection } = useSettings();
  const [exporting, setExporting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleExport = async (types: string[], format: string) => {
    setExporting(true);
    try {
      const res = await settingsV2Api.exportData(types, format);
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `applivo-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleReset = async () => {
    if (resetConfirm !== "RESET") {
      toast.error("Type RESET to confirm");
      return;
    }
    setResetting(true);
    try {
      await settingsV2Api.resetSystem("RESET");
      toast.success("All settings reset to defaults");
      setResetConfirm("");
      window.location.reload();
    } catch {
      toast.error("Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <SettingSection>
      <SettingCard
        title="Developer & Power User"
        description="Advanced controls for debugging and integrations"
        icon={<FlaskConical className="w-4 h-4 text-white" />}
      >
        <div className="space-y-1">
          <SettingRow label="Debug Mode" description="Show detailed logs and agent reasoning in the UI">
            <Toggle
              checked={settings.debugMode}
              onChange={(v) => saveSection("advanced", { debug_mode: v })}
            />
          </SettingRow>
          <SettingRow label="Experimental Features" description="Enable beta features that are still in development">
            <Toggle
              checked={settings.experimentalFeatures}
              onChange={(v) => saveSection("advanced", { experimental_features: v })}
            />
          </SettingRow>
        </div>
      </SettingCard>

      <SettingCard
        title="Data & Exports"
        description="Download your data or export configurations"
        icon={<Download className="w-4 h-4 text-white" />}
      >
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleExport(["settings", "applications", "jobs"], "json")}
            disabled={exporting}
            className="p-4 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg text-left hover:border-zinc-500 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-white mb-2" />
            <p className="text-[13px] sm:text-[14px] font-semibold text-white">Export All Data</p>
            <p className="text-[12px] text-zinc-400 mt-0.5">JSON format</p>
          </button>

          <button
            onClick={() => handleExport(["settings"], "json")}
            disabled={exporting}
            className="p-4 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg text-left hover:border-zinc-500 transition-colors disabled:opacity-50"
          >
            <Bug className="w-4 h-4 text-white mb-2" />
            <p className="text-[13px] sm:text-[14px] font-semibold text-white">Export Settings</p>
            <p className="text-[12px] text-zinc-400 mt-0.5">Configuration only</p>
          </button>
        </div>
      </SettingCard>

      <SettingCard
        title="API & Webhooks"
        description="Integrate Applivo with external systems"
        icon={<Key className="w-4 h-4 text-white" />}
      >
        <div className="p-4 bg-transparent border border-[var(--app-border-strong)] rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-zinc-400" />
            <p className="text-[12px] text-zinc-400 font-medium">Enterprise feature — contact support to enable</p>
          </div>
          <div className="space-y-3 opacity-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-zinc-400" />
                <span className="text-[13px] text-zinc-400">API Key</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 bg-[var(--app-card)] border border-[var(--app-border-strong)] px-2 py-0.5 rounded">••••••••••••</span>
            </div>
          </div>
        </div>
      </SettingCard>

      <SettingCard
        title="Reset System"
        description="Reset all settings to factory defaults"
        icon={<Trash2 className="w-4 h-4 text-zinc-400" />}
      >
        <div className="p-4 bg-transparent border border-[var(--app-border-strong)] rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0" />
            <p className="text-[12px] text-zinc-400">This will permanently reset ALL settings to defaults. This cannot be undone.</p>
          </div>
          <input
            type="text"
            placeholder='Type "RESET" to confirm'
            value={resetConfirm}
            onChange={(e) => setResetConfirm(e.target.value)}
            className="w-full h-9 px-3 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
          />
          <button
            onClick={handleReset}
            disabled={resetConfirm !== "RESET" || resetting}
            className="w-full h-8 bg-transparent hover:bg-white/5 border border-[var(--app-border-strong)] text-zinc-300 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resetting ? "Resetting..." : "Reset All Settings"}
          </button>
        </div>
      </SettingCard>
    </SettingSection>
  );
}
