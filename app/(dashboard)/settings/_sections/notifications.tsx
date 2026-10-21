"use client";

import { SettingSection, SettingCard, SettingRow } from "@/components/settings/card";
import { Toggle } from "@/components/settings/toggle";
import { useSettings } from "@/lib/settings-context";
import { Radio, Bell, Clock, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { settingsV2Api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NotificationsSection() {
  const { settings, saveSection } = useSettings();
  const [testingChannel, setTestingChannel] = useState<string | null>(null);

  const saveChannels = (key: string, value: boolean) => {
    saveSection("notifications", {
      channels: { ...settings.channels, [key]: value },
    });
  };

  const saveTypes = (key: string, value: boolean) => {
    const backendKey = key
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase();
    saveSection("notifications", {
      types: {
        jobs_found: settings.types.jobsFound,
        application_submitted: settings.types.applicationSubmitted,
        interview_invitation: settings.types.interviewInvitation,
        resume_analysis_completed: settings.types.resumeAnalysisCompleted,
        weekly_summary: settings.types.weeklySummary,
        ai_agent_alerts: settings.types.aiAgentAlerts,
        workflow_failures: settings.types.workflowFailures,
        [backendKey]: value,
      },
    });
  };

  const saveFrequency = (freq: string) => {
    saveSection("notifications", { frequency: freq });
  };

  const sendTest = async (channel: string) => {
    setTestingChannel(channel);
    try {
      const res = await settingsV2Api.testNotification(channel);
      toast.success(res.data.message ?? `Test notification sent via ${channel}!`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || "Failed to send test notification";
      toast.error(detail);
    } finally {
      setTestingChannel(null);
    }
  };

  return (
    <SettingSection>
      {/* 1. Delivery Channels */}
      <SettingCard
        title="Delivery Channels"
        description="Choose where you want to receive alerts from your Applivo workspace"
        icon={<Radio className="w-4 h-4 text-white" />}
      >
        <div className="space-y-1">
          <SettingRow
            label="Email Notifications"
            description="Receive daily activity digests, critical platform alerts, and interview invites at your primary email."
          >
            <Toggle
              checked={settings.channels.email}
              onChange={(v) => saveChannels("email", v)}
            />
          </SettingRow>

          <SettingRow
            label="Telegram Alerts"
            description="Real-time instant application status and interview alerts delivered to your connected Telegram."
          >
            <Toggle
              checked={settings.channels.telegram}
              onChange={(v) => saveChannels("telegram", v)}
            />
          </SettingRow>

          <SettingRow
            label="Send Test Alert"
            description="Dispatch a verification alert right now to confirm your delivery channel is reachable."
          >
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => sendTest("email")}
                disabled={testingChannel !== null}
                className="h-8 px-3 rounded-md bg-[#171717] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {testingChannel === "email" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span>Test Email</span>
              </button>

              {settings.channels.telegram && (
                <button
                  type="button"
                  onClick={() => sendTest("telegram")}
                  disabled={testingChannel !== null}
                  className="h-8 px-3 rounded-md bg-[#171717] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {testingChannel === "telegram" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span>Test Telegram</span>
                </button>
              )}
            </div>
          </SettingRow>
        </div>
      </SettingCard>

      {/* 2. Notification Triggers */}
      <SettingCard
        title="Event Triggers"
        description="Fine-tune which events generate automated alerts"
        icon={<Bell className="w-4 h-4 text-white" />}
      >
        <div className="space-y-1">
          <SettingRow
            label="Matching Jobs Discovered"
            description="Alert when new job openings matching your target roles and skills are detected."
          >
            <Toggle
              checked={settings.types.jobsFound}
              onChange={(v) => saveTypes("jobsFound", v)}
            />
          </SettingRow>

          <SettingRow
            label="Application Confirmations"
            description="Confirmation receipt each time an application is successfully dispatched."
          >
            <Toggle
              checked={settings.types.applicationSubmitted}
              onChange={(v) => saveTypes("applicationSubmitted", v)}
            />
          </SettingRow>

          <SettingRow
            label="Interview Requests"
            description="High-priority instant alert when a recruiter messages or requests an interview."
          >
            <Toggle
              checked={settings.types.interviewInvitation}
              onChange={(v) => saveTypes("interviewInvitation", v)}
            />
          </SettingRow>

          <SettingRow
            label="Resume ATS Tailoring"
            description="Notify when ATS analysis or LaTeX resume compilation completes."
          >
            <Toggle
              checked={settings.types.resumeAnalysisCompleted}
              onChange={(v) => saveTypes("resumeAnalysisCompleted", v)}
            />
          </SettingRow>

          <SettingRow
            label="Weekly Activity Summary"
            description="Consolidated digest of sent applications, recruiter view rates, and match trends."
          >
            <Toggle
              checked={settings.types.weeklySummary}
              onChange={(v) => saveTypes("weeklySummary", v)}
            />
          </SettingRow>

          <SettingRow
            label="Agent Alerts & Warnings"
            description="Warnings when an automation run requires captcha resolution or profile review."
          >
            <Toggle
              checked={settings.types.aiAgentAlerts}
              onChange={(v) => saveTypes("aiAgentAlerts", v)}
            />
          </SettingRow>

          <SettingRow
            label="Execution Failures"
            description="Immediate notification when submission failures or API errors occur."
          >
            <Toggle
              checked={settings.types.workflowFailures}
              onChange={(v) => saveTypes("workflowFailures", v)}
            />
          </SettingRow>
        </div>
      </SettingCard>

      {/* 3. Digest Frequency */}
      <SettingCard
        title="Delivery Frequency"
        description="Choose how often non-urgent notifications are batched and delivered"
        icon={<Clock className="w-4 h-4 text-white" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(["instant", "hourly", "daily"] as const).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => saveFrequency(freq)}
              className={cn(
                "py-2.5 px-3 rounded-lg text-[12px] font-medium transition-colors border text-center flex flex-col items-center justify-center gap-0.5",
                settings.frequency === freq
                  ? "bg-white text-black border-white font-semibold shadow-sm"
                  : "bg-[var(--app-nested)] text-zinc-400 border-[var(--app-border-strong)] hover:text-white hover:border-zinc-700"
              )}
            >
              <span>
                {freq === "instant"
                  ? "Instant"
                  : freq === "hourly"
                  ? "Hourly Digest"
                  : "Daily Digest"}
              </span>
              <span
                className={cn(
                  "text-[10px]",
                  settings.frequency === freq ? "text-zinc-700" : "text-zinc-500"
                )}
              >
                {freq === "instant"
                  ? "Real-time alerts"
                  : freq === "hourly"
                  ? "Batched top of hour"
                  : "Once per day at 9 AM"}
              </span>
            </button>
          ))}
        </div>
      </SettingCard>
    </SettingSection>
  );
}
