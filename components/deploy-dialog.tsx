"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useExtension } from "@/lib/extension";
import { extApi } from "@/lib/api";
import type { QueueItem } from "@/lib/extension-bridge";

const PRESELECT = 5;

const ERRORS: Record<string, string> = {
  already_running: "A run is already in progress.",
  queue_empty: "Nothing in the queue to apply to. Press Queue first.",
  run_cancelled: "This run was stopped.",
  subscription_required: "An active plan is required to run applications.",
  http_401: "The extension was disconnected. Reconnect it on the Connect page.",
  http_403: "The extension was disconnected. Reconnect it on the Connect page.",
  no_response: "The extension didn't respond. Reload this page and try again.",
  server_not_configured: "The extension isn't connected to your account yet.",
};

/** Confirmation step before the extension starts applying in the background. */
export function DeployDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { getQueue, startRun } = useExtension();
  const [items, setItems] = useState<QueueItem[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  // Pressing Apply is the authorization for THIS run; it is recorded server-side with the run (mode, time), and the
  // server (not this page) later decides whether each submit may happen.

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setItems(null);
    setError(null);
    void getQueue().then((r) => {
      if (cancelled) return;
      if (!r.ok) { setError(ERRORS[r.error ?? ""] ?? `Couldn't load the queue (${r.error}).`); setItems([]); return; }
      const list = r.items ?? [];
      setItems(list);
      // Preselect only the first few: one click must never apply to dozens of jobs.
      setPicked(new Set(list.slice(0, PRESELECT).map((i) => i.application_id)));
    });
    return () => { cancelled = true; };
  }, [open, getQueue]);

  if (!open) return null;

  const toggle = (id: string) =>
    setPicked((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const start = async () => {
    setStarting(true);
    let runId: string;
    try {
      const { data } = await extApi.createRun({ application_ids: Array.from(picked), mode: "auto_submit", acknowledge_auto_submit: true });
      runId = data.id;
    } catch (err) {
      setStarting(false);
      const e = err as { response?: { status?: number; data?: { detail?: { code?: string; message?: string } } } };
      const d = e.response?.data?.detail;
      if (e.response?.status === 402) { window.location.assign("/subscription?return_to=" + encodeURIComponent("/dashboard")); return; }
      toast.error(d?.message ?? "Could not start the run.");
      return;
    }
    const res = await startRun(runId);
    setStarting(false);
    if (res.ok) {
      toast.success(`Approve the run in the prompt on this page. ${res.count ?? n} job${(res.count ?? n) === 1 ? "" : "s"} will be applied to in the background.`);
      onClose();
    } else {
      void extApi.cancelRun(runId).catch(() => { });          // never leave an authorized run behind that nothing is executing
      toast.error(ERRORS[res.error ?? ""] ?? `Could not start (${res.error}).`);
    }
  };

  const n = picked.size;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-inset)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Start applying"
      >
        <div className="flex items-start justify-between border-b border-[var(--app-border-strong)] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Start applying</h3>
            <p className="mt-1 text-xs leading-5 text-[var(--sx-tx-a1a1aa)]">
              Applivo works through these jobs one at a time in ONE background tab of this Chrome window,
              using your own Internshala login. Applivo stays in front. Keep Chrome open.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-zinc-500 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-5 py-3">
          {items === null && (
            <div className="flex items-center gap-2 py-6 text-xs text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading your queue…</div>
          )}
          {items !== null && items.length === 0 && (
            <p className="py-6 text-xs text-zinc-400">{error ?? "Nothing is queued yet. Press Queue on the dashboard first."}</p>
          )}
          {items?.map((it) => (
            <label key={it.application_id} className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.03]">
              <input
                type="checkbox"
                checked={picked.has(it.application_id)}
                onChange={() => toggle(it.application_id)}
                className="mt-1 h-4 w-4 accent-white"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm text-white">{it.title}</span>
                <span className="block truncate text-xs text-zinc-500">{it.company}</span>
              </span>
            </label>
          ))}
        </div>

        <p className="border-t border-[var(--app-border-strong)] px-5 py-3 text-xs leading-5 text-zinc-300">
          <span className="font-semibold text-white">Applivo submits these applications for you.</span> Each one is filled and sent automatically
          when every required answer is known; a job that needs an answer only you have is skipped, never guessed. Pressing
          <span className="font-semibold text-white"> Apply</span> is your authorization for this run only, and you can stop it at any time.
        </p>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--app-border-strong)] px-5 py-4">
          <p className="text-[11px] text-zinc-500">
            {items && items.length > PRESELECT ? `First ${PRESELECT} preselected. ` : ""}About a minute between jobs, like a person would.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-xl border border-[var(--app-border-strong)] px-4 py-2 text-xs font-semibold text-white hover:bg-white/[0.05]">Cancel</button>
            <button
              onClick={start}
              disabled={n === 0 || starting}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-50"
            >
              {starting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Apply to {n} job{n === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
