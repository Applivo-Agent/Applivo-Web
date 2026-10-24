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
import { Label } from "@/components/ui/label";
import { integrationsApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

interface CalendlyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onSuccess?: () => void;
}

export function CalendlyModal({
  open,
  onOpenChange,
  itemName,
  onSuccess,
}: CalendlyModalProps) {
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<Array<Record<string, unknown>>>([]);
  const [events, setEvents] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (open) {
      void loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [typesResp, eventsResp] = await Promise.all([
        integrationsApi.calendlyEventTypes(),
        integrationsApi.calendlyEvents(),
      ]);
      setEventTypes(typesResp.data?.event_types || []);
      setEvents(eventsResp.data?.events || []);
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to load Calendly data.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      await integrationsApi.disconnect("calendly");
      toast.success(`${itemName} disconnected`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to disconnect.";
      toast.error(msg);
    }
  };

  const getName = (obj: Record<string, unknown>) => {
    return (obj.name as string) || (obj.title as string) || (obj.uri as string) || "";
  };

  const getDate = (obj: Record<string, unknown>) => {
    const start = (obj.start_time as string) || (obj.start_time_formatted as string) || (obj.created_at as string);
    if (!start) return "";
    try {
      return new Date(start).toLocaleString();
    } catch {
      return start;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-[var(--sx-bg-121215)] border border-[var(--app-border-strong)] text-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center p-1.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/calendly.svg" alt={itemName} className="w-full h-full object-contain" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                {itemName} Configuration
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                View your scheduling event types and recent scheduled events.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400">Calendar and scheduling data</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void loadData()}
                className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Refresh
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-300">Event types</Label>
              <div className="max-h-36 overflow-y-auto border border-[var(--app-border-strong)] rounded-lg bg-[var(--app-nested)]">
                {eventTypes.length === 0 ? (
                  <p className="p-3 text-xs text-zinc-400">No event types found.</p>
                ) : (
                  eventTypes.map((et, idx) => (
                    <div key={idx} className="p-2 text-xs text-zinc-300 border-b border-[var(--app-border-strong)] last:border-0">
                      {getName(et)}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-300">Recent scheduled events</Label>
              <div className="max-h-36 overflow-y-auto border border-[var(--app-border-strong)] rounded-lg bg-[var(--app-nested)]">
                {events.length === 0 ? (
                  <p className="p-3 text-xs text-zinc-400">No recent events.</p>
                ) : (
                  events.map((ev, idx) => (
                    <div key={idx} className="p-2 text-xs border-b border-[var(--app-border-strong)] last:border-0">
                      <p className="text-zinc-300">{getName(ev)}</p>
                      {getDate(ev) && <p className="text-[11px] text-zinc-400">{getDate(ev)}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--app-border-strong)]">
              <Button
                type="button"
                onClick={disconnect}
                className="h-8 text-xs border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
