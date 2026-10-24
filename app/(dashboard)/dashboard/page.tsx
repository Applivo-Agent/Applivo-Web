"use client";
import { IconTile } from "@/components/app-cards";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsApi, agentApi, applicationsApi, jobsApi, quotasApi } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { getPlanAnalyzeBudget } from "@/lib/subscription";
import { useAuth } from "@/lib/auth";
import { useAgentStatus } from "@/lib/agent-status";
import { useExtension } from "@/lib/extension";
import { DeployDialog } from "@/components/deploy-dialog";
import { RunPanel } from "@/components/run-panel";
import { motion, useSpring } from "framer-motion";
import { cn, formatDate, getStatusClass, getStatusLabel, getMatchBadgeClass, timeAgo } from "@/lib/utils";
import {
  Briefcase, FileText, Send, TrendingUp, Clock, Zap,
  AlertCircle, Star, ChevronRight, Play, Pause, RefreshCw, CheckCircle,
  Activity, Target, Rocket, Lock, ExternalLink, Crown,
  Loader2, Calendar, BarChart3, Infinity as InfinityIcon, Bot, Flame
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useEffect, useState } from "react";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <span>{display.toLocaleString()}{suffix}</span>;
}

function ActionButton({
  label,
  activeLabel,
  icon: Icon,
  taskKey,
  currentTask,
  isWorking,
  onClick,
}: {
  label: string;
  activeLabel: string;
  icon: React.ElementType;
  taskKey: string;
  currentTask: string | null;
  isWorking: boolean;
  onClick: () => void;
}) {
  const isActive = currentTask === taskKey;
  const isDisabled = isWorking && !isActive;

  return (
    <motion.button
      onClick={onClick}
      disabled={isWorking}
      whileTap={!isWorking ? { scale: 0.97 } : {}}
      className={cn(
        "relative flex h-8 items-center gap-2 px-3 rounded-md text-[13px] font-medium transition-all",
        "border disabled:cursor-not-allowed",
        isActive && [
          "bg-[var(--app-card)] border-white/20 text-white",
        ],
        !isActive && !isDisabled && [
          "bg-[var(--sx-bg-171717)] hover:bg-[var(--app-card)] text-white border-[var(--app-border-strong)]",
        ],
        isDisabled && [
          "bg-[color-mix(in_srgb,var(--sx-bg-171717)_60%,transparent)] text-zinc-500 border-[var(--app-border-strong)]/50 opacity-50",
        ]
      )}
    >
      <span className="flex items-center gap-2">
        {isActive ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <Icon className={cn("w-4 h-4", isDisabled ? "text-zinc-600" : "text-zinc-400")} />
        )}
        {isActive ? activeLabel : label}
      </span>
    </motion.button>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, delay = 0, isLocked = false }: { icon: any; label: string; value: any; sub?: string; color?: string; delay?: number; isLocked?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}

      className={cn(
        "bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-xl p-4 group cursor-default relative overflow-hidden transition-all",
        !isLocked && "hover:border-[var(--app-border-strong)]"
      )}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-[var(--app-card)]/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white/10 p-2 rounded-full mb-2 border border-[var(--app-border-strong)]">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Upgrade to Pro</p>
          <Link href="/subscription" className="px-3 py-1 bg-white text-black text-[9px] font-black uppercase tracking-tighter rounded-md hover:scale-105 transition-transform">
            Unlock
          </Link>
        </div>
      )}

      <div className={cn("flex flex-col h-full justify-between relative z-10", isLocked && "opacity-20 grayscale")}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-medium text-zinc-400">{label}</p>
          <IconTile icon={Icon} size="sm" />
        </div>
        <div className="mt-2">
          <h4 className="text-[24px] leading-8 font-semibold tracking-tight text-white">
            <AnimatedNumber value={value ?? 0} />
          </h4>
          {sub && <p className="mt-1 text-[12px] text-zinc-400">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}k`;
  return tokens.toLocaleString();
}

interface DailyTokenUsage {
  date: string;
  day: string;
  tokens: number;
}

interface AnalyzeBudgetInfo {
  is_unlimited?: boolean;
  used_day_tokens?: number;
  used_month_tokens?: number;
  monthly_limit_tokens?: number;
  remaining_month_tokens?: number;
  run_limit_tokens?: number;
  history_7d?: DailyTokenUsage[];
  [key: string]: unknown;
}

function AIUsageCard({ budget }: { budget?: AnalyzeBudgetInfo | null }) {
  const isUnlimited = Boolean(budget?.is_unlimited);
  const usedDay = Number(budget?.used_day_tokens || 0);
  const usedMonth = Number(budget?.used_month_tokens || 0);
  const limit = Number(budget?.monthly_limit_tokens || 0);
  const remaining = Number(budget?.remaining_month_tokens || 0);

  const history7d = Array.isArray(budget?.history_7d) ? budget.history_7d : [];
  const hasHistory = history7d.length > 0 && history7d.some((d) => (d.tokens || 0) > 0);
  const maxDailyTokens = hasHistory ? Math.max(...history7d.map((d) => d.tokens || 0), 1) : 1;
  const history7dTotal = hasHistory ? history7d.reduce((acc, d) => acc + (d.tokens || 0), 0) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.25 }}
      className="bg-[var(--app-card)] border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between h-full"
    >
      <div>
        {/* 1. Header: Compact icon, title, subtitle, badge */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-medium text-white leading-tight">AI Usage</h3>
              <p className="text-[12px] text-zinc-400 truncate mt-0.5">Monthly token consumption</p>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-300 border border-white/[0.08] tabular-nums shrink-0">
            {isUnlimited ? "Unlimited" : "Monthly cap"}
          </span>
        </div>

        {/* 2. Main Metric + 7-day Mini Chart */}
        <div className="flex items-end justify-between gap-3 mt-3.5">
          <div>
            <span className="text-[26px] font-semibold tracking-tight text-white leading-none tabular-nums block">
              {formatTokenCount(usedMonth)}
            </span>
            <p className="text-[12px] text-zinc-400 mt-1.5">tokens this month</p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] text-zinc-400 font-normal">Last 7 days</span>
            {hasHistory ? (
              <div className="flex items-end gap-1 h-[20px]" role="img" aria-label="Last 7 days token usage chart">
                {history7d.map((d, idx) => {
                  const isToday = idx === history7d.length - 1;
                  const hasTokens = (d.tokens || 0) > 0;
                  const heightPct = hasTokens
                    ? Math.max(25, Math.min(100, Math.round((d.tokens / maxDailyTokens) * 100)))
                    : 15;

                  return (
                    <div
                      key={d.date}
                      style={{ height: `${heightPct}%` }}
                      title={`${d.day} (${d.date}): ${d.tokens.toLocaleString()} tokens`}
                      className={cn(
                        "w-1 sm:w-1.5 rounded-[1px] transition-all cursor-default",
                        hasTokens
                          ? isToday
                            ? "bg-white"
                            : "bg-zinc-400 hover:bg-white"
                          : "bg-white/[0.08]"
                      )}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex items-end gap-1 h-[20px]">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div key={idx} className="w-1 sm:w-1.5 h-[3px] rounded-[1px] bg-white/[0.08]" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Single Divider + Lower Statistics (Today, 7-day, Plan) */}
      <div className="border-t border-white/[0.06] pt-3 mt-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-400">Today</p>
            <p className="text-[13px] font-medium text-white tabular-nums leading-tight mt-1 truncate">
              {formatTokenCount(usedDay)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] text-zinc-400">7-day</p>
            <p className="text-[13px] font-medium text-white tabular-nums leading-tight mt-1 truncate">
              {formatTokenCount(history7dTotal)}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] text-zinc-400">Plan</p>
            <p className="text-[13px] font-medium text-white leading-tight mt-1 truncate">
              {isUnlimited ? "Unlimited" : formatTokenCount(limit)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface DailyQuotaCardProps {
  quota: {
    used?: number;
    limit?: number;
    remaining?: number;
    allowed?: boolean;
    plan?: string;
  };
  subscription?: any;
}

function DailyQuotaCard({ quota, subscription }: DailyQuotaCardProps) {
  const used = Math.max(0, Number(quota?.used || 0));
  const rawLimit = Number(quota?.limit ?? 0);
  const isUnlimited = rawLimit >= 99999 || rawLimit === -1 || (rawLimit === 0 && subscription?.plan === "premium");
  const limit = isUnlimited ? 0 : Math.max(0, rawLimit);

  // Safe remaining calculation preventing negative values
  const remaining = isUnlimited
    ? Infinity
    : Math.max(0, quota?.remaining != null ? quota.remaining : limit - used);

  const pct = isUnlimited
    ? 0
    : limit > 0
    ? Math.min(100, Math.round((used / limit) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.25 }}
      className="bg-[var(--app-card)] border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between h-full"
    >
      <div>
        {/* 1. Header: Compact icon, title, subtitle, badge */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-medium text-white leading-tight">Daily Quota</h3>
              <p className="text-[12px] text-zinc-400 truncate mt-0.5">Application limit</p>
            </div>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-300 border border-white/[0.08] tabular-nums shrink-0">
            {isUnlimited ? "Unlimited" : `${pct}% used`}
          </span>
        </div>

        {/* 2. Main Metric (Used / Limit & Remaining) */}
        <div className="flex items-end justify-between gap-3 mt-3.5">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-semibold tracking-tight text-white leading-none tabular-nums">
                {used}
              </span>
              <span className="text-[15px] font-normal text-zinc-400 tabular-nums">
                / {isUnlimited ? "∞" : limit > 0 ? limit : "—"}
              </span>
            </div>
            <p className="text-[12px] text-zinc-400 mt-1.5">Applications used today</p>
          </div>

          <div className="text-right">
            <span className="text-[26px] font-semibold tracking-tight text-white leading-none tabular-nums">
              {isUnlimited ? "∞" : remaining}
            </span>
            <p className="text-[12px] text-zinc-400 mt-1.5">remaining</p>
          </div>
        </div>
      </div>

      {/* 3. Progress Bar + Footer Row */}
      <div className="mt-4 pt-2.5">
        <div className="w-full bg-white/[0.08] h-1 rounded-full overflow-hidden mb-3">
          <motion.div
            className={cn(
              "h-full rounded-full transition-all",
              pct >= 90 ? "bg-zinc-200" : "bg-zinc-400"
            )}
            initial={{ width: 0 }}
            animate={{ width: isUnlimited ? "100%" : `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>Daily limit: {isUnlimited ? "Unlimited" : limit}</span>
          <span>Resets at 00:00 UTC</span>
        </div>
      </div>
    </motion.div>
  );
}

