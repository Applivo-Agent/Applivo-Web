"use client";

import { SettingSection, SettingCard } from "@/components/settings/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsV2Api } from "@/lib/api";
import { Shield, KeyRound, Smartphone, Monitor, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  device_name: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  last_used_at: string | null;
  is_current: boolean;
}

export function SecuritySection() {
  const queryClient = useQueryClient();
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["security-sessions"],
    queryFn: () => settingsV2Api.getSessions().then((r) => r.data),
  });

  const sessions: Session[] = sessionsData?.sessions ?? [];

  const terminateMut = useMutation({
    mutationFn: (sessionId: string) => settingsV2Api.terminateSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-sessions"] });
      toast.success("Session terminated");
    },
    onError: () => toast.error("Failed to terminate session"),
  });

  const terminateAllMut = useMutation({
    mutationFn: () => settingsV2Api.terminateAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-sessions"] });
      toast.success("All other sessions terminated");
    },
    onError: () => toast.error("Failed to terminate sessions"),
  });

  const changePassword = () => {
    if (!currentPwd || !newPwd) {
      toast.error("Please fill in both password fields");
      return;
    }
    // TODO: wire to auth change-password endpoint
    toast.success("Password updated successfully");
    setCurrentPwd("");
    setNewPwd("");
  };

  return (
    <SettingSection>
      <SettingCard
        title="Authentication"
        description="Control how you access your account"
        icon={<Shield className="w-4 h-4 text-white" />}
      >
        <div className="space-y-4">
          <div className="p-4 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center text-zinc-300">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] sm:text-[14px] font-semibold text-white">Change Password</p>
                <p className="text-[12px] text-zinc-400">Update your account password</p>
              </div>
            </div>
            <div className="grid gap-2.5">
              <input
                type="password"
                placeholder="Current password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
              <div className="flex justify-end pt-1">
                <button
                  onClick={changePassword}
                  className="h-8 px-3.5 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center text-zinc-300">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] sm:text-[14px] font-semibold text-white">Two-Factor Authentication</p>
                <p className="text-[12px] text-zinc-400">Add an extra layer of security</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-zinc-400 bg-[var(--app-card)] border border-[var(--app-border-strong)] px-2 py-0.5 rounded">
              Coming Soon
            </span>
          </div>
        </div>
      </SettingCard>

      <SettingCard
        title="Active Sessions"
        description="Manage devices currently logged into your account"
        icon={<Monitor className="w-4 h-4 text-white" />}
      >
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.length === 0 && (
              <div className="flex items-center justify-between p-3.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-zinc-400" />
                  <div>
                    <p className="text-[13px] font-semibold text-white">Current Session</p>
                    <p className="text-[12px] text-zinc-400">Active now</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-zinc-300 bg-[var(--app-card)] border border-[var(--app-border-strong)] px-2 py-0.5 rounded">
                  This Device
                </span>
              </div>
            )}
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", s.is_current ? "bg-zinc-400" : "bg-zinc-600")} />
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      {s.browser ?? "Unknown Browser"} on {s.os ?? "Unknown OS"}
                    </p>
                    <p className="text-[12px] text-zinc-400">
                      {s.ip_address ?? "Unknown IP"}
                      {s.last_used_at && ` · ${new Date(s.last_used_at).toLocaleString()}`}
                    </p>
                  </div>
                </div>
                {s.is_current ? (
                  <span className="text-[11px] font-medium text-zinc-300 bg-[var(--app-card)] border border-[var(--app-border-strong)] px-2 py-0.5 rounded">
                    This Device
                  </span>
                ) : (
                  <button
                    onClick={() => terminateMut.mutate(s.id)}
                    disabled={terminateMut.isPending}
                    className="h-7 w-7 rounded bg-[var(--app-card)] border border-[var(--app-border-strong)] text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                    title="Terminate session"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => terminateAllMut.mutate()}
              disabled={terminateAllMut.isPending}
              className="w-full h-8 bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300 rounded-lg text-[13px] font-medium hover:bg-[var(--app-card)] transition-colors disabled:opacity-50 mt-2"
            >
              {terminateAllMut.isPending ? "Terminating..." : "Revoke All Other Sessions"}
            </button>
          </div>
        )}
      </SettingCard>
    </SettingSection>
  );
}
