"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { integrationsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

interface SlackConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  accountIdentifier?: string | null;
  onSuccess?: () => void;
}

const DEFAULT_PREFS = [
  { key: "job_matches", label: "Job matches" },
  { key: "run_completed", label: "Run completed" },
  { key: "interview_reminders", label: "Interview reminders" },
  { key: "follow_up_reminders", label: "Follow-up reminders" },
  { key: "application_updates", label: "Application updates" },
  { key: "daily_digest", label: "Daily digest" },
];

export function SlackConfigModal({
  open,
  onOpenChange,
  itemName,
  accountIdentifier,
  onSuccess,
}: SlackConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      void loadPrefs();
    }
  }, [open]);

  const loadPrefs = async () => {
    setLoading(true);
    try {
      const resp = await integrationsApi.getSlackPrefs();
      const p = resp.data?.prefs || {};
      setPrefs(p);
    } catch {
      // If not connected or prefs missing, use defaults
      const defaults: Record<string, boolean> = {};
      DEFAULT_PREFS.forEach((d) => (defaults[d.key] = true));
      setPrefs(defaults);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePrefs = async () => {
    setSaving(true);
    try {
      await integrationsApi.updateSlackPrefs(prefs);
      toast.success("Slack preferences updated");
      onSuccess?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to update preferences.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async () => {
    setTesting(true);
    try {
      await integrationsApi.slackTestNotification();
      toast.success("Test notification sent to Slack");
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to send test notification.";
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  const disconnect = async () => {
    try {
      await integrationsApi.disconnect("slack");
      toast.success(`${itemName} disconnected`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to disconnect.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-[var(--sx-bg-121215)] border border-[var(--app-border-strong)] text-white p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center p-1.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/slack.svg" alt={itemName} className="w-full h-full object-contain" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                {itemName} Configuration
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Manage notification preferences for your connected workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="space-y-5">
            {accountIdentifier && (
              <div className="text-xs text-zinc-400">
                Connected workspace: <span className="text-zinc-300">{accountIdentifier}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs text-zinc-300">Notification preferences</Label>
              <div className="space-y-2 border border-[var(--app-border-strong)] rounded-lg p-3 bg-[var(--app-nested)]">
                {DEFAULT_PREFS.map((d) => (
                  <label key={d.key} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:text-white">
                    <Checkbox
                      checked={!!prefs[d.key]}
                      onCheckedChange={() => toggle(d.key)}
                      className="border-zinc-600"
                    />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={savePrefs}
                disabled={saving}
                className="h-8 text-xs bg-white text-black hover:bg-zinc-200 font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save preferences"
                )}
              </Button>
              <Button
                type="button"
                onClick={testNotification}
                disabled={testing}
                className="h-8 text-xs border border-[var(--app-border-strong)] bg-transparent text-zinc-300 hover:bg-white/[0.04] hover:text-white"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Send test notification
                  </>
                )}
              </Button>
            </div>

            <div className="pt-3 border-t border-[var(--app-border-strong)]">
              <Button
                type="button"
                onClick={disconnect}
                className="h-8 text-xs border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
