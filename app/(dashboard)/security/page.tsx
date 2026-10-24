"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Key, Fingerprint, AlertTriangle, Laptop, Monitor, Smartphone, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { api, authApi } from "@/lib/api";
import { toast } from "sonner";

interface Session {
  id: string;
  device_name: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  location: string | null;
  is_current: boolean;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export default function SecurityPage() {
  const qc = useQueryClient();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["security-sessions"],
    queryFn: () => api.get("/auth/sessions").then((r) => r.data),
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => api.delete(`/auth/sessions/${sessionId}`),
    onSuccess: () => {
      toast.success("Session terminated");
      qc.invalidateQueries({ queryKey: ["security-sessions"] });
    },
    onError: () => toast.error("Failed to terminate session"),
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => api.delete("/auth/sessions"),
    onSuccess: () => {
      toast.success("Signed out of other sessions");
      qc.invalidateQueries({ queryKey: ["security-sessions"] });
    },
    onError: () => toast.error("Failed to sign out other sessions"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { current_password: string; new_password: string }) =>
      authApi.changePassword(payload),
    onSuccess: () => {
      toast.success("Password updated successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || "Failed to update password";
      toast.error(message);
    },
  });

  const getDeviceIcon = (deviceType: string | null) => {
    if (deviceType === "mobile") return <Smartphone className="w-4 h-4 text-white" />;
    if (deviceType === "desktop") return <Monitor className="w-4 h-4 text-white" />;
    return <Laptop className="w-4 h-4 text-white" />;
  };

  const getSessionTitle = (session: Session) => {
    if (session.device_name?.trim()) return session.device_name;
    const browser = session.browser?.trim();
    const os = session.os?.trim();
    if (browser && os) return `${os} - ${browser}`;
    if (browser) return browser;
    if (os) return os;
    return "Unknown Device";
  };

  const getSessionSubtitle = (session: Session) => {
    const left = session.is_current ? "Main (This session)" : "Other session";
    const right = session.location || session.ip_address || "Unknown location";
    return `${left} - ${right}`;
  };

  const hasOtherSessions = sessions.some((session) => !session.is_current);

  const handleUpdatePassword = () => {
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedCurrent || !trimmedNew || !trimmedConfirm) {
      toast.error("Please fill all password fields");
      return;
    }

    if (trimmedNew.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      toast.error("New password and confirm password do not match");
      return;
    }

    changePasswordMutation.mutate({
      current_password: trimmedCurrent,
      new_password: trimmedNew,
    });
  };

  const handleSignOutOthers = () => {
    if (!hasOtherSessions) {
      toast.info("No other active sessions to sign out");
      return;
    }
    revokeAllMutation.mutate();
  };

  return (
    <div className="space-y-4">

      <div className="grid gap-4">
        {/* Password Section */}
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] p-4 rounded-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-[14px] font-medium text-white">Password</h3>
              <p className="text-[12px] text-zinc-500">Choose a strong password you do not use anywhere else.</p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="h-8 px-3.5 bg-white text-black text-[13px] font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Update password
            </button>
          </div>
        </div>

        {/* Sessions Section */}
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] p-5 rounded-lg">
          <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4 flex items-center gap-2">
             <Fingerprint className="w-4 h-4 text-zinc-400" />
             Active Sessions
          </h3>
          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3.5 rounded-lg bg-transparent border border-[var(--app-border-strong)]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[var(--sx-bg-202025)] border border-[var(--app-border-strong)] flex items-center justify-center shrink-0">
                        {getDeviceIcon(session.device_type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-white truncate">{getSessionTitle(session)}</p>
                        <p className="text-[12px] text-zinc-400 truncate">{getSessionSubtitle(session)}</p>
                      </div>
                    </div>

                    {session.is_current ? (
                      <span className="text-[11px] font-medium text-zinc-300 bg-[var(--app-card)] px-2 py-0.5 rounded border border-[var(--app-border-strong)]">
                        Current
                      </span>
                    ) : (
                      <button
                        onClick={() => revokeMutation.mutate(session.id)}
                        disabled={revokeMutation.isPending}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Sign out this session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {!sessions.length && (
                  <div className="p-4 rounded-lg bg-transparent border border-[var(--app-border-strong)]">
                    <p className="text-[13px] text-zinc-400">No active sessions found.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--app-border-strong)]">
                <button
                  onClick={handleSignOutOthers}
                  disabled={revokeAllMutation.isPending}
                  className="h-8 px-3 bg-[var(--sx-bg-171717)] hover:bg-[var(--app-card)] text-white border border-[var(--app-border-strong)] text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {revokeAllMutation.isPending ? "Signing out..." : "Sign out of all other sessions"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight">Update Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-zinc-400">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] px-3 text-[13px] text-white placeholder-zinc-500 outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-zinc-400">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] px-3 text-[13px] text-white placeholder-zinc-500 outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-zinc-400">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] px-3 text-[13px] text-white placeholder-zinc-500 outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="h-8 px-3 rounded-md text-[13px] font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePassword}
                disabled={changePasswordMutation.isPending}
                className="h-8 px-3.5 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-60"
              >
                {changePasswordMutation.isPending ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
