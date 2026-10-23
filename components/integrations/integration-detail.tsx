"use client";

import { ArrowLeft, CalendarClock, CheckCircle2, Layers, ShieldCheck, UserRound } from "lucide-react";
import type { IntegrationItem } from "@/lib/api";
import { IntegrationActions, STATUS_LOOKUP } from "./integration-card";
import { cn } from "@/lib/utils";

interface Props {
  item: IntegrationItem;
  connecting?: boolean;
  onBack: () => void;
  onConnect: (item: IntegrationItem) => void;
  onManage: (item: IntegrationItem) => void;
  onShowSetup: (item: IntegrationItem) => void;
  onDisconnect: (item: IntegrationItem) => void;
  onCheckHealth: (item: IntegrationItem) => void;
}

const fmt = (v?: string) => (v ? new Date(v).toLocaleString() : "—");

/** Hub-style detail: overview on the left, action + facts sidebar on the right. */
export function IntegrationDetail({ item, connecting, onBack, ...handlers }: Props) {
  const meta = STATUS_LOOKUP[item.status] ?? STATUS_LOOKUP.not_connected;
  const scopes = (item.granted_scopes ?? "").split(/[\s,]+/).filter(Boolean);
  const facts: [React.ComponentType<{ className?: string }>, string, string][] = [
    [Layers, "Category", item.category.replace(/_/g, " ")],
    [UserRound, "Account", item.account_name || item.account_email || item.account_identifier || "—"],
    [CalendarClock, "Connected", fmt(item.connected_at)],
    [CalendarClock, "Last sync", fmt(item.last_sync_at)],
  ];
  return (
    <div className="dash-page">
      <nav className="flex items-center gap-2 text-[13px] text-zinc-400">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />Connections
        </button>
        <span className="text-zinc-600">/</span>
        <span className="text-white">{item.name}</span>
      </nav>

      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.logo} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">{item.name}</h1>
          <p className="mt-0.5 text-[13px] text-zinc-400">{item.description}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="min-w-0 space-y-6">
          <div className="inline-flex rounded-md border border-[var(--app-border-strong)] bg-white/[0.04] px-3 h-8 items-center text-[13px] text-white">Overview</div>

          {item.status_message && (
            <p className="rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] px-3.5 py-2.5 text-[13px] text-zinc-300">{item.status_message}</p>
          )}

          <section>
            <h2 className="text-[16px] font-semibold text-white">What it does</h2>
            {item.capabilities?.length ? (
              <ul className="mt-2.5 space-y-2 text-[13px] text-zinc-300">
                {item.capabilities.map((c) => (
                  <li key={c} className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-px text-zinc-500 shrink-0" />{c}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-zinc-400">{item.description}</p>
            )}
          </section>

          {item.setup_notes && (
            <section>
              <h2 className="text-[16px] font-semibold text-white">Setup</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-300 whitespace-pre-line">{item.setup_notes}</p>
              {item.requires_config?.length ? (
                <p className="mt-2 text-[12px] text-zinc-500">Requires: {item.requires_config.join(", ")}</p>
              ) : null}
            </section>
          )}

          {scopes.length > 0 && (
            <section>
              <h2 className="text-[16px] font-semibold text-white">Permissions granted</h2>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {scopes.map((s) => (
                  <span key={s} className="rounded-md border border-[var(--app-border-strong)] bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-zinc-300 break-all">{s}</span>
                ))}
              </div>
            </section>
          )}

          <p className="flex items-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            Access tokens are encrypted at rest and never exposed to your browser. You can revoke access at any time.
          </p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4">
          <IntegrationActions item={item} connecting={connecting} {...handlers} />
          <div className="border-t border-[var(--app-border-strong)] pt-4 space-y-3">
            <div className={cn("flex items-center gap-2 text-[13px]", meta.tone.split(" ")[0])}>
              <meta.Icon className="w-4 h-4" />{connecting ? "Connecting…" : meta.label}
            </div>
            {facts.map(([Icon, label, value]) => (
              <div key={label} className="flex items-start gap-2.5 text-[13px]">
                <Icon className="w-4 h-4 mt-0.5 text-zinc-500 shrink-0" />
                <div className="min-w-0"><div className="text-[11px] text-zinc-500">{label}</div><div className="text-zinc-200 break-words">{value}</div></div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
