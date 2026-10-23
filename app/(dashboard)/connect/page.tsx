"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import { ExtensionCard, ExtensionPanel } from "@/components/extension-card";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { IntegrationDetail } from "@/components/integrations/integration-detail";
import { GoogleDriveModal } from "@/components/integrations/google-drive-modal";
import { GitHubSyncModal } from "@/components/integrations/github-sync-modal";
import { CalendarEventModal } from "@/components/integrations/calendar-event-modal";
import { SetupInfoModal } from "@/components/integrations/setup-info-modal";
import { DisconnectDialog } from "@/components/integrations/disconnect-dialog";
import { WebhookConfigModal } from "@/components/integrations/webhook-config-modal";
import { SlackConfigModal } from "@/components/integrations/slack-config-modal";
import { TelegramConfigModal } from "@/components/integrations/telegram-config-modal";
import { NotionConfigModal } from "@/components/integrations/notion-config-modal";
import { CalendlyModal } from "@/components/integrations/calendly-modal";
import {
  integrationsApi,
  type IntegrationItem,
  type IntegrationsSummary,
} from "@/lib/api";

const CALLBACK_ERRORS: Record<string, string> = {
  missing_parameters: "The authorization response was incomplete. Please try again.",
  invalid_or_expired_state: "This authorization link expired or was already used. Please start again.",
  invalid_state_user: "We could not verify your session for this authorization.",
  unsupported_provider: "That integration is not available.",
  exchange_failed: "The provider rejected the authorization. Please try again.",
  access_denied: "You declined the authorization request.",
};

const EXTENSION_KEYWORDS = ["extension", "internshala", "browser", "platform", "companion"];

