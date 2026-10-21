"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi, applicationsApi } from "@/lib/api";
import { cn, getMatchBadgeClass, getStatusClass, timeAgo, truncate } from "@/lib/utils";
import { motion } from "framer-motion";
import { Search, Filter, SlidersHorizontal, Briefcase, MapPin, Clock, Zap, Send, SkipForward, ChevronRight, RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function MatchScoreRing({ score, size = 20, strokeWidth = 2.5 }: { score: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const color = score >= 80 ? "#ffffff" : score >= 60 ? "#e4e4e7" : score >= 40 ? "#a1a1aa" : "#52525b";
  
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={strokeWidth} stroke="rgba(255,255,255,0.12)" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={strokeWidth}
          stroke={color} strokeLinecap="round"
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * pct) / 100 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

const SOURCES = ["", "internshala", "linkedin", "indeed", "wellfound"];
const TYPES = ["", "internship", "full_time", "contract", "part_time"];
const MODES = ["", "remote", "hybrid", "onsite"];
const SORTS = [
  { value: "match_score", label: "Match Score" },
  { value: "priority_score", label: "Priority" },
  { value: "posted_at", label: "Posted Date" },
  { value: "created_at", label: "Scraped Date" },
];

export default function JobsPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ source: "", job_type: "", work_mode: "", min_match_score: 0, keyword: "", status: "", sort_by: "match_score" });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["jobs", filters, page],
    queryFn: () => jobsApi.list({ ...filters, page, page_size: 20, min_match_score: filters.min_match_score || undefined }).then((r) => r.data),
  });

  const isRefreshing = isManualRefreshing || isRefetching;

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsManualRefreshing(true);
    try {
      const result = await refetch();
      if (result.error) {
        toast.error("Failed to refresh job feed.");
      } else {
        toast.success("Job feed refreshed.");
      }
    } catch {
      toast.error("Failed to refresh job feed.");
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const applyMutation = useMutation({
    mutationFn: (jobId: string) => applicationsApi.create({ job_id: jobId, method: "auto_bot" }),
    onSuccess: () => { toast.success("Application queued!"); qc.invalidateQueries({ queryKey: ["jobs"] }); },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? "Failed to apply"),
  });

  const skipMutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.skip(jobId),
    onSuccess: () => { toast.info("Job skipped"); qc.invalidateQueries({ queryKey: ["jobs"] }); },
  });

  const analyzeMutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.analyze(jobId),
    onSuccess: () => { toast.success("Analysis queued!"); qc.invalidateQueries({ queryKey: ["jobs"] }); },
  });

  const F = (key: string, val: any) => { setFilters((f) => ({ ...f, [key]: val })); setPage(1); };

  return (
    <div className="dash-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">Job Feed</h1>
          <p className="text-[14px] text-zinc-400 mt-1">{data?.total ?? 0} high-priority opportunities matched to your profile across various sources.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex h-8 items-center gap-2 px-3 bg-[#171717] hover:bg-[var(--app-card)] text-white rounded-md text-[13px] font-medium transition-colors border border-[var(--app-border-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
          title={isRefreshing ? "Refreshing..." : "Refresh"}
        >
          {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin text-zinc-300" /> : <RefreshCw className="w-4 h-4 text-zinc-400" />}
          <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 flex flex-col gap-4 relative z-20">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text" placeholder="Search roles, companies, or skills…"
              value={filters.keyword} onChange={(e) => F("keyword", e.target.value)}
              className="w-full pl-10 pr-4 h-9 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg text-[13px] font-normal text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select value={filters.sort_by} onChange={(e) => F("sort_by", e.target.value)}
              className="h-9 px-3 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg text-[13px] font-medium text-zinc-300 focus:outline-none focus:border-white/30 transition-colors cursor-pointer min-w-[150px]">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex h-9 items-center gap-2 px-3.5 rounded-lg text-[13px] font-medium transition-colors", 
                showFilters ? "bg-white text-black" : "bg-[#171717] border border-[var(--app-border-strong)] text-zinc-300 hover:bg-[var(--app-card)]"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" /> 
              <span>Filters</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-[var(--app-card)]/3 rounded-xl border border-[var(--app-border-strong)]"
          >
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Source</label>
              <select value={filters.source} onChange={(e) => F("source", e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg text-sm font-medium text-zinc-300 outline-none">
                <option value="">All sources</option>
                {SOURCES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Job Type</label>
              <select value={filters.job_type} onChange={(e) => F("job_type", e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg text-sm font-medium text-zinc-300 outline-none">
                <option value="">All types</option>
                {TYPES.filter(Boolean).map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Work Mode</label>
              <select value={filters.work_mode} onChange={(e) => F("work_mode", e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg text-sm font-medium text-zinc-300 outline-none">
                <option value="">All modes</option>
                {MODES.filter(Boolean).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Min Score</label>
              <input type="number" min={0} max={100} value={filters.min_match_score}
                onChange={(e) => F("min_match_score", +e.target.value)}
                className="w-full px-3 py-2 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg text-sm font-medium text-zinc-300 outline-none" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Job cards */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-[120px] rounded-lg bg-[var(--app-card)] border border-[var(--app-border-strong)] animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2.5 pb-8">
          {(data?.items ?? []).map((job: any, i: number) => (
            <motion.div 
              key={job.id} 
              initial={{ opacity: 0, y: 8 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.03 }}
              className="bg-[var(--app-card)] p-3.5 sm:p-4 rounded-lg border border-[var(--app-border-strong)] hover:border-zinc-700 flex flex-col md:flex-row items-start gap-3.5 group transition-all"
            >
              {/* Company icon */}
              <div className="w-8 h-8 rounded-md bg-[var(--app-nested)] flex items-center justify-center shrink-0 border border-[var(--app-border-strong)] mt-0.5">
                {job.company_logo_url ? (
                  <img src={job.company_logo_url} className="w-5 h-5 object-contain rounded" alt="" />
                ) : (
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Row 1: Title, Company, Location */}
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h3 className="font-semibold text-[14px] sm:text-[15px] tracking-tight text-white leading-snug group-hover:text-zinc-200 transition-colors">
                    {job.title}
                  </h3>
                  <span className="text-[12px] font-medium text-zinc-300">
                    {job.company_name}
                  </span>
                  {job.location && (
                    <span className="inline-flex items-center gap-1 text-[12px] text-zinc-400">
                      <span className="text-zinc-600 text-[10px]">·</span>
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      {job.location}
                    </span>
                  )}
                </div>

                {/* Row 2: Metadata badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] sm:text-[11px] font-medium text-zinc-400">
                  {job.work_mode && (
                    <span className="bg-[var(--app-nested)] px-2 py-0.5 rounded border border-[var(--app-border-strong)] capitalize">
                      {job.work_mode}
                    </span>
                  )}
                  {job.job_type && (
                    <span className="bg-[var(--app-nested)] px-2 py-0.5 rounded border border-[var(--app-border-strong)]">
                      {job.job_type.replace("_", " ")}
                    </span>
                  )}
                  {!!job.posted_at && (
                    <span className="inline-flex items-center gap-1 text-zinc-400 ml-0.5">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {timeAgo(job.posted_at)}
                    </span>
                  )}
                  {(job.salary_min || job.salary_max) && (
                    <span className="text-zinc-300 bg-white/[0.06] border border-[var(--app-border-strong)] px-2 py-0.5 rounded font-medium">
                      ₹{job.salary_min ?? "?"} – {job.salary_max ?? "?"}K
                    </span>
                  )}
                </div>

                {/* Row 3: Description / AI summary */}
                {job.analysis?.ai_summary && (
                  <p className="text-[12px] sm:text-[13px] text-zinc-400 mt-1.5 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                    {job.analysis.ai_summary}
                  </p>
                )}
              </div>

              {/* Right: Match score + Actions */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-between shrink-0 gap-2.5 w-full md:w-auto self-stretch pt-1 md:pt-0">
                <div className="flex items-center md:justify-end">
                  {job.analysis?.match_score != null && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[var(--app-nested)] rounded-md border border-[var(--app-border-strong)] shrink-0" title={`Match score: ${Math.round(job.analysis.match_score)}%`}>
                      <MatchScoreRing score={job.analysis.match_score} size={18} strokeWidth={2.5} />
                      <span className="text-[11px] font-semibold text-white tabular-nums">{Math.round(job.analysis.match_score)}%</span>
                      <span className={cn(
                        "text-[10px] font-medium hidden sm:inline",
                        job.analysis.match_score >= 80 ? "text-white" :
                        job.analysis.match_score >= 60 ? "text-zinc-300" :
                        job.analysis.match_score >= 40 ? "text-zinc-400" : "text-zinc-500"
                      )}>
                        {job.analysis.match_score >= 80 ? "Excellent" :
                         job.analysis.match_score >= 60 ? "Good" :
                         job.analysis.match_score >= 40 ? "Fair" : "Low"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => applyMutation.mutate(job.id)}
                    disabled={applyMutation.isPending}
                    className="h-[30px] px-3 bg-white text-black rounded-md text-[12px] font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Apply</span>
                  </button>
                  {job.source_url && (
                    <a
                      href={job.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[30px] h-[30px] flex items-center justify-center bg-[#171717] border border-[var(--app-border-strong)] rounded-md hover:bg-[var(--app-card)] text-zinc-400 hover:text-white transition-colors"
                      title="Open job source"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => analyzeMutation.mutate(job.id)}
                    disabled={analyzeMutation.isPending}
                    className="w-[30px] h-[30px] flex items-center justify-center bg-[#171717] border border-[var(--app-border-strong)] rounded-md hover:bg-[var(--app-card)] text-zinc-400 hover:text-white transition-colors"
                    title="Analyze job"
                  >
                    <Zap className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => skipMutation.mutate(job.id)}
                    className="w-[30px] h-[30px] flex items-center justify-center bg-[#171717] border border-[var(--app-border-strong)] rounded-md hover:bg-[var(--app-card)] text-zinc-400 hover:text-white transition-colors"
                    title="Skip job"
                  >
                    <SkipForward className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {data?.items?.length === 0 && (
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-12 text-center">
              <Briefcase className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <p className="text-[14px] text-zinc-400">No jobs found. Try adjusting filters or run the agent to scrape new listings.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="h-8 px-3 bg-[#171717] hover:bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-md text-[13px] font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">← Prev</button>
          <span className="text-[13px] text-zinc-400 px-2">Page {page} of {data.pages}</span>
          <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages}
            className="h-8 px-3 bg-[#171717] hover:bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-md text-[13px] font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Next →</button>
        </div>
      )}
    </div>
  );
}
