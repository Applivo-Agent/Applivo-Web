"use client";

import { useState } from "react";
import {
  Puzzle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  PlugZap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Settings,
} from "lucide-react";
import { useExtension } from "@/lib/extension";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

const primaryBtn =
  "h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white text-[12px] font-semibold text-black hover:bg-zinc-200 transition-colors disabled:opacity-60";
const ghostBtn =
  "h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--app-border-strong)] bg-transparent hover:bg-white/[0.04] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors";

export function ExtensionPanel({ className }: { className?: string }) {
  const { status, info, busy, connect, disconnect, refresh } = useExtension();
  const [checking, setChecking] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await refresh();
      toast.success("Checked extension status");
    } catch {
      toast.error("Failed to check extension");
    } finally {
      setChecking(false);
    }
  };

  const copyChromeUrl = async () => {
    try {
      await navigator.clipboard.writeText("chrome://extensions");
      setCopiedUrl(true);
      toast.success("Copied chrome://extensions to clipboard");
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const badge =
    status === "connected"
      ? { text: "Connected", tone: "text-white border-white/15 bg-white/[0.08]", Icon: CheckCircle2 }
      : status === "expired"
      ? { text: "Needs reconnect", tone: "text-amber-400/90 border-amber-500/20 bg-amber-500/10", Icon: AlertTriangle }
      : status === "subscription_required"
      ? { text: "Plan required", tone: "text-amber-400/90 border-amber-500/20 bg-amber-500/10", Icon: AlertTriangle }
      : status === "disconnected"
      ? { text: "Installed", tone: "text-zinc-300 border-[var(--app-border-strong)] bg-white/[0.06]", Icon: PlugZap }
      : status === "checking"
      ? { text: "Checking…", tone: "text-zinc-400 border-[var(--app-border-strong)] bg-white/[0.04]", Icon: Loader2 }
      : { text: "Not installed", tone: "text-zinc-400 border-[var(--app-border-strong)] bg-white/[0.04]", Icon: Puzzle };

  return (
    <div
      className={cn(
        "group rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)] hover:border-white/15 hover:bg-[var(--app-nested)] p-4 flex flex-col transition-colors",
        className
      )}
    >
      {/* Logo + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] group-hover:border-white/15 flex items-center justify-center p-1.5 shrink-0 transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/applivo-emblem.png" alt="Applivo Browser Extension" className="w-full h-full object-contain" />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
            badge.tone
          )}
        >
          <badge.Icon className={cn("w-2.5 h-2.5", (status === "checking" || checking) && "animate-spin")} />
          {badge.text}
        </span>
      </div>

      <h3 className="text-[14px] font-semibold text-white tracking-tight leading-5">Applivo Browser Extension</h3>
      <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed line-clamp-2">
        Fill and submit supported job forms from your own browser session and logins.
      </p>

      {/* Compact status line */}
      {status === "connected" && (
        <p className="mt-2 text-[11px] text-zinc-400">
          Linked to <span className="text-zinc-200 font-medium">{info?.email || info?.name || "your account"}</span>
          {info?.version && <span className="text-zinc-500"> · v{info.version}</span>}
        </p>
      )}
      {status === "disconnected" && info?.version && (
        <p className="mt-2 text-[11px] text-zinc-500">Installed (v{info.version}) — ready to pair.</p>
      )}
      {status === "expired" && (
        <p className="mt-2 text-[11px] text-amber-300/80">Pairing expired or was revoked. Reconnect to continue.</p>
      )}
      {status === "subscription_required" && (
        <p className="mt-2 text-[11px] text-amber-300/80">An active Applivo plan is required for automated applications.</p>
      )}

      {/* Actions */}
      <div className="mt-auto pt-3.5 flex flex-wrap items-center gap-2">
        {status === "connected" && (
          <>
            <button type="button" onClick={() => void disconnect()} disabled={busy} className={primaryBtn}>
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Disconnect
            </button>
            <Link href="/settings" className={ghostBtn}>
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
          </>
        )}

        {(status === "disconnected" || status === "expired") && (
          <button type="button" onClick={() => void connect()} disabled={busy} className={primaryBtn}>
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {status === "expired" ? "Reconnect" : "Connect"}
          </button>
        )}

        {status === "subscription_required" && (
          <Link href="/subscription?return_to=%2Fconnect" className={primaryBtn}>
            View plans
          </Link>
        )}

        {status === "not_installed" && (
          <>
            <button type="button" onClick={handleRefresh} disabled={checking} className={primaryBtn}>
              <RefreshCw className={cn("w-3.5 h-3.5", checking && "animate-spin")} />
              {checking ? "Checking…" : "Check connection"}
            </button>
            <button
              type="button"
              onClick={() => setShowGuide((prev) => !prev)}
              className={ghostBtn}
              aria-expanded={showGuide}
            >
              {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Setup guide
            </button>
          </>
        )}
      </div>

      {/* Expandable setup guide (not installed only) */}
      {status === "not_installed" && showGuide && (
        <div className="mt-3 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] p-3.5 space-y-2 text-[12px]">
          <p className="text-zinc-400">Load the extension into Chrome, Brave, or Edge:</p>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center text-[11px] font-mono font-medium text-zinc-300 shrink-0">
              1
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-zinc-200 font-medium">Open </span>
              <code className="text-zinc-200 bg-[var(--app-card)] px-1.5 py-0.5 rounded border border-[var(--app-border-strong)]">
                chrome://extensions
              </code>
              <button
                type="button"
                onClick={copyChromeUrl}
                className="ml-2 inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                title="Copy URL"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-zinc-200" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center text-[11px] font-mono font-medium text-zinc-300 shrink-0">
              2
            </span>
            <div className="flex-1 min-w-0 text-zinc-400">
              <span className="text-zinc-200 font-medium">Enable Developer Mode</span> — toggle the top-right switch.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center text-[11px] font-mono font-medium text-zinc-300 shrink-0">
              3
            </span>
            <div className="flex-1 min-w-0 text-zinc-400">
              <span className="text-zinc-200 font-medium">Load unpacked</span> — select the{" "}
              <code className="text-zinc-200 bg-[var(--app-card)] px-1.5 py-0.5 rounded border border-[var(--app-border-strong)]">
                extension/
              </code>{" "}
              folder.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TILE_STATUS: Record<string, { text: string; tone: string }> = {
  connected: { text: "Connected", tone: "text-white" },
  expired: { text: "Needs reconnect", tone: "text-amber-400/90" },
  subscription_required: { text: "Plan required", tone: "text-amber-400/90" },
  disconnected: { text: "Installed", tone: "text-zinc-300" },
  checking: { text: "Checking…", tone: "text-zinc-400" },
  not_installed: { text: "Not installed", tone: "text-zinc-400" },
};

/** Fixed-size tile matching the other connection tiles; actions live in the detail view so the grid never reflows. */
export function ExtensionCard({ onOpen }: { onOpen: () => void }) {
  const { status } = useExtension();
  const meta = TILE_STATUS[status] ?? TILE_STATUS.not_installed;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group text-left rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)] hover:border-white/20 hover:bg-[var(--app-nested)] p-4 flex flex-col transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/applivo-emblem.png" alt="" className="w-full h-full object-contain" />
        </div>
        <span className={cn("text-[11px] whitespace-nowrap", meta.tone)}>{meta.text}</span>
      </div>
      <h3 className="mt-3 text-[14px] font-semibold text-white tracking-tight leading-5">Applivo Browser Extension</h3>
      <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed line-clamp-2">
        Fill and submit supported job forms from your own browser session and logins.
      </p>
    </button>
  );
}