export default function ConnectPage() {
  const [items, setItems] = useState<IntegrationItem[]>([]);
  const [summary, setSummary] = useState<IntegrationsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [manageItem, setManageItem] = useState<IntegrationItem | null>(null);
  const [setupItem, setSetupItem] = useState<IntegrationItem | null>(null);
  const [disconnectItem, setDisconnectItem] = useState<IntegrationItem | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [listResp, summaryResp] = await Promise.all([
        integrationsApi.list(),
        integrationsApi.summary(),
      ]);
      setItems(listResp.data ?? []);
      setSummary(summaryResp.data ?? null);
    } catch {
      setLoadError("We could not load your connections. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");
    const provider = params.get("provider");

    if (connected === "1") {
      toast.success(`${prettyProvider(provider)} connected successfully.`);
    } else if (error) {
      toast.error(CALLBACK_ERRORS[error] ?? "Connection could not be completed.");
    }

    if (connected || error) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    void load();
  }, [load]);

  const handleConnect = async (item: IntegrationItem) => {
    if (item.is_webhook) {
      setManageItem(item);
      return;
    }
    setConnectingId(item.id);
    try {
      const resp = await integrationsApi.getAuthUrl(item.id);
      const url = resp.data?.auth_url;
      if (!url) throw new Error("missing auth url");
      window.location.href = url;
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || `Could not start authorization for ${item.name}.`);
      setConnectingId(null);
    }
  };

  const handleCheckHealth = async (item: IntegrationItem) => {
    try {
      const resp = await integrationsApi.checkHealth(item.id);
      if (resp.data?.healthy) {
        toast.success(`${item.name} is connected and healthy.`);
      } else if (resp.data?.status === "needs_reauth") {
        toast.error(`${item.name} needs to be reconnected.`);
      } else {
        toast.error(`${item.name} health check failed.`);
      }
    } catch {
      toast.error(`Could not verify ${item.name}.`);
    } finally {
      await load();
    }
  };

  const confirmDisconnect = async () => {
    if (!disconnectItem) return;
    setIsDisconnecting(true);
    try {
      await integrationsApi.disconnect(disconnectItem.id);
      toast.success(`${disconnectItem.name} disconnected.`);
      setDisconnectItem(null);
      await load();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || `Failed to disconnect ${disconnectItem.name}.`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();

  const matchesQuery = useCallback(
    (item: IntegrationItem) => {
      if (!normalizedQuery) return true;
      const haystack = [item.name, item.description, item.category].join(" ").toLowerCase();
      return haystack.includes(normalizedQuery);
    },
    [normalizedQuery]
  );

  const visibleItems = useMemo(
    () => items.filter((item) => !item.is_browser_platform && matchesQuery(item)),
    [items, matchesQuery]
  );

  const showExtension = useMemo(
    () =>
      !normalizedQuery ||
      EXTENSION_KEYWORDS.some((k) => k.includes(normalizedQuery) || normalizedQuery.includes(k)),
    [normalizedQuery]
  );

  const totalVisible = visibleItems.length + (showExtension ? 1 : 0);

  const selected = selectedId ? items.find((i) => i.id === selectedId) ?? null : null;

  return (
    <>
    {selectedId === "__extension" ? (
      <div className="dash-page">
        <nav className="flex items-center gap-2 text-[13px] text-zinc-400">
          <button type="button" onClick={() => setSelectedId(null)} className="hover:text-white transition-colors">← Connections</button>
          <span className="text-zinc-600">/</span>
          <span className="text-white">Applivo Browser Extension</span>
        </nav>
        <ExtensionPanel className="max-w-xl" />
      </div>
    ) : selected ? (
      <IntegrationDetail
        item={selected}
        connecting={connectingId === selected.id}
        onBack={() => setSelectedId(null)}
        onConnect={handleConnect}
        onManage={setManageItem}
        onShowSetup={setSetupItem}
        onDisconnect={setDisconnectItem}
        onCheckHealth={handleCheckHealth}
      />
    ) : (
    <div className="dash-page">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div />
        {summary && (
          <div className="flex items-center gap-2 text-[12px] text-zinc-400 shrink-0">
            <span>
              <strong className="text-white">{summary.connected_count}</strong> connected
            </span>
            <span className="w-px h-3.5 bg-[var(--app-border-strong)]" />
            <span className={summary.attention_count > 0 ? "text-amber-400/90" : "text-zinc-400"}>
              {summary.attention_count > 0 ? `${summary.attention_count} need attention` : "All healthy"}
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] px-3 h-9 w-full max-w-sm">
        <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search connections…"
          className="w-full bg-transparent text-[13px] text-white placeholder:text-zinc-500 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-zinc-500 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-[168px] rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)] animate-pulse"
            />
          ))}
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)] p-6 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-[13px] text-zinc-300">{loadError}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="h-8 px-3.5 inline-flex items-center gap-2 rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] hover:bg-[var(--app-card)] text-[13px] font-medium text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : totalVisible === 0 ? (
        <div className="rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)] p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-[13px] text-zinc-400">
            No connections match &ldquo;{query}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="h-8 px-3.5 inline-flex items-center gap-2 rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] hover:bg-[var(--app-card)] text-[13px] font-medium text-white transition-colors"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {showExtension && <ExtensionCard onOpen={() => setSelectedId("__extension")} />}
          {visibleItems.map((item) => (
            <IntegrationCard
              key={item.id}
              item={item}
              connecting={connectingId === item.id}
              onOpen={(i) => setSelectedId(i.id)}
            />
          ))}
        </div>
      )}

      <p className="flex items-center gap-2 text-[11px] text-zinc-500 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        Access tokens are encrypted at rest (AES-256-GCM) and never exposed to your browser. You can revoke access at any time by disconnecting.
      </p>
    </div>
    )}

      {manageItem?.id === "google_drive" && (
        <GoogleDriveModal
          open
          onOpenChange={(open) => {
            if (!open) setManageItem(null);
          }}
          onSuccess={load}
        />
      )}
      {manageItem?.id === "github" && (
        <GitHubSyncModal
          open
          onOpenChange={(open) => {
            if (!open) setManageItem(null);
          }}
          onSuccess={load}
        />
      )}
      {manageItem?.id === "google_calendar" && (
        <CalendarEventModal
          open
          onOpenChange={(open) => {
            if (!open) setManageItem(null);
          }}
          onSuccess={load}
        />
      )}
      {(manageItem?.id === "zapier" || manageItem?.id === "make" || manageItem?.id === "n8n") && (
        <WebhookConfigModal
          open
          onOpenChange={(open) => {
            if (!open) setManageItem(null);
          }}
          provider={manageItem.id}
          providerName={manageItem.name}
          logo={manageItem.logo}
          setupNotes={manageItem.setup_notes}
          onSuccess={load}
        />
      )}
      {manageItem?.id === "slack" && (
        <SlackConfigModal
          open
          onOpenChange={(open) => {
            if (!open) setManageItem(null);
          }}
          itemName={manageItem.name}
          accountIdentifier={manageItem.account_identifier}
          onSuccess={load}
        />
      )}
      {manageItem?.id === "telegram" && (
        <TelegramConfigModal
          open
          onOpenChange={(open) => {
            if (!open) setManageItem(null);
          }}
          itemName={manageItem.name}
          isConnected={manageItem.status === "connected"}
          onSuccess={load}
        />
      )}
      {manageItem?.id === "notion" && (
        <NotionConfigModal
          open
          onOpenChange={(open) => {
            if (!open) setManageItem(null);
          }}
          itemName={manageItem.name}
          onSuccess={load}
        />
      )}
      {manageItem?.id === "calendly" && (
        <CalendlyModal
          open
          onOpenChange={(open) => {
            if (!open) setManageItem(null);
          }}
          itemName={manageItem.name}
          onSuccess={load}
        />
      )}

      <SetupInfoModal
        open={!!setupItem}
        onOpenChange={(open) => {
          if (!open) setSetupItem(null);
        }}
        integration={setupItem}
      />

      <DisconnectDialog
        open={!!disconnectItem}
        onOpenChange={(open) => {
          if (!open && !isDisconnecting) setDisconnectItem(null);
        }}
        providerName={disconnectItem?.name ?? ""}
        providerId={disconnectItem?.id ?? ""}
        accountIdentifier={disconnectItem?.account_identifier}
        onConfirm={confirmDisconnect}
        isDisconnecting={isDisconnecting}
      />
    </>
  );
}

function prettyProvider(provider: string | null): string {
  if (!provider) return "Integration";
  return provider
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
