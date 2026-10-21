"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { integrationsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, RefreshCw, Trash2, Send } from "lucide-react";

interface WebhookEndpoint {
  id: string;
  provider: string;
  label?: string | null;
  subscribed_events: string[];
  enabled: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  url?: string | null;
}

interface Delivery {
  id: string;
  event_type: string;
  status: string;
  attempt_count: number;
  http_status?: number | null;
  response_body_excerpt?: string | null;
  error_message?: string | null;
  created_at?: string | null;
  delivered_at?: string | null;
}

interface WebhookConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: string; // zapier | make | n8n
  providerName: string;
  logo: string;
  setupNotes?: string;
  onSuccess?: () => void;
}

export function WebhookConfigModal({
  open,
  onOpenChange,
  provider,
  providerName,
  logo,
  setupNotes,
  onSuccess,
}: WebhookConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<WebhookEndpoint | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    if (open) {
      void loadInitial();
    }
  }, [open, provider]);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [endpointsResp, eventsResp] = await Promise.all([
        integrationsApi.listWebhookEndpoints(),
        integrationsApi.getSupportedWebhookEvents(),
      ]);
      const allEndpoints = endpointsResp.data?.endpoints || [];
      const providerEndpoints = allEndpoints.filter((e) => e.provider === provider);
      setEndpoints(providerEndpoints);
      const allEvents = eventsResp.data?.events || [];
      setEvents(allEvents);
      // Default sensible subset - commonly used events
      const defaults = allEvents.slice(0, 6);
      setSelectedEvents(new Set(defaults));
      if (providerEndpoints.length > 0) {
        setSelectedEndpoint(providerEndpoints[0]);
        await loadDeliveries(providerEndpoints[0].id);
      } else {
        setSelectedEndpoint(null);
        setDeliveries([]);
      }
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to load webhook configuration.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async (endpointId: string) => {
    try {
      const resp = await integrationsApi.getWebhookDeliveries(endpointId);
      setDeliveries(resp.data?.deliveries || []);
    } catch {
      // Silently ignore delivery load errors
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please provide a destination HTTPS URL.");
      return;
    }
    if (selectedEvents.size === 0) {
      toast.error("Please select at least one event.");
      return;
    }
    setSaving(true);
    try {
      await integrationsApi.createProviderWebhookEndpoint(provider, {
        url: url.trim(),
        events: Array.from(selectedEvents),
        label: label.trim() || null,
      });
      toast.success(`${providerName} webhook created.`);
      setUrl("");
      setLabel("");
      await loadInitial();
      onSuccess?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to create webhook.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (ep: WebhookEndpoint, enabled: boolean) => {
    try {
      await integrationsApi.updateWebhookEndpoint(ep.id, { enabled });
      toast.success(enabled ? "Webhook enabled" : "Webhook paused");
      await loadInitial();
      onSuccess?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to update webhook.";
      toast.error(msg);
    }
  };

  const handleDelete = async (ep: WebhookEndpoint) => {
    try {
      await integrationsApi.deleteWebhookEndpoint(ep.id);
      toast.success("Webhook deleted");
      await loadInitial();
      onSuccess?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to delete webhook.";
      toast.error(msg);
    }
  };

  const handleTest = async (ep: WebhookEndpoint) => {
    setTesting(true);
    try {
      await integrationsApi.testWebhookEndpoint(ep.id);
      toast.success("Test event sent");
      await loadDeliveries(ep.id);
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Test delivery failed.";
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  const toggleEvent = (ev: string) => {
    const next = new Set(selectedEvents);
    if (next.has(ev)) {
      next.delete(ev);
    } else {
      next.add(ev);
    }
    setSelectedEvents(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] bg-[#121215] border border-[var(--app-border-strong)] text-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center p-1.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={providerName} className="w-full h-full object-contain" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                Configure {providerName} Webhooks
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Connect outbound webhooks to receive Applivo events in your {providerName} workflows.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {setupNotes && (
              <div className="rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] p-3 text-[11px] text-zinc-400 leading-relaxed">
                {setupNotes}
              </div>
            )}

            <div className="rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] p-3 text-[11px] text-zinc-400">
              <strong className="text-zinc-300">Security notice: </strong>
              Payloads are signed with HMAC-SHA256; header X-Applivo-Signature. The signing secret is never exposed here.
            </div>

            {/* Create new webhook form */}
            <form onSubmit={handleCreate} className="space-y-4 border-b border-[var(--app-border-strong)] pb-6">
              <div className="space-y-1.5">
                <Label htmlFor="webhook-url" className="text-xs text-zinc-300">
                  Destination HTTPS URL
                </Label>
                <Input
                  id="webhook-url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-[var(--app-nested)] border-[var(--app-border-strong)] text-xs text-white placeholder:text-zinc-500"
                  required
                />
                <p className="text-[11px] text-zinc-400">
                  Copy this from your {providerName} webhook configuration.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="webhook-label" className="text-xs text-zinc-300">
                  Label (optional)
                </Label>
                <Input
                  id="webhook-label"
                  placeholder="Production alerts"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="bg-[var(--app-nested)] border-[var(--app-border-strong)] text-xs text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-300">Events to subscribe to</Label>
                <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 border border-[var(--app-border-strong)] rounded-lg bg-[var(--app-nested)]">
                  {events.map((ev) => (
                    <label key={ev} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:text-white">
                      <Checkbox
                        checked={selectedEvents.has(ev)}
                        onCheckedChange={() => toggleEvent(ev)}
                        className="border-zinc-600"
                      />
                      <span className="truncate">{ev}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving || !url.trim()}
                className="h-8 text-xs bg-white text-black hover:bg-zinc-200 font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save webhook"
                )}
              </Button>
            </form>

            {/* Existing endpoints */}
            {endpoints.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-zinc-300">Existing endpoints</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void loadInitial()}
                    className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {endpoints.map((ep) => (
                  <div key={ep.id} className="border border-[var(--app-border-strong)] rounded-lg p-3 bg-[var(--app-nested)] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white truncate">{ep.label || ep.url || ep.id}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{ep.url}</p>
                        <p className="text-[11px] text-zinc-500 mt-1">{ep.subscribed_events.length} events • {ep.enabled ? "Enabled" : "Paused"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEnabled(ep, !ep.enabled)}
                          className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
                        >
                          {ep.enabled ? "Pause" : "Enable"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTest(ep)}
                          disabled={testing}
                          className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
                        >
                          {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(ep)}
                          className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        setSelectedEndpoint(ep);
                        await loadDeliveries(ep.id);
                      }}
                      className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
                    >
                      View delivery history
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Delivery history */}
            {selectedEndpoint && deliveries.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-300">Delivery history for {selectedEndpoint.label || selectedEndpoint.id}</Label>
                <div className="max-h-48 overflow-y-auto border border-[var(--app-border-strong)] rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-[var(--app-nested)] sticky top-0">
                      <tr className="text-left text-zinc-400">
                        <th className="p-2 font-medium">Event</th>
                        <th className="p-2 font-medium">Status</th>
                        <th className="p-2 font-medium">HTTP</th>
                        <th className="p-2 font-medium">Attempts</th>
                        <th className="p-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.slice(0, 20).map((d) => (
                        <tr key={d.id} className="border-t border-[var(--app-border-strong)] text-zinc-300">
                          <td className="p-2 truncate">{d.event_type}</td>
                          <td className="p-2">{d.status}</td>
                          <td className="p-2">{d.http_status ?? "-"}</td>
                          <td className="p-2">{d.attempt_count}</td>
                          <td className="p-2 truncate">{d.delivered_at || d.created_at || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
