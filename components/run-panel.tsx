"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleDashed, ExternalLink, Loader2, MinusCircle, ShieldCheck, Square, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useExtension } from "@/lib/extension";
import { extApi, type ExtRun, type ExtRunStage } from "@/lib/api";
import { cn } from "@/lib/utils";

const LABEL: Record<ExtRunStage, string> = {
  queued: "Queued",
  opening: "Opening application",
  detecting_fields: "Detecting fields",
  preparing_answers: "Preparing answers",
  filling: "Filling answers",
  validating: "Validating form",
  ready_to_submit: "Ready to submit",
  submitting: "Submitting",
  waiting_for_input: "Needs your attention",
  ready_for_review: "Ready for review",
  submitted: "Application submitted",
  failed: "Failed",
  skipped: "Skipped",
  outcome_unknown: "Outcome unknown",
  already_applied: "Already applied",
};

const WORKING: ExtRunStage[] = ["opening", "detecting_fields", "preparing_answers", "filling", "validating", "ready_to_submit", "submitting"];
const OPENABLE: ExtRunStage[] = ["waiting_for_input", "ready_for_review", "outcome_unknown", "failed", "already_applied"];

function Icon({ stage }: { stage: ExtRunStage }) {
  if (stage === "submitted") return <CheckCircle2 className="h-4 w-4 text-zinc-300" aria-hidden />;
  if (stage === "failed") return <XCircle className="h-4 w-4 text-zinc-300" aria-hidden />;
  if (stage === "skipped" || stage === "already_applied") return <MinusCircle className="h-4 w-4 text-zinc-400" aria-hidden />;
  if (stage === "waiting_for_input" || stage === "ready_for_review" || stage === "outcome_unknown") return <AlertTriangle className="h-4 w-4 text-zinc-300" aria-hidden />;
  if (WORKING.includes(stage)) return <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden />;
  return <CircleDashed className="h-4 w-4 text-zinc-600" aria-hidden />;
}

const safeUrl = (u: string | null) => (u && /^https:\/\/([a-z0-9-]+\.)*internshala\.com\//i.test(u) ? u : null);

/** Live, server-verified progress of a background run, with Stop. Nothing here depends on the extension's own view. */
export function RunPanel() {
  const { stopRun } = useExtension();
  const qc = useQueryClient();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const { data } = useQuery({
    queryKey: ["ext-run-latest"],
    queryFn: () => extApi.latestRun().then((r) => r.data.run),
    refetchInterval: (q) => (q.state.data?.status === "active" ? 3000 : false),
    staleTime: 0,
  });
  const run: ExtRun | null | undefined = data;
  if (!run || run.items.length === 0 || (run.status !== "active" && dismissed === run.id)) return null;

  const active = run.status === "active";
  const count = (...s: ExtRunStage[]) => run.items.filter((i) => s.includes(i.stage)).length;
  const finished = count("submitted", "failed", "skipped", "outcome_unknown", "ready_for_review", "waiting_for_input", "already_applied");
  const pct = Math.round((finished / run.items.length) * 100);

  const stop = async () => {
    try { await extApi.cancelRun(run.id); } catch { toast.error("Could not reach Applivo to stop the run."); }
    await stopRun();                                         // also tell the extension, so nothing else starts
    await qc.invalidateQueries({ queryKey: ["ext-run-latest"] });
  };

  return (
    <div className="rounded-2xl border border-[var(--app-border-strong)] bg-[var(--app-inset)] p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            {active ? "Applying in the background" : run.status === "cancelled" ? "Run stopped" : "Run finished"}
          </h3>
          <p className="mt-0.5 text-xs text-[#A1A1AA]">
            {count("submitted")} submitted · {count("ready_for_review", "waiting_for_input")} need you · {count("failed", "outcome_unknown")} failed or unclear ·{" "}
            {count("skipped", "already_applied")} skipped or already applied · {run.items.length - finished} left
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            {run.mode === "auto_submit"
              ? `Automatic submission authorized${run.auto_submit_authorized_at ? ` ${new Date(run.auto_submit_authorized_at).toLocaleString()}` : ""}`
              : "Review mode: nothing is submitted without you"}
          </p>
        </div>
        {active ? (
          <button onClick={() => void stop()} className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--app-border-strong)] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-600">
            <Square className="h-3 w-3" aria-hidden /> Stop run
          </button>
        ) : (
          <button onClick={() => setDismissed(run.id)} className="rounded-xl border border-[var(--app-border-strong)] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/[0.05]">
            Dismiss
          </button>
        )}
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn("h-full rounded-full bg-white transition-all")} style={{ width: `${pct}%` }} />
      </div>

      <ul className="mt-4 space-y-1">
        {run.items.map((it) => {
          const url = OPENABLE.includes(it.stage) ? safeUrl(it.job_url) : null;
          return (
            <li key={it.application_id} className="flex items-start gap-3 rounded-xl px-2 py-2">
              <span className="mt-0.5"><Icon stage={it.stage} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-white">{it.title}</span>
                <span className="block truncate text-xs text-zinc-500">
                  {it.company}{it.detail ? ` · ${it.detail}` : ""}
                  {it.stage === "preparing_answers" ? " · generating answers" : ""}
                  {it.submit_authorized && WORKING.includes(it.stage) ? " · auto-submit authorized" : ""}
                </span>
              </span>
              <span className="flex items-center gap-2 text-xs text-zinc-400">
                {LABEL[it.stage]}
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-zinc-300 underline-offset-2 hover:underline" aria-label={`Open ${it.title} on Internshala`}>
                    Open <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
