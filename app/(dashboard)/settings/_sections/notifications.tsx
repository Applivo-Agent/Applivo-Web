"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Radio, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SettingSection, SettingCard, SettingRow } from "@/components/settings/card";
import { Toggle } from "@/components/settings/toggle";
import { settingsApi, settingsV2Api } from "@/lib/api";

interface NotificationStatus {
  email_enabled: boolean;
  telegram_enabled: boolean;
  telegram_connected: boolean;
  email_address: string;
  email_server_configured: boolean;
  telegram_bot_configured: boolean;
}

const testBtn =
  "h-8 px-3 rounded-md bg-[var(--sx-bg-171717)] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50";

export function NotificationsSection() {
  const qc = useQueryClient();
  const [testing, setTesting] = useState<string | null>(null);

  const { data: status } = useQuery<NotificationStatus>({
    queryKey: ["notification-status"],
    queryFn: async () => (await settingsV2Api.notificationStatus()).data,
  });

  // The switches write the profile fields the delivery service reads, so a toggle always changes real behaviour.
  const toggle = useMutation({
    mutationFn: (body: Record<string, boolean>) => settingsApi.update(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-status"] }),
    onError: () => toast.error("Could not save the notification preference"),
  });

  const sendTest = async (channel: "email" | "telegram") => {
    setTesting(channel);
    try {
      const res = await settingsV2Api.testNotification(channel);
      toast.success(res.data.message);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "The test notification could not be sent");
    } finally {
      setTesting(null);
    }
  };

  return (
    <SettingSection>
      <SettingCard
        title="Delivery Channels"
        description="Where Applivo sends alerts such as interview requests, application results and failures"
        icon={<Radio className="w-4 h-4 text-white" />}
      >
        <div className="space-y-1">
          <SettingRow
            label="Email"
            description={
              status
                ? `Sent to ${status.email_address}.${status.email_server_configured ? "" : " Email sending is not configured on this server."}`
                : "Loading…"
            }
          >
            <Toggle
              checked={status?.email_enabled ?? false}
              onChange={(v) => toggle.mutate({ notify_via_email: v })}
              disabled={!status}
            />
          </SettingRow>

          <SettingRow
            label="Telegram"
            description={
              status?.telegram_connected
                ? "Connected. Alerts are delivered to your Telegram chat."
                : "Not connected. Connect Telegram to receive alerts there."
            }
          >
            {status?.telegram_connected ? (
              <Toggle
                checked={status.telegram_enabled}
                onChange={(v) => toggle.mutate({ notify_via_telegram: v })}
              />
            ) : (
              <Link href="/connect" className={testBtn}>
                Open Connections
              </Link>
            )}
          </SettingRow>

          <SettingRow
            label="Send a test message"
            description="Sends a real message through the channel and reports whether it was accepted."
          >
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => sendTest("email")} disabled={testing !== null} className={testBtn}>
                {testing === "email" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-zinc-400" />}
                <span>Email</span>
              </button>
              {status?.telegram_connected && (
                <button type="button" onClick={() => sendTest("telegram")} disabled={testing !== null} className={testBtn}>
                  {testing === "telegram" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>Telegram</span>
                </button>
              )}
            </div>
          </SettingRow>
        </div>
      </SettingCard>
    </SettingSection>
  );
}
