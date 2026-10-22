"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  Square,
  ChevronRight,
  ChevronDown,
  Loader2,
  ArrowRight,
} from "lucide-react";
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

const OPENABLE: ExtRunStage[] = [
  "waiting_for_input",
  "ready_for_review",
  "outcome_unknown",
  "failed",
  "already_applied",
  "skipped",
  "submitted",
];

const safeUrl = (u: string | null) =>
  u && /^https:\/\/([a-z0-9-]+\.)*internshala\.com\//i.test(u) ? u : null;

interface RunPanelProps {
  totalJobs?: number;
  jobsToday?: number;
  highMatchJobs?: number;
  queueLength?: number;
  currentTask?: string | null;
}

export function RunPanel({
  totalJobs = 0,
  jobsToday = 0,
  highMatchJobs = 0,
  queueLength = 0,
  currentTask = null,
}: RunPanelProps) {
  const { stopRun } = useExtension();
  const qc = useQueryClient();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const { data } = useQuery({
    queryKey: ["ext-run-latest"],
    queryFn: () => extApi.latestRun().then((r) => r.data.run),
    refetchInterval: (q) => (q.state.data?.status === "active" ? 3000 : false),
    staleTime: 0,
  });

  const run: ExtRun | null | undefined = data;

  // Counts from real run items
  const count = (...stages: ExtRunStage[]) =>
    run ? run.items.filter((i) => stages.includes(i.stage)).length : 0;

  const submittedCount = count("submitted");
  const needsAttentionCount = count("waiting_for_input", "ready_for_review");
  const failedCount = count("failed", "outcome_unknown");
  const skippedCount = count("skipped", "already_applied");
  const finishedCount =
    submittedCount + needsAttentionCount + failedCount + skippedCount;
  const remainingCount = run ? Math.max(0, run.items.length - finishedCount) : 0;

  // Stop active run handler
  const handleStop = async () => {
    if (!run) return;
    try {
      await extApi.cancelRun(run.id);
    } catch {
      toast.error("Could not reach Applivo to stop the run.");
    }
    await stopRun();
    await qc.invalidateQueries({ queryKey: ["ext-run-latest"] });
  };

  // If dismissed, show restrained collapsed bar
  if (run && dismissed === run.id && run.status !== "active") {
    return (
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-medium text-white">
            Application Run Status
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#181818] border border-[#262626] text-[#737373]">
            Dismissed
          </span>
        </div>
        <button
          onClick={() => setDismissed(null)}
          className="h-7 px-2.5 rounded bg-[#181818] hover:bg-[#202020] border border-[#262626] text-[12px] font-medium text-[#929292] hover:text-[#EDEDED] transition-colors"
        >
          Show run details
        </button>
      </div>
    );
  }

  // Determine overall status label
  const getOverallStatus = () => {
    if (!run) return { label: "Idle", style: "bg-[#181818] border-[#262626] text-[#737373]" };
    if (run.status === "active") {
      if (needsAttentionCount > 0) {
        return { label: "Needs attention", style: "bg-[#1F1B16] border-[#3A2E20] text-[#D4A574]" };
      }
      return { label: "Running", style: "bg-[#181818] border-[#383838] text-white" };
    }
    if (run.status === "cancelled") {
      return { label: "Stopped", style: "bg-[#181818] border-[#2A2A2A] text-[#929292]" };
    }
    if (run.status === "completed") {
      if (needsAttentionCount > 0) {
        return { label: "Needs attention", style: "bg-[#1F1B16] border-[#3A2E20] text-[#D4A574]" };
      }
      if (failedCount > 0 && submittedCount === 0) {
        return { label: "Failed", style: "bg-[#1E1414] border-[#352020] text-[#D47474]" };
      }
      return { label: "Completed", style: "bg-[#181818] border-[#2A2A2A] text-[#EDEDED]" };
    }
    return { label: "Idle", style: "bg-[#181818] border-[#262626] text-[#737373]" };
  };

  const statusInfo = getOverallStatus();

  // Workflow 4 stages
  const isScraping = currentTask === "scrape_jobs";
  const scrapeStatus = isScraping ? "Running" : totalJobs > 0 ? "Completed" : "Waiting";
  const scrapeDetail = isScraping
    ? "Scraping listings..."
    : totalJobs > 0
    ? `${totalJobs} found${jobsToday ? ` (${jobsToday} today)` : ""}`
    : "No jobs scraped";

  const isAnalyzing = currentTask === "analyze_jobs";
  const analyzeStatus = isAnalyzing
    ? "Running"
    : highMatchJobs > 0
    ? "Completed"
    : totalJobs > 0
    ? "Waiting"
    : "Waiting";
  const analyzeDetail = isAnalyzing
    ? "Analyzing matches..."
    : highMatchJobs > 0
    ? `${highMatchJobs} high match jobs`
    : "0 scored";

  const isQueueing = currentTask === "queue_jobs";
  const hasQueued = queueLength > 0 || (run && run.items.length > 0);
  const queueStatus = isQueueing ? "Running" : hasQueued ? "Completed" : "Waiting";
  const queueDetail = isQueueing
    ? "Queueing..."
    : queueLength > 0
    ? `${queueLength} in queue`
    : run && run.items.length > 0
    ? `${run.items.length} queued for run`
    : "0 in queue";

  const isDeploying = run?.status === "active";
  const deployStatus = isDeploying
    ? "Running"
    : run?.status === "cancelled"
    ? "Stopped"
    : run?.status === "completed"
    ? failedCount > 0 && submittedCount === 0
      ? "Failed"
      : "Completed"
    : "Waiting";

  const deployDetail = run
    ? run.status === "cancelled"
      ? `${submittedCount} submitted · ${skippedCount} skipped`
      : run.status === "completed"
      ? `${submittedCount} of ${run.items.length} submitted`
      : `${finishedCount} of ${run.items.length} processed`
    : "Ready to deploy";

  const stages = [
    { name: "Scrape", status: scrapeStatus, detail: scrapeDetail, isCurrent: isScraping },
    { name: "Analyze", status: analyzeStatus, detail: analyzeDetail, isCurrent: isAnalyzing },
    { name: "Queue", status: queueStatus, detail: queueDetail, isCurrent: isQueueing },
    { name: "Deploy", status: deployStatus, detail: deployDetail, isCurrent: isDeploying },
  ];

  // Secondary timestamp line
  const timestampText = run
    ? run.mode === "auto_submit" && run.auto_submit_authorized_at
      ? `Automatic submission authorized ${new Date(run.auto_submit_authorized_at).toLocaleString()}`
      : run.ended_at
      ? `Run ended ${new Date(run.ended_at).toLocaleString()}`
      : run.created_at
      ? `Run started ${new Date(run.created_at).toLocaleString()}`
      : null
    : null;

  // Slice items for compact display
  const INITIAL_LIMIT = 5;
  const items = run?.items ?? [];
  const visibleItems = showAll ? items : items.slice(0, INITIAL_LIMIT);

  return (
    <div
      className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-4"
      aria-live="polite"
    >
      {/* ── Section Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--app-border-strong)]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-[15px] font-semibold text-white tracking-tight">
            Application Run Status
          </h3>
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-medium border inline-flex items-center gap-1",
              statusInfo.style
            )}
          >
            {run?.status === "active" && (
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
            )}
            {statusInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {run && run.status === "active" ? (
            <button
              onClick={() => void handleStop()}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded bg-[#181818] hover:bg-[#202020] border border-[#262626] text-[12px] font-medium text-[#EDEDED] transition-colors"
            >
              <Square className="h-3 w-3" />
              <span>Stop run</span>
            </button>
          ) : run ? (
            <button
              onClick={() => setDismissed(run.id)}
              className="h-7 px-2.5 rounded bg-[#181818] hover:bg-[#202020] border border-[#262626] text-[12px] font-medium text-[#929292] hover:text-[#EDEDED] transition-colors"
            >
              Dismiss
            </button>
          ) : null}

          <Link
            href="/applications"
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded bg-[#181818] hover:bg-[#202020] border border-[#262626] text-[12px] font-medium text-[#929292] hover:text-[#EDEDED] transition-colors"
          >
            <span>View details</span>
            <ChevronRight className="w-3 h-3 text-[#737373]" />
          </Link>
        </div>
      </div>

      {/* ── Summary Counts & Timestamp ────────────────────────────── */}
      <div>
        <p className="text-[13px] font-medium text-[#EDEDED]">
          {run
            ? `${submittedCount} submitted · ${needsAttentionCount} need attention · ${failedCount} failed · ${skippedCount} skipped · ${remainingCount} remaining`
            : "No active application runs. Queue matching applications and click Deploy to start."}
        </p>
        {timestampText && (
          <p className="text-[12px] text-[#737373] mt-0.5">
            {timestampText}
          </p>
        )}
      </div>

      {/* ── Workflow 4-Stage Process Indicator ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {stages.map((st, idx) => (
          <div
            key={st.name}
            className="bg-[#141414] border border-[#262626] rounded-md p-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-medium text-[#EDEDED]">
                {st.name}
              </span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[11px] font-medium border",
                  st.status === "Running"
                    ? "bg-[#1F1F1F] border-[#383838] text-white animate-pulse"
                    : st.status === "Completed"
                    ? "bg-[#181818] border-[#262626] text-[#B5B5B5]"
                    : st.status === "Stopped"
                    ? "bg-[#181818] border-[#2A2A2A] text-[#929292]"
                    : "bg-[#161616] border-[#222222] text-[#737373]"
                )}
              >
                {st.status}
              </span>
            </div>
            <p className="text-[12px] text-[#737373] mt-2 truncate">
              {st.detail}
            </p>
          </div>
        ))}
      </div>

      {/* ── Application Results List ──────────────────────────────── */}
      {items.length > 0 && (
        <div className="pt-1 space-y-2">
          <div className="divide-y divide-[#1C1C1C] border border-[#222222] rounded-md overflow-hidden bg-[#111111]">
            {visibleItems.map((it) => {
              const url = OPENABLE.includes(it.stage) ? safeUrl(it.job_url) : null;
              return (
                <div
                  key={it.application_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 hover:bg-[#151515] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-[#EDEDED] truncate">
                        {it.title}
                      </span>
                      {it.company && (
                        <span className="text-[12px] text-[#737373] truncate">
                          · {it.company}
                        </span>
                      )}
                    </div>
                    {it.detail && (
                      <p className="text-[12px] text-[#929292] mt-0.5 leading-snug">
                        {it.detail}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#1A1A1A] text-[#929292] border border-[#262626]">
                      {LABEL[it.stage] || it.stage}
                    </span>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-[#737373] hover:text-[#EDEDED] hover:bg-[#222222] transition-colors"
                        title={`Open ${it.title} on Internshala`}
                        aria-label={`Open ${it.title} on Internshala`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {items.length > INITIAL_LIMIT && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#929292] hover:text-[#EDEDED] transition-colors pt-1"
            >
              <span>
                {showAll
                  ? "Show fewer applications"
                  : `View all ${items.length} applications`}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  showAll && "rotate-180"
                )}
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
