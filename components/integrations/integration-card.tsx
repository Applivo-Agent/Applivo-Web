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

const MANAGEABLE_PROVIDERS = new Set(["google_drive", "github", "google_calendar", "slack", "telegram", "notion", "calendly", "zapier", "make", "n8n"]);

const primaryBtn =
  "h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white text-[12px] font-semibold text-black hover:bg-zinc-200 transition-colors disabled:opacity-60";
const ghostBtn =
  "h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--app-border-strong)] bg-transparent hover:bg-white/[0.04] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors";
const iconBtn =
  "h-8 w-8 inline-flex items-center justify-center rounded-lg border border-[var(--app-border-strong)] bg-transparent hover:bg-white/[0.04] text-zinc-400 hover:text-white transition-colors";

interface IntegrationCardProps {
  item: IntegrationItem;
  connecting?: boolean;
  onConnect: (item: IntegrationItem) => void;
  onManage: (item: IntegrationItem) => void;
  onShowSetup: (item: IntegrationItem) => void;
  onDisconnect: (item: IntegrationItem) => void;
  onCheckHealth: (item: IntegrationItem) => void;
}

export function IntegrationCard({
  item,
  connecting,
  onConnect,
  onManage,
  onShowSetup,
  onDisconnect,
  onCheckHealth,
}: IntegrationCardProps) {
  const meta = STATUS_META[item.status] ?? STATUS_META.not_connected;
  const isConnected = item.status === "connected";
  const isManageable = MANAGEABLE_PROVIDERS.has(item.id);
  const canConnect =
    item.status === "not_connected" || item.status === "needs_reauth" || item.status === "error";
  const isWebhook = !!item.is_webhook;

  return (
    <div className="group rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)] hover:border-white/15 hover:bg-[var(--app-nested)] p-4 flex flex-col transition-colors">
      {/* Logo + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-[var(--app-nested)] border border-[var(--app-border-strong)] group-hover:border-white/15 flex items-center justify-center p-2 shrink-0 transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
            meta.tone
          )}
        >
          <meta.Icon className={cn("w-2.5 h-2.5", connecting && "animate-spin")} />
          {connecting ? "Connecting…" : meta.label}
        </span>
      </div>

      <h3 className="text-[14px] font-semibold text-white tracking-tight leading-5">{item.name}</h3>
      <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed line-clamp-2">{item.description}</p>

      {/* Actions */}
      <div className="mt-auto pt-3.5 flex items-center gap-2">
        {isConnected && (
          <>
            {isManageable && (
              <button type="button" onClick={() => onManage(item)} className={primaryBtn}>
                <Settings2 className="w-3.5 h-3.5" />
                Manage
              </button>
            )}
            {!isManageable && (
              <button type="button" onClick={() => onDisconnect(item)} className={primaryBtn}>
                Disconnect
              </button>
            )}
            <button
              type="button"
              onClick={() => onCheckHealth(item)}
              className={iconBtn}
              title="Check connection"
              aria-label={`Check ${item.name} connection`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {isManageable && (
              <button
                type="button"
                onClick={() => onDisconnect(item)}
                className={cn(iconBtn, "hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300")}
                title="Disconnect"
                aria-label={`Disconnect ${item.name}`}
              >
                <PlugZap className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}

        {canConnect && (
          <button
            type="button"
            onClick={() => (isWebhook ? onManage(item) : onConnect(item))}
            disabled={connecting}
            className={cn(primaryBtn, "min-w-[92px]")}
          >
            {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isWebhook ? "Configure" : item.status === "not_connected" ? "Connect" : item.status === "error" ? "Retry" : "Reconnect"}
          </button>
        )}

        {item.status === "setup_required" && (
          <button type="button" onClick={() => onShowSetup(item)} className={ghostBtn}>
            <Info className="w-3.5 h-3.5" />
            Set up
          </button>
        )}

        {item.status === "coming_soon" && (
          <button type="button" disabled className={cn(primaryBtn, "cursor-not-allowed bg-white/[0.06] text-zinc-500")}>
            <Clock className="w-3.5 h-3.5" />
            Coming soon
          </button>
        )}

        {item.status === "available_manually" && (
          <span className="text-[11px] text-zinc-500">Assisted preparation only</span>
        )}
      </div>
    </div>
  );
}
