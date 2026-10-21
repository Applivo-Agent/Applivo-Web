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

interface NotionDatabase {
  id: string;
  title?: string;
  [key: string]: unknown;
}

interface NotionConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onSuccess?: () => void;
}

export function NotionConfigModal({
  open,
  onOpenChange,
  itemName,
  onSuccess,
}: NotionConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; errors: number } | null>(null);

  useEffect(() => {
    if (open) {
      void loadDatabases();
    }
  }, [open]);

  const loadDatabases = async () => {
    setLoading(true);
    try {
      const resp = await integrationsApi.notionListDatabases();
      const dbs = (resp.data?.databases as NotionDatabase[]) || [];
      setDatabases(dbs);
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to load Notion databases.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const saveSelection = async () => {
    if (!selectedDb) {
      toast.error("Please select a database.");
      return;
    }
    const db = databases.find((d) => d.id === selectedDb);
    const title = (db?.title as string) || "Notion Database";
    setSaving(true);
    try {
      await integrationsApi.notionSelectDatabase({ database_id: selectedDb, database_title: title });
      toast.success("Destination database selected");
      onSuccess?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to save selection.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const syncNow = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const resp = await integrationsApi.notionSync();
      const data = resp.data;
      setSyncResult({ synced: data?.synced || 0, errors: data?.errors || 0 });
      toast.success(`Synced ${data?.synced || 0} items to Notion`);
      onSuccess?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Sync failed.";
      toast.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  const disconnect = async () => {
    try {
      await integrationsApi.disconnect("notion");
      toast.success(`${itemName} disconnected`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to disconnect.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-[#121215] border border-[var(--app-border-strong)] text-white p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center p-1.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/notion.svg" alt={itemName} className="w-full h-full object-contain" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                {itemName} Configuration
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Select a destination database and sync your job tracker.
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-300">Accessible databases</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void loadDatabases()}
                  className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto border border-[var(--app-border-strong)] rounded-lg bg-[var(--app-nested)]">
                {databases.length === 0 ? (
                  <p className="p-3 text-xs text-zinc-400">No databases found.</p>
                ) : (
                  databases.map((db) => {
                    const title = (db.title as string) || db.id;
                    return (
                      <label
                        key={db.id}
                        className="flex items-center gap-2 p-2 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.02] cursor-pointer border-b border-[var(--app-border-strong)] last:border-0"
                      >
                        <input
                          type="radio"
                          name="notion-db"
                          checked={selectedDb === db.id}
                          onChange={() => setSelectedDb(db.id)}
                          className="accent-white"
                        />
                        <span className="truncate">{title}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <Button
              type="button"
              onClick={saveSelection}
              disabled={saving || !selectedDb}
              className="h-8 text-xs bg-white text-black hover:bg-zinc-200 font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Select destination"
              )}
            </Button>

            <div className="space-y-2 pt-3 border-t border-[var(--app-border-strong)]">
              <Button
                type="button"
                onClick={syncNow}
                disabled={syncing}
                className="h-8 text-xs border border-[var(--app-border-strong)] bg-transparent text-zinc-300 hover:bg-white/[0.04] hover:text-white"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync now"
                )}
              </Button>
              {syncResult && (
                <p className="text-xs text-zinc-400">
                  Synced {syncResult.synced} items{syncResult.errors > 0 ? `, ${syncResult.errors} errors` : ""}.
                </p>
              )}
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
