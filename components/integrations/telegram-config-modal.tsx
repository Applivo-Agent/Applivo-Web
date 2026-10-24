"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { integrationsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ExternalLink, Copy } from "lucide-react";

interface TelegramConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  isConnected?: boolean;
  onSuccess?: () => void;
}

export function TelegramConfigModal({
  open,
  onOpenChange,
  itemName,
  isConnected,
  onSuccess,
}: TelegramConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [codeData, setCodeData] = useState<{
    code: string;
    expires_in: number;
    deep_link: string;
    bot_username: string;
  } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  React.useEffect(() => {
    if (!open) {
      setCodeData(null);
      setCountdown(null);
    }
  }, [open]);

  React.useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setInterval(() => {
      setCountdown((c) => (c !== null && c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const generateCode = async () => {
    setLoading(true);
    try {
      const resp = await integrationsApi.telegramGenerateLinkCode();
      const data = resp.data;
      setCodeData(data);
      setCountdown(data?.expires_in || 300);
      toast.success("Link code generated");
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to generate link code.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!codeData?.code) return;
    try {
      await navigator.clipboard.writeText(codeData.code);
      toast.success("Code copied");
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const unlink = async () => {
    try {
      await integrationsApi.telegramUnlink();
      toast.success("Telegram unlinked");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to unlink.";
      toast.error(msg);
    }
  };

  const formatTime = (sec: number | null) => {
    if (sec === null || sec < 0) return "Expired";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-[var(--sx-bg-121215)] border border-[var(--app-border-strong)] text-white p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center p-1.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/telegram.svg" alt={itemName} className="w-full h-full object-contain" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                {itemName} Configuration
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Link your Telegram account to receive job alerts and reminders.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {isConnected ? (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400">
                Status: <span className="text-white">Linked</span>
              </div>
              <Button
                type="button"
                onClick={unlink}
                className="h-8 text-xs border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
              >
                Unlink
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Generate a one-time link code to connect your Telegram account.
              </p>
              {!codeData ? (
                <Button
                  type="button"
                  onClick={generateCode}
                  disabled={loading}
                  className="h-8 text-xs bg-white text-black hover:bg-zinc-200 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate link code"
                  )}
                </Button>
              ) : (
                <div className="space-y-3 border border-[var(--app-border-strong)] rounded-lg p-3 bg-[var(--app-nested)]">
                  <div>
                    <p className="text-[11px] text-zinc-400 mb-1">One-time code</p>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono text-white tracking-widest">{codeData.code}</code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={copyCode}
                        className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-[11px] text-amber-400/90 mt-1">
                      {countdown !== null && countdown > 0 ? `Expires in ${formatTime(countdown)}` : "Expired - generate a new code"}
                    </p>
                  </div>
                  {codeData.deep_link && (
                    <Button
                      type="button"
                      onClick={() => window.open(codeData.deep_link, "_blank")}
                      className="h-8 text-xs bg-white text-black hover:bg-zinc-200 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Open t.me deep link
                    </Button>
                  )}
                  <p className="text-[11px] text-zinc-400">
                    Send <code className="text-zinc-300">/start link_{codeData.code}</code> to @{codeData.bot_username} on Telegram.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