interface StreakDay {
  date: string;
  day: string;
  full_day: string;
  count: number;
  has_activity: boolean;
  is_today: boolean;
}

interface StreakResponse {
  streak: number;
  active_today: boolean;
  days: StreakDay[];
  total_7d_actions: number;
  active_days_count: number;
  message: string;
}

function JobSearchStreakCard() {
  const tzOffset = typeof window !== "undefined" ? new Date().getTimezoneOffset() : 0;
  const { data } = useQuery({
    queryKey: ["job-search-streak", tzOffset],
    queryFn: () => analyticsApi.streak(tzOffset).then((r) => r.data as StreakResponse),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const streak = data?.streak ?? 0;
  const activeToday = Boolean(data?.active_today);
  const days = data?.days ?? [];
  const totalActions = data?.total_7d_actions ?? 0;
  const activeDaysCount = data?.active_days_count ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.21, duration: 0.25 }}
      className="bg-[var(--app-card)] border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between h-full"
    >
      <div>
        {/* 1. Header: Compact icon, title, subtitle, badge */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-medium text-white leading-tight">Job Search Streak</h3>
              <p className="text-[12px] text-zinc-400 truncate mt-0.5">Build your daily momentum</p>
            </div>
          </div>
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded-full border tabular-nums shrink-0",
              activeToday || streak > 0
                ? "bg-white/[0.08] text-white border-white/[0.16]"
                : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"
            )}
          >
            {activeToday || streak > 0 ? "Active" : "Inactive"}
          </span>
        </div>

        {/* 2. Main Metric + 7 Indicators */}
        <div className="flex items-end justify-between gap-3 mt-3.5">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-semibold tracking-tight text-white leading-none tabular-nums">
                {streak}
              </span>
              <span className="text-[15px] font-normal text-zinc-400">
                {streak === 1 ? "day" : "days"}
              </span>
            </div>
            <p className="text-[12px] text-zinc-400 mt-1.5">Current streak</p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[11px] text-zinc-400 font-normal">Last 7 days</span>
            <div className="flex items-center gap-1.5 h-[20px]" role="group" aria-label="7-day activity indicators">
              {days.length > 0 ? (
                days.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.full_day} (${d.date}): ${d.count} action${d.count === 1 ? "" : "s"}`}
                    className={cn(
                      "w-2.5 h-2.5 rounded-[2px] transition-all cursor-default",
                      d.has_activity
                        ? "bg-white"
                        : "bg-white/[0.08]"
                    )}
                  />
                ))
              ) : (
                Array.from({ length: 7 }).map((_, idx) => (
                  <div key={idx} className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.08]" />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Single Divider + Lower Statistics (Active days, Actions) */}
      <div className="border-t border-white/[0.06] pt-3 mt-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-400">Active days</p>
            <p className="text-[13px] font-medium text-white tabular-nums leading-tight mt-1 truncate">
              {activeDaysCount} of 7
            </p>
          </div>

          <div className="min-w-0 text-right">
            <p className="text-[11px] text-zinc-400">Actions</p>
            <p className="text-[13px] font-medium text-white tabular-nums leading-tight mt-1 truncate">
              {totalActions}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { quota, subscription, canAccess, isActive } = useSubscription();
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  })();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => analyticsApi.dashboard().then((r) => r.data),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
  const { status: agentStatus, isWorking, currentTask, runTask } = useAgentStatus();

  const { data: queueStatus } = useQuery({
    queryKey: ["queue-status"],
    queryFn: () => applicationsApi.queueStatus().then((r) => r.data),
    staleTime: 30000,
  });

  const { data: analyzeBudget } = useQuery({
    queryKey: ["analyze-budget", user?.id],
    queryFn: () => quotasApi.analyzeBudget().then((r) => r.data),
    staleTime: 30000,
    enabled: !!user?.id,
  });


  const safeDashboard = dashboard ?? {
    total_jobs: 0,
    jobs_today: 0,
    high_match_jobs: 0,
    total_applications: 0,
    applications_today: 0,
    pending_approval: 0,
    interviews_scheduled: 0,
    offers_received: 0,
    response_rate: 0,
  };

  const stats = [
    { icon: Briefcase, label: "Total Jobs", value: safeDashboard.total_jobs, sub: `${safeDashboard.jobs_today} today`, href: "/jobs" },
    { icon: TrendingUp, label: "High Match Jobs", value: safeDashboard.high_match_jobs, sub: "≥75% match score", href: "/jobs?min_match_score=75" },
    { icon: Send, label: "Applied jobs", value: safeDashboard.total_applications, sub: `${safeDashboard.applications_today} today`, href: "/applications?status=applied" },
    { icon: FileText, label: "Pending Approval", value: safeDashboard.pending_approval, sub: "awaiting your review", href: "/applications?status=pending_approval" },
    { icon: Star, label: "Interviews", value: safeDashboard.interviews_scheduled, sub: "scheduled", href: "/interviews", isLocked: !canAccess("interviews") },
    { icon: CheckCircle, label: "Offers", value: safeDashboard.offers_received, sub: "received", href: "/applications?status=offer_received", isLocked: !canAccess("interviews") },
  ];

  const safeQuota = quota ?? {
    used: 0,
    limit: 0,
  };

  const safeAnalyzeBudget: AnalyzeBudgetInfo = (analyzeBudget as AnalyzeBudgetInfo) ?? {
    is_unlimited: false,
    used_day_tokens: 0,
    daily_plan_tokens: 0,
    used_month_tokens: 0,
    monthly_limit_tokens: 0,
    remaining_month_tokens: 0,
    run_limit_tokens: 0,
    history_7d: [],
  };

  const planAnalyzeBudget = getPlanAnalyzeBudget(subscription?.plan);
  const resolvedAnalyzeBudget: AnalyzeBudgetInfo = (safeAnalyzeBudget.monthly_limit_tokens ?? 0) > 0 || !planAnalyzeBudget
    ? safeAnalyzeBudget
    : {
      allowed: true,
      is_unlimited: false,
      plan: subscription?.plan ?? "none",
      used_day_tokens: 0,
      daily_plan_tokens: planAnalyzeBudget.daily_plan_tokens,
      used_month_tokens: 0,
      monthly_limit_tokens: planAnalyzeBudget.monthly_limit_tokens,
      remaining_month_tokens: planAnalyzeBudget.monthly_limit_tokens,
      run_limit_tokens: planAnalyzeBudget.run_limit_tokens,
      reason: null,
      history_7d: safeAnalyzeBudget.history_7d ?? [],
    };

  // Agent action UI helpers (now powered by global context)

  // Separate handler functions for each task type
  const handleScrapeJobs = async () => {
    try {
      await runTask("scrape_jobs");
    } catch (err) {
      toast.error("Failed to start scraping task");
    }
  };

  const handleAnalyzeJobs = async () => {
    try {
      await runTask("analyze_jobs");
    } catch (err) {
      toast.error("Failed to start analyzing task");
    }
  };

  const handleQueueJobs = async () => {
    try {
      await runTask("queue_jobs");
    } catch (err) {
      toast.error("Failed to start queueing task");
    }
  };

  // Deploy applies through the Applivo browser extension, in background tabs
  // of the user's existing Chrome window. The run's progress shows in <RunPanel />.
  const ext = useExtension();
  const [deployOpen, setDeployOpen] = useState(false);
  const runActive = Boolean(ext.run?.active);

  const handleApplyQueued = async () => {
    if (ext.status === "connected") {
      setDeployOpen(true);
      return;
    }
    toast.error(
      ext.status === "not_installed"
        ? "Install the Applivo browser extension first (Connect page)."
        : "Connect the Applivo browser extension first (Connect page).",
      { action: { label: "Open Connect", onClick: () => { window.location.href = "/connect"; } } }
    );
  };

  // Refresh the dashboard numbers as the background run finishes each job.
  const finishedCount = (ext.run?.items ?? []).filter((i) => i.status === "submitted" || i.status === "failed" || i.status === "skipped").length;
  useEffect(() => {
    if (!ext.run?.hasRun) return;
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["queue-status"] });
    queryClient.invalidateQueries({ queryKey: ["applications"] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishedCount]);

  return (
    <div className="w-full space-y-4">

      {/* Header Actions - Only for active subscriptions */}
      {isActive && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="hidden md:block" />
          <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
            <ActionButton
              label="Scrape"
              activeLabel="Scraping…"
              icon={Play}
              taskKey="scrape_jobs"
              currentTask={currentTask}
              isWorking={isWorking || runActive}
              onClick={handleScrapeJobs}
            />
            <ActionButton
              label="Analyze"
              activeLabel="Analyzing…"
              icon={Zap}
              taskKey="analyze_jobs"
              currentTask={currentTask}
              isWorking={isWorking || runActive}
              onClick={handleAnalyzeJobs}
            />
            <ActionButton
              label="Queue"
              activeLabel="Queueing…"
              icon={Activity}
              taskKey="queue_jobs"
              currentTask={currentTask}
              isWorking={isWorking || runActive}
              onClick={handleQueueJobs}
            />
            <ActionButton
              label="Deploy"
              activeLabel="Deploying…"
              icon={Send}
              taskKey="apply_queued"
              currentTask={runActive ? "apply_queued" : currentTask}
              isWorking={isWorking || runActive}
              onClick={handleApplyQueued}
            />
          </div>
        </div>
      )}

      <DeployDialog open={deployOpen} onClose={() => setDeployOpen(false)} />

      {/* Pending approval banner */}
      {(queueStatus?.pendingApproval ?? 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-zinc-700/10 border border-[var(--app-border-strong)]/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-zinc-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-400">
              {queueStatus.pendingApproval} application{queueStatus.pendingApproval > 1 ? "s" : ""} awaiting your approval
            </p>
            <p className="text-xs text-zinc-400/70">Review and approve before the bot applies</p>
          </div>
          <Link href="/applications?status=pending_approval"
            className="px-4 py-1.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-colors whitespace-nowrap">
            Review →
          </Link>
        </motion.div>
      )}


      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="shimmer h-32 rounded-2xl" />)}
        </div>
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              transition={{ delay: i * 0.08 }}
            >
              {s.href && !s.isLocked ? (
                <Link href={s.href}>
                  <StatCard {...s} delay={i * 0.08} />
                </Link>
              ) : (
                <StatCard {...s} delay={i * 0.08} />
              )}
            </motion.div>
          ))}
        </motion.div>
      )}


      {/* ── Core Metric Cards: AI Usage, Daily Quota, Job Search Streak ── */}
      {isActive ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <AIUsageCard budget={resolvedAnalyzeBudget} />
          <DailyQuotaCard quota={safeQuota} subscription={subscription} />
          <JobSearchStreakCard />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between gap-4 p-4 rounded-lg border border-[var(--app-border)] bg-[var(--app-inset)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-[var(--app-border-strong)] flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">Start your free 7-day trial</p>
              <p className="text-[12px] text-zinc-500">Access automation, AI analysis, auto-apply, and more</p>
            </div>
          </div>
          <Link href="/subscription" className="shrink-0 px-5 py-2 bg-white text-black text-[13px] font-bold rounded-xl hover:bg-zinc-200 transition-colors">
            Start Free Trial
          </Link>
        </motion.div>
      )}

      {/* ── Application Run Status (Full-width below summary cards) ─────── */}
      <RunPanel
        totalJobs={safeDashboard.total_jobs}
        jobsToday={safeDashboard.jobs_today}
        highMatchJobs={safeDashboard.high_match_jobs}
        queueLength={queueStatus?.totalInQueue ?? queueStatus?.queueLength ?? 0}
        currentTask={currentTask}
      />


    </div>
  );
}
