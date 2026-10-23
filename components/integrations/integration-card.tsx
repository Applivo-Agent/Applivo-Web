"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  PlugZap,
  RefreshCw,
  Settings2,
} from "lucide-react";
import type { IntegrationItem } from "@/lib/api";
import { cn } from "@/lib/utils";

type StatusTone = {
  label: string;
  tone: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const STATUS_META: Record<string, StatusTone> = {
  connected: {
    label: "Connected",
    tone: "text-white border-white/15 bg-white/[0.08]",
    Icon: CheckCircle2,
  },
  not_connected: {
    label: "Not connected",
    tone: "text-zinc-400 border-[var(--app-border-strong)] bg-white/[0.03]",
    Icon: PlugZap,
  },
  needs_reauth: {
    label: "Needs reconnect",
    tone: "text-amber-400/90 border-amber-500/20 bg-amber-500/10",
    Icon: AlertTriangle,
  },
  error: {
    label: "Error",
    tone: "text-red-400/90 border-red-500/20 bg-red-500/10",
    Icon: AlertTriangle,
  },
  setup_required: {
    label: "Setup required",
    tone: "text-amber-400/90 border-amber-500/20 bg-amber-500/10",
    Icon: Info,
  },
  coming_soon: {
    label: "Coming soon",
    tone: "text-zinc-500 border-[var(--app-border-strong)] bg-white/[0.02]",
    Icon: Clock,
  },
  available_manually: {
    label: "Manual only",
    tone: "text-zinc-400 border-[var(--app-border-strong)] bg-white/[0.03]",
    Icon: Info,
  },
};

export const STATUS_LOOKUP = STATUS_META;

const MANAGEABLE_PROVIDERS = new Set(["google_drive", "github", "google_calendar", "slack", "telegram", "notion", "calendly", "zapier", "make", "n8n"]);

const primaryBtn =
  "h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white text-[12px] font-semibold text-black hover:bg-zinc-200 transition-colors disabled:opacity-60";
const ghostBtn =
  "h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--app-border-strong)] bg-transparent hover:bg-white/[0.04] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors";

interface Handlers {
  onConnect: (item: IntegrationItem) => void;
  onManage: (item: IntegrationItem) => void;
  onShowSetup: (item: IntegrationItem) => void;
  onDisconnect: (item: IntegrationItem) => void;
  onCheckHealth: (item: IntegrationItem) => void;
}

/** Hub-style tile: logo, status, name, description, footer. The whole tile opens the detail view. */
export function IntegrationCard({ item, connecting, onOpen }: { item: IntegrationItem; connecting?: boolean; onOpen: (item: IntegrationItem) => void }) {
  const meta = STATUS_META[item.status] ?? STATUS_META.not_connected;
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group text-left rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)] hover:border-white/20 hover:bg-[var(--app-nested)] p-4 flex flex-col transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-6 h-6 rounded-[5px] overflow-hidden flex items-center justify-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.logo} alt="" className="w-full h-full object-contain" />
        </div>
        <span className={cn("inline-flex items-center gap-1 text-[11px] whitespace-nowrap", meta.tone.split(" ")[0])}>
          <meta.Icon className={cn("w-3 h-3", connecting && "animate-spin")} />
          {connecting ? "Connecting…" : meta.label}
        </span>
      </div>
      <h3 className="mt-3 text-[14px] font-semibold text-white tracking-tight leading-5">{item.name}</h3>
      <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed line-clamp-2">{item.description}</p>
    </button>
  );
}

export function IntegrationActions({ item, connecting, onConnect, onManage, onShowSetup, onDisconnect, onCheckHealth }: Handlers & { item: IntegrationItem; connecting?: boolean }) {
  const isConnected = item.status === "connected";
  const isManageable = MANAGEABLE_PROVIDERS.has(item.id);
  const canConnect = item.status === "not_connected" || item.status === "needs_reauth" || item.status === "error";
  const isWebhook = !!item.is_webhook;
  const wide = cn(primaryBtn, "w-full h-10 text-[13px]");
  return (
    <div className="flex flex-col gap-2">
      {canConnect && (
        <button type="button" onClick={() => (isWebhook ? onManage(item) : onConnect(item))} disabled={connecting} className={wide}>
          {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isWebhook ? "Configure" : item.status === "not_connected" ? `Connect ${item.name}` : item.status === "error" ? "Retry" : "Reconnect"}
        </button>
      )}
      {isConnected && isManageable && (
        <button type="button" onClick={() => onManage(item)} className={wide}>
          <Settings2 className="w-3.5 h-3.5" />Manage
        </button>
      )}
      {isConnected && (
        <>
          <button type="button" onClick={() => onCheckHealth(item)} className={cn(ghostBtn, "w-full h-9")}>
            <RefreshCw className="w-3.5 h-3.5" />Check connection
          </button>
          <button type="button" onClick={() => onDisconnect(item)} className={cn(ghostBtn, "w-full h-9 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300")}>
            <PlugZap className="w-3.5 h-3.5" />Disconnect
          </button>
        </>
      )}
      {item.status === "setup_required" && (
        <button type="button" onClick={() => onShowSetup(item)} className={wide}>
          <Info className="w-3.5 h-3.5" />Set up
        </button>
      )}
      {item.status === "coming_soon" && (
        <button type="button" disabled className={cn(wide, "cursor-not-allowed bg-white/[0.06] text-zinc-500")}>
          <Clock className="w-3.5 h-3.5" />Coming soon
        </button>
      )}
      {item.status === "available_manually" && <p className="text-[12px] text-zinc-500">Assisted preparation only — nothing to connect.</p>}
    </div>
  );
}
