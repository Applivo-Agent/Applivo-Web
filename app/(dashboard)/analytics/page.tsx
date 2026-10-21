"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { motion } from "framer-motion";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from "recharts";
import {
  Send, Calendar, Award, TrendingUp, Activity, Filter, Download,
  Layers, Compass, Clock, Building2, UserCheck, AlertCircle,
  ExternalLink, ChevronRight, CheckCircle2, Briefcase, Zap, Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DateRange = 7 | 30 | 90;

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [days, setDays] = useState<DateRange>(30);
  const [isExporting, setIsExporting] = useState(false);

  // Series visibility toggles for activity chart
  const [showApplied, setShowApplied] = useState(true);
  const [showResponses, setShowResponses] = useState(true);
  const [showInterviews, setShowInterviews] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data: perf,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["analytics-performance", days],
    queryFn: () => analyticsApi.performance(days).then((r) => r.data),
    staleTime: 60 * 1000,
  });

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await analyticsApi.downloadCsv(days);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `applivo_analytics_${days}d.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${days}-day analytics CSV`);
    } catch (err) {
      toast.error("Failed to export analytics CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const kpi = perf?.kpi ?? {
    total_applications: 0,
    total_applications_prev: 0,
    employer_responses: 0,
    employer_responses_prev: 0,
    interviews: 0,
    interviews_prev: 0,
    offers: 0,
    offers_prev: 0,
  };

  const activity = Array.isArray(perf?.activity) ? perf.activity : [];
  const funnel = perf?.funnel;
  const breakdowns = perf?.breakdowns;
  const insights = Array.isArray(perf?.insights) ? perf.insights : [];
  const responseTime = perf?.response_time;
  const totalAccountApps = perf?.total_account_applications ?? 0;

  // Activity timeline calculations
  const totalAppliedInPeriod = activity.reduce((acc: number, d: any) => acc + (Number(d.applied) || 0), 0);
  const totalResponsesInPeriod = activity.reduce((acc: number, d: any) => acc + (Number(d.responses) || 0), 0);
  const totalInterviewsInPeriod = activity.reduce((acc: number, d: any) => acc + (Number(d.interviews) || 0), 0);
  const activeDays = activity.filter((d: any) => (Number(d.applied) || 0) > 0).length;
  const avgPerDay = (totalAppliedInPeriod / Math.max(activity.length, 1)).toFixed(1);
  const peakDay = activity.reduce(
    (best: any, d: any) => ((Number(d.applied) || 0) > (Number(best?.applied) || 0) ? d : best),
    activity[0] || { name: "-", applied: 0 }
  );

  const calculateTrend = (curr: number, prev: number) => {
    if (prev === 0 && curr === 0) return { label: "No activity", trend: "neutral" };
    if (prev === 0 && curr > 0) return { label: `${curr} in period`, trend: "positive" };
    const pct = Math.round(((curr - prev) / prev) * 100);
    if (pct > 0) return { label: `+${pct}% vs prev ${days}d`, trend: "positive" };
    if (pct < 0) return { label: `${pct}% vs prev ${days}d`, trend: "negative" };
    return { label: `Even vs prev ${days}d`, trend: "neutral" };
  };

  return (
    <div className="dash-page space-y-6">
      {/* ─── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] md:text-[24px] font-semibold text-white tracking-tight">
            Analytics
          </h1>
          <p className="text-[13px] md:text-[14px] text-zinc-400 mt-0.5">
            Understand your job search performance and what to do next.
          </p>
        </div>

        {/* Date Filters & Export */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Date range segmented buttons */}
          <div className="flex items-center bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg p-0.5">
            {([7, 30, 90] as DateRange[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={cn(
                  "px-2.5 py-1 text-[12px] font-medium rounded-md transition-all",
                  days === d
                    ? "bg-white/[0.08] text-white shadow-sm border border-white/20"
                    : "text-zinc-400 hover:text-white"
                )}
                aria-pressed={days === d}
              >
                {d === 7 ? "Last 7d" : d === 30 ? "Last 30d" : "Last 90d"}
              </button>
            ))}
          </div>

          {/* Export CSV button */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="h-8 px-3 rounded-lg text-[12px] font-medium transition-colors border bg-[var(--app-nested)] text-zinc-300 border-[var(--app-border-strong)] hover:text-white hover:bg-white/[0.04] flex items-center gap-1.5 disabled:opacity-50"
            title={`Export ${days}-day applications to CSV`}
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* ─── Loading State ──────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 h-28 animate-pulse" />
            ))}
          </div>
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 h-80 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 h-64 animate-pulse" />
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 h-64 animate-pulse" />
          </div>
        </div>
      ) : isError ? (
        <div className="bg-[var(--app-card)] border border-red-500/20 rounded-lg p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-[15px] font-semibold text-white">Failed to load analytics</p>
          <p className="text-[13px] text-zinc-400 max-w-sm mx-auto">
            We encountered a problem fetching your application statistics. Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="app-btn bg-white text-black hover:bg-zinc-200 mt-2"
          >
            Retry
          </button>
        </div>
      ) : totalAccountApps === 0 ? (
        /* ─── Zero Account Data State ───────────────────────────────── */
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center mx-auto text-zinc-400">
            <Activity className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-[16px] font-semibold text-white">No applications tracked yet</h2>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              Once you discover and queue jobs, Applivo’s Application Intelligence dashboard will track conversion funnels, employer response rates, and recommended next steps right here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-white text-black text-[13px] font-semibold hover:bg-zinc-200 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Explore Jobs
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ─── B. KPI Summary Row ─────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Applications */}
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-zinc-400">Total Applications</span>
                <Send className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="my-2">
                <p className="text-[24px] md:text-[28px] font-semibold tracking-tight text-white tabular-nums">
                  {kpi.total_applications}
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--app-border-strong)]/60 text-[11px] md:text-[12px] text-zinc-400 flex items-center justify-between">
                <span>{calculateTrend(kpi.total_applications, kpi.total_applications_prev).label}</span>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Sent</span>
              </div>
            </div>

            {/* Card 2: Employer Responses */}
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-zinc-400">Employer Responses</span>
                <UserCheck className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="my-2">
                <p className="text-[24px] md:text-[28px] font-semibold tracking-tight text-white tabular-nums">
                  {kpi.employer_responses}
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--app-border-strong)]/60 text-[11px] md:text-[12px] text-zinc-400 flex items-center justify-between">
                <span>
                  {kpi.total_applications > 0
                    ? `${((kpi.employer_responses / kpi.total_applications) * 100).toFixed(1)}% response rate`
                    : "Awaiting responses"}
                </span>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Responses</span>
              </div>
            </div>

            {/* Card 3: Interviews */}
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-zinc-400">Interviews</span>
                <Calendar className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="my-2">
                <p className="text-[24px] md:text-[28px] font-semibold tracking-tight text-white tabular-nums">
                  {kpi.interviews}
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--app-border-strong)]/60 text-[11px] md:text-[12px] text-zinc-400 flex items-center justify-between">
                <span>
                  {kpi.employer_responses > 0
                    ? `${((kpi.interviews / kpi.employer_responses) * 100).toFixed(1)}% interview rate`
                    : calculateTrend(kpi.interviews, kpi.interviews_prev).label}
                </span>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Scheduled</span>
              </div>
            </div>

            {/* Card 4: Offers */}
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-zinc-400">Offers</span>
                <Award className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="my-2">
                <p className="text-[24px] md:text-[28px] font-semibold tracking-tight text-white tabular-nums">
                  {kpi.offers}
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--app-border-strong)]/60 text-[11px] md:text-[12px] text-zinc-400 flex items-center justify-between">
                <span>
                  {kpi.interviews > 0
                    ? `${((kpi.offers / kpi.interviews) * 100).toFixed(1)}% offer rate`
                    : kpi.offers > 0 ? "Milestone achieved" : "Pipeline goal"}
                </span>
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Offers</span>
              </div>
            </div>
          </div>

          {/* ─── C. Application Activity Chart ────────────────────────── */}
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-400" />
                <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight">
                  Application Activity
                </h2>
                <span className="text-[11px] text-zinc-500">
                  ({days} days)
                </span>
              </div>

              {/* Series toggles */}
              <div className="flex items-center gap-2 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setShowApplied(!showApplied)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors",
                    showApplied
                      ? "bg-white/[0.08] text-white border-white/20"
                      : "text-zinc-500 border-transparent hover:text-zinc-300"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-white" />
                  Applications ({totalAppliedInPeriod})
                </button>
                <button
                  type="button"
                  onClick={() => setShowResponses(!showResponses)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors",
                    showResponses
                      ? "bg-white/[0.08] text-white border-white/20"
                      : "text-zinc-500 border-transparent hover:text-zinc-300"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-zinc-400" />
                  Responses ({totalResponsesInPeriod})
                </button>
                <button
                  type="button"
                  onClick={() => setShowInterviews(!showInterviews)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors",
                    showInterviews
                      ? "bg-white/[0.08] text-white border-white/20"
                      : "text-zinc-500 border-transparent hover:text-zinc-300"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Interviews ({totalInterviewsInPeriod})
                </button>
              </div>
            </div>

            {/* Quick Summary Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg p-3">
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Total Applied</p>
                <p className="text-[18px] font-semibold text-white mt-0.5 tabular-nums">{totalAppliedInPeriod}</p>
              </div>
              <div className="bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg p-3">
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Avg / Day</p>
                <p className="text-[18px] font-semibold text-white mt-0.5 tabular-nums">{avgPerDay}</p>
              </div>
              <div className="bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg p-3">
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Active Days</p>
                <p className="text-[18px] font-semibold text-white mt-0.5 tabular-nums">
                  {activeDays}/{activity.length}
                </p>
              </div>
            </div>

            {/* Activity Chart Canvas */}
            <div className="h-[220px] md:h-[260px] w-full pt-2">
              {isMounted && activity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientApplied" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientResponses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientInterviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#71717a"
                      fontSize={10}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={10}
                      fontWeight={500}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#ffffff",
                        padding: "8px 12px",
                      }}
                      labelStyle={{ color: "#a1a1aa", fontWeight: 600, marginBottom: "4px" }}
                      formatter={(val: any, name: any) => {
                        const v = Number(val ?? 0);
                        const n = String(name ?? "");
                        if (n === "applied") return [v, "Applications"];
                        if (n === "responses") return [v, "Responses"];
                        if (n === "interviews") return [v, "Interviews"];
                        return [v, n];
                      }}
                    />
                    {showApplied && (
                      <Area
                        type="monotone"
                        dataKey="applied"
                        stroke="#ffffff"
                        strokeWidth={1.75}
                        fillOpacity={1}
                        fill="url(#gradientApplied)"
                        dot={{ r: 1.5 }}
                        activeDot={{ r: 4 }}
                      />
                    )}
                    {showResponses && (
                      <Area
                        type="monotone"
                        dataKey="responses"
                        stroke="#a1a1aa"
                        strokeWidth={1.5}
                        fillOpacity={1}
                        fill="url(#gradientResponses)"
                        dot={{ r: 1.5 }}
                        activeDot={{ r: 3.5 }}
                      />
                    )}
                    {showInterviews && (
                      <Area
                        type="monotone"
                        dataKey="interviews"
                        stroke="#34d399"
                        strokeWidth={1.5}
                        fillOpacity={1}
                        fill="url(#gradientInterviews)"
                        dot={{ r: 1.5 }}
                        activeDot={{ r: 3.5 }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-[var(--app-nested)] rounded-lg flex items-center justify-center text-zinc-500 text-[12px]">
                  No daily records for this date range
                </div>
              )}
            </div>
          </div>

          {/* ─── D. Application Funnel ─────────────────────────────────── */}
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-zinc-400" />
                <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight">
                  Application Funnel
                </h2>
              </div>
              <p className="text-[12px] text-zinc-400">
                Click any stage to filter matching applications
              </p>
            </div>

            {/* Funnel Stage Bars */}
            <div className="space-y-3 pt-1">
              {funnel?.stages?.map((stage: any, idx: number) => {
                const maxCount = Math.max(...(funnel.stages.map((s: any) => s.count)), 1);
                const barWidth = Math.max((stage.count / maxCount) * 100, 3);

                return (
                  <div key={stage.key} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <Link
                        href={`/applications?status=${stage.filter_status}`}
                        className="font-medium text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <span>{stage.name}</span>
                        <ChevronRight className="w-3 h-3 text-zinc-500" />
                      </Link>
                      <div className="flex items-center gap-3">
                        {stage.conversion_rate !== null && stage.conversion_rate !== undefined && (
                          <span className="text-[11px] text-zinc-400 bg-[var(--app-nested)] px-2 py-0.5 rounded border border-[var(--app-border-strong)]">
                            {stage.conversion_rate}% conversion
                          </span>
                        )}
                        <span className="font-semibold text-white tabular-nums">
                          {stage.count}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <Link
                      href={`/applications?status=${stage.filter_status}`}
                      className="block h-2.5 bg-[var(--app-nested)] rounded-full overflow-hidden border border-[var(--app-border-strong)] hover:border-white/20 transition-all cursor-pointer"
                      title={`View ${stage.count} ${stage.name} applications`}
                    >
                      <div
                        className="h-full bg-white/90 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Complete Status Breakdown Chips */}
            {funnel?.statuses && funnel.statuses.length > 0 && (
              <div className="pt-3 border-t border-[var(--app-border-strong)]">
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Complete Status Breakdown
                </p>
                <div className="flex flex-wrap gap-2">
                  {funnel.statuses.map((s: any) => (
                    <Link
                      key={s.status}
                      href={`/applications?status=${s.status.toLowerCase()}`}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md text-[11px] text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
                    >
                      <span>{s.label}</span>
                      <span className="font-semibold text-white tabular-nums bg-white/[0.08] px-1.5 py-0.2 rounded text-[10px]">
                        {s.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── E. Job Search Performance (2-Column Grid) ───────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Roles */}
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-[14px] sm:text-[15px] font-semibold text-white tracking-tight">
                    Frequently Targeted Roles
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-500">Top 5</span>
              </div>

              {breakdowns?.roles && breakdowns.roles.length > 0 ? (
                <div className="space-y-2.5">
                  {breakdowns.roles.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-zinc-200 truncate pr-2" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-zinc-400 shrink-0 tabular-nums">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--app-nested)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/80 rounded-full"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-zinc-500 py-4 text-center">
                  No role data available in this period
                </p>
              )}
            </div>

            {/* Top Companies */}
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-[14px] sm:text-[15px] font-semibold text-white tracking-tight">
                    Top Companies Applied
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-500">Top 5</span>
              </div>

              {breakdowns?.companies && breakdowns.companies.length > 0 ? (
                <div className="space-y-2.5">
                  {breakdowns.companies.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-zinc-200 truncate pr-2" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-zinc-400 shrink-0 tabular-nums">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--app-nested)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-300 rounded-full"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-zinc-500 py-4 text-center">
                  No company records available in this period
                </p>
              )}
            </div>

            {/* Job Sources */}
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-[14px] sm:text-[15px] font-semibold text-white tracking-tight">
                    Job Sources
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-500">Platforms</span>
              </div>

              {breakdowns?.sources && breakdowns.sources.length > 0 ? (
                <div className="space-y-2.5">
                  {breakdowns.sources.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-zinc-200 capitalize">{item.name}</span>
                        <span className="text-zinc-400 tabular-nums">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--app-nested)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-400 rounded-full"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-zinc-500 py-4 text-center">
                  No source data available
                </p>
              )}
            </div>

            {/* Work Mode & Response Time Metrics */}
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-[14px] sm:text-[15px] font-semibold text-white tracking-tight">
                    Work Mode & Response Velocity
                  </h3>
                </div>
              </div>

              {/* Work modes distribution */}
              {breakdowns?.work_modes && breakdowns.work_modes.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Work Arrangement
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {breakdowns.work_modes.map((wm: any, i: number) => (
                      <div
                        key={i}
                        className="bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg p-2.5 text-center"
                      >
                        <p className="text-[11px] text-zinc-400">{wm.name}</p>
                        <p className="text-[15px] font-semibold text-white mt-0.5 tabular-nums">
                          {wm.count}
                        </p>
                        <p className="text-[10px] text-zinc-500">{wm.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Response Time Metric */}
              <div className="pt-2 border-t border-[var(--app-border-strong)]">
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Time to Employer Response
                </p>
                {responseTime?.median_days !== null && responseTime?.median_days !== undefined ? (
                  <div className="flex items-baseline justify-between bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg p-3">
                    <div>
                      <span className="text-[20px] font-semibold text-white tabular-nums">
                        {responseTime.median_days}
                      </span>
                      <span className="text-[12px] text-zinc-400 ml-1.5">days median</span>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      Based on {responseTime.total_responded} response{responseTime.total_responded > 1 ? "s" : ""}
                    </span>
                  </div>
                ) : (
                  <div className="bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg p-3 text-center">
                    <p className="text-[12px] text-zinc-400">
                      Awaiting first employer response to compute median turnaround
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
