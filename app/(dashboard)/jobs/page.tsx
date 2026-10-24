"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi, applicationsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn, timeAgo } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  Zap,
  Send,
  RefreshCw,
  ExternalLink,
  Loader2,
  Bookmark,
  CheckCircle,
  X,
  Building2,
  AlertCircle,
  ArrowUpDown,
  Check,
  Download,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Company Logo Component (Monochrome building fallback, no alphabet initials) ─── */
function CompanyLogo({
  src,
  companyName,
  size = "md",
}: {
  src?: string | null;
  companyName?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [imageError, setImageError] = useState(false);

  // Validate URL format and filter out generic placeholder svgs
  const isValidUrl = useMemo(() => {
    if (!src || typeof src !== "string" || !src.trim()) return false;
    const clean = src.trim().toLowerCase();
    if (clean.includes("placeholder") || clean.endsWith(".svg")) return false;
    try {
      const u = new URL(src.trim());
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, [src]);

  const containerSize =
    size === "sm"
      ? "w-8 h-8"
      : size === "lg"
      ? "w-10 h-10"
      : "w-[34px] h-[34px]";

  const iconSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";

  if (!isValidUrl || imageError) {
    return (
      <div
        className={cn(
          containerSize,
          "rounded-md bg-white/[0.03] border border-[var(--app-border-strong)] flex items-center justify-center shrink-0 text-zinc-500"
        )}
        title={companyName || "Company"}
      >
        <Building2 className={iconSize} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        containerSize,
        "rounded-md bg-white/[0.04] border border-[var(--app-border-strong)] flex items-center justify-center shrink-0 p-1 overflow-hidden"
      )}
      title={companyName || "Company"}
    >
      <img
        src={src!.trim()}
        alt={companyName || "Company logo"}
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
}

/* ─── Compact Circular Score Ring ─── */
function MatchScoreRing({
  score,
  size = 18,
  strokeWidth = 2,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const color =
    score >= 75
      ? "var(--cc-34d399)" // emerald-400
      : score >= 60
      ? "rgb(var(--tw-zinc-200))" // zinc-200
      : score >= 40
      ? "rgb(var(--tw-zinc-400))" // zinc-400
      : "rgb(var(--tw-zinc-500))"; // zinc-500

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="rgba(255,255,255,0.12)"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={color}
          strokeLinecap="round"
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * pct) / 100 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

/* ─── Structured Job Description Renderer ─── */
function FormattedJobDescription({ text }: { text: string }) {
  if (!text) return null;

  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="text-[12.5px] leading-relaxed text-zinc-300 space-y-3.5 break-words">
      {paragraphs.map((para, pIdx) => {
        const isHeader =
          para.endsWith(":") &&
          para.length < 80 &&
          !para.includes("\n") &&
          !para.startsWith("•") &&
          !/^\d+\./.test(para);

        if (isHeader) {
          return (
            <h5
              key={pIdx}
              className="text-[13px] font-semibold text-zinc-100 mt-4 first:mt-0 pt-2 border-t border-[var(--app-border-strong)]/40 first:border-0 first:pt-0"
            >
              {para}
            </h5>
          );
        }

        const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
        const hasListItems = lines.some((l) => l.startsWith("•") || /^\d+\./.test(l));

        if (hasListItems) {
          return (
            <div key={pIdx} className="space-y-1.5">
              {lines.map((line, lIdx) => {
                const isHeadingLine =
                  line.endsWith(":") &&
                  line.length < 80 &&
                  lIdx === 0 &&
                  !line.startsWith("•") &&
                  !/^\d+\./.test(line);

                if (isHeadingLine) {
                  return (
                    <h5
                      key={lIdx}
                      className="text-[13px] font-semibold text-zinc-100 mt-3 first:mt-0"
                    >
                      {line}
                    </h5>
                  );
                }

                if (line.startsWith("•")) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-1 text-zinc-300">
                      <span className="text-zinc-500 select-none mt-0.5">•</span>
                      <span>{line.replace(/^•\s*/, "")}</span>
                    </div>
                  );
                }

                const numMatch = line.match(/^(\d+\.)\s*(.*)$/);
                if (numMatch) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-1 text-zinc-300">
                      <span className="text-zinc-500 font-mono text-[11px] select-none mt-0.5 shrink-0">
                        {numMatch[1]}
                      </span>
                      <span>{numMatch[2]}</span>
                    </div>
                  );
                }

                return (
                  <p key={lIdx} className="text-zinc-300">
                    {line}
                  </p>
                );
              })}
            </div>
          );
        }

        return (
          <p key={pIdx} className="text-zinc-300">
            {para}
          </p>
        );
      })}
    </div>
  );
}

/* ─── Filter & Sort Options ─── */
const SOURCES = [
  { value: "", label: "All sources" },
  { value: "internshala", label: "Internshala" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "wellfound", label: "Wellfound" },
  { value: "remoteok", label: "RemoteOK" },
];

const TYPES = [
  { value: "", label: "All types" },
  { value: "full_time", label: "Full-time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
  { value: "part_time", label: "Part-time" },
];

const MODES = [
  { value: "", label: "All modes" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

const SORTS = [
  { value: "match_score", label: "Best Match" },
  { value: "posted_at", label: "Newest Posted" },
  { value: "priority_score", label: "Priority" },
  { value: "created_at", label: "Recently Discovered" },
];

const MIN_SCORES = [
  { value: 0, label: "Any match" },
  { value: 50, label: "50%+ match" },
  { value: 70, label: "70%+ match" },
  { value: 85, label: "85%+ match" },
];

/* ─── Search Presets ─── */
interface Preset {
  id: string;
  label: string;
  filters: {
    work_mode: string;
    job_type: string;
    source: string;
    min_match_score: number;
    sort_by: string;
  };
}

const PRESETS: Preset[] = [
  {
    id: "all",
    label: "All Jobs",
    filters: { work_mode: "", job_type: "", source: "", min_match_score: 0, sort_by: "match_score" },
  },
  {
    id: "high_match",
    label: "High Match",
    filters: { work_mode: "", job_type: "", source: "", min_match_score: 70, sort_by: "match_score" },
  },
  {
    id: "remote",
    label: "Remote",
    filters: { work_mode: "remote", job_type: "", source: "", min_match_score: 0, sort_by: "match_score" },
  },
  {
    id: "internship",
    label: "Internships",
    filters: { work_mode: "", job_type: "internship", source: "", min_match_score: 0, sort_by: "posted_at" },
  },
  {
    id: "full_time",
    label: "Full-Time",
    filters: { work_mode: "", job_type: "full_time", source: "", min_match_score: 0, sort_by: "match_score" },
  },
];

export default function JobsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();

  // Storage key for user-saved jobs
  const savedStorageKey = useMemo(() => `applivo_saved_jobs_${user?.id || "guest"}`, [user?.id]);

  // Saved jobs dictionary: id -> job object
  const [savedJobsMap, setSavedJobsMap] = useState<Record<string, any>>({});
  const [viewSavedOnly, setViewSavedOnly] = useState(false);

  // Load saved jobs from localStorage on mount & user change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(savedStorageKey);
      if (stored) {
        setSavedJobsMap(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [savedStorageKey]);

  // Persist save toggle
  const toggleSaveJob = useCallback(
    (job: any) => {
      setSavedJobsMap((prev) => {
        const next = { ...prev };
        if (next[job.id]) {
          delete next[job.id];
          toast.info("Removed from saved jobs");
        } else {
          next[job.id] = job;
          toast.success("Job saved!");
        }
        try {
          localStorage.setItem(savedStorageKey, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [savedStorageKey]
  );

  // Filter & Search states
  const [filters, setFilters] = useState({
    source: "",
    job_type: "",
    work_mode: "",
    min_match_score: 0,
    keyword: "",
    status: "",
    sort_by: "match_score",
  });
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Debounce search input to filters.keyword (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((f) => (f.keyword === searchInput ? f : { ...f, keyword: searchInput }));
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch jobs
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["jobs", filters, page],
    queryFn: () =>
      jobsApi
        .list({
          ...filters,
          page,
          page_size: 20,
          min_match_score: filters.min_match_score || undefined,
        })
        .then((r) => r.data),
  });

  // Query user applications to reflect real application states
  const { data: userApplications } = useQuery({
    queryKey: ["user-applications"],
    queryFn: () => applicationsApi.list({ page_size: 100 }).then((r) => r.data),
    staleTime: 30000,
  });

  // Map of job_id -> application status
  const appliedJobStatusMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (userApplications?.items) {
      for (const app of userApplications.items) {
        if (app.job_id) {
          map[app.job_id] = app.status;
        }
      }
    }
    return map;
  }, [userApplications]);

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

  // Mutations
  const applyMutation = useMutation({
    mutationFn: (jobId: string) =>
      applicationsApi.create({ job_id: jobId, method: "auto_bot" }),
    onSuccess: () => {
      toast.success("Application queued successfully!");
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["user-applications"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? "Failed to queue application"),
  });

  const analyzeMutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.analyze(jobId),
    onSuccess: (res, jobId) => {
      toast.success("AI analysis queued!");
      qc.invalidateQueries({ queryKey: ["jobs"] });
      // If currently selected job, update its details
      if (selectedJob?.id === jobId) {
        jobsApi.get(jobId).then((r) => setSelectedJob(r.data)).catch(() => {});
      }
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? "Failed to trigger analysis"),
  });

  // CSV Export
  const [isExporting, setIsExporting] = useState(false);
  const handleExportCSV = async (scope: "matching" | "all" = "matching") => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const exportParams: Record<string, unknown> = {
        scope,
        sort_by: filters.sort_by,
      };
      if (scope === "matching") {
        if (filters.source) exportParams.source = filters.source;
        if (filters.job_type) exportParams.job_type = filters.job_type;
        if (filters.work_mode) exportParams.work_mode = filters.work_mode;
        if (filters.min_match_score > 0) exportParams.min_match_score = filters.min_match_score;
        if (filters.keyword) exportParams.keyword = filters.keyword;
        if (filters.status) exportParams.status = filters.status;
      }
      const response = await jobsApi.exportCsv(exportParams);
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `applivo-jobs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Jobs CSV exported successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  // Filter setters
  const updateFilter = (key: string, val: any) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setFilters({
      source: "",
      job_type: "",
      work_mode: "",
      min_match_score: 0,
      keyword: "",
      status: "",
      sort_by: "match_score",
    });
    setViewSavedOnly(false);
    setPage(1);
  };

  // Check active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.source) count++;
    if (filters.job_type) count++;
    if (filters.work_mode) count++;
    if (filters.min_match_score > 0) count++;
    return count;
  }, [filters]);

  // Match active preset
  const currentPresetId = useMemo(() => {
    for (const p of PRESETS) {
      if (
        p.filters.work_mode === filters.work_mode &&
        p.filters.job_type === filters.job_type &&
        p.filters.source === filters.source &&
        p.filters.min_match_score === filters.min_match_score &&
        p.filters.sort_by === filters.sort_by
      ) {
        return p.id;
      }
    }
    return "custom";
  }, [filters]);

  const applyPreset = (preset: Preset) => {
    setFilters((f) => ({
      ...f,
      ...preset.filters,
    }));
    setViewSavedOnly(false);
    setPage(1);
  };

  // Keyboard escape listener for details drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedJob) {
        setSelectedJob(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedJob]);

  // Display list: either saved jobs or API items
  const displayedJobs = useMemo(() => {
    if (viewSavedOnly) {
      const list = Object.values(savedJobsMap);
      if (!filters.keyword) return list;
      const kw = filters.keyword.toLowerCase();
      return list.filter(
        (j: any) =>
          j.title?.toLowerCase().includes(kw) ||
          j.company_name?.toLowerCase().includes(kw) ||
          j.description_clean?.toLowerCase().includes(kw)
      );
    }
    return data?.items ?? [];
  }, [viewSavedOnly, savedJobsMap, data?.items, filters.keyword]);

  const savedCount = Object.keys(savedJobsMap).length;

  return (
    <div className="dash-page relative !gap-3">
      {/* ─── 1. Header ─── */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1 text-[12px]">
          <button
            onClick={() => setViewSavedOnly(!viewSavedOnly)}
            aria-pressed={viewSavedOnly}
            className={cn("h-8 px-2.5 rounded-md inline-flex items-center gap-1.5 transition-colors", viewSavedOnly ? "bg-white/[0.08] text-white" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]")}
            title="Show saved jobs"
          >
            <Bookmark className={cn("w-3.5 h-3.5", viewSavedOnly && "fill-current")} />
            Saved{savedCount > 0 && <span className="text-zinc-500 tabular-nums">{savedCount}</span>}
          </button>
          <button
            onClick={() => handleExportCSV("matching")}
            disabled={isExporting}
            className="h-8 px-2.5 rounded-md inline-flex items-center gap-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-50"
            title="Export matching jobs to CSV (including original job URLs)"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-2.5 rounded-md inline-flex items-center gap-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-50"
            title={isRefreshing ? "Refreshing feed..." : "Refresh job feed"}
          >
            {isRefreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isRefreshing ? "Refreshing…" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Search, sort, filters ─── */}
      <div className="space-y-2.5 mb-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              aria-label="Search jobs"
              placeholder="Search title, company, skills or keywords"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 h-9 bg-transparent border border-[var(--app-border-strong)] rounded-lg text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
            {searchInput && (
              <button onClick={() => setSearchInput("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white" aria-label="Clear search">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                aria-label="Sort jobs"
                value={filters.sort_by}
                onChange={(e) => updateFilter("sort_by", e.target.value)}
                className="h-9 pl-3 pr-8 bg-transparent border border-[var(--app-border-strong)] rounded-lg text-[13px] text-zinc-300 focus:outline-none focus:border-zinc-500 cursor-pointer appearance-none"
              >
                {SORTS.map((o) => <option key={o.value} value={o.value} className="bg-[var(--sx-bg-181818)] text-white">{o.label}</option>)}
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              className={cn("h-9 px-3 rounded-lg text-[13px] border inline-flex items-center gap-1.5 transition-colors",
                showFilters || activeFilterCount > 0 ? "border-zinc-500 text-white" : "border-[var(--app-border-strong)] text-zinc-300 hover:text-white")}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && <span className="text-zinc-400 tabular-nums">{activeFilterCount}</span>}
            </button>
            {(activeFilterCount > 0 || searchInput || viewSavedOnly) && (
              <button onClick={clearAllFilters} className="h-9 px-1.5 text-[13px] text-zinc-500 hover:text-white transition-colors" title="Clear all filters">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Presets: quiet text tabs */}
        <div role="group" aria-label="Quick filters" className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
          {PRESETS.map((preset) => {
            const isActive = currentPresetId === preset.id && !viewSavedOnly;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                aria-pressed={isActive}
                className={cn("px-2.5 py-1 rounded-md text-[13px] shrink-0 transition-colors", isActive ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-200")}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-[var(--app-border)]">
                {([
                  ["Work mode", "work_mode", MODES, filters.work_mode],
                  ["Job type", "job_type", TYPES, filters.job_type],
                  ["Source", "source", SOURCES, filters.source],
                  ["Minimum match", "min_match_score", MIN_SCORES, filters.min_match_score],
                ] as const).map(([label, key, opts, val]) => (
                  <label key={key} className="space-y-1 block">
                    <span className="text-[12px] text-zinc-500">{label}</span>
                    <select
                      value={val as any}
                      onChange={(e) => updateFilter(key, key === "min_match_score" ? +e.target.value : e.target.value)}
                      className="w-full h-8 px-2 bg-transparent border border-[var(--app-border-strong)] rounded-md text-[13px] text-zinc-300 focus:outline-none focus:border-zinc-500"
                    >
                      {(opts as readonly { value: string | number; label: string }[]).map((o) => (
                        <option key={String(o.value)} value={o.value} className="bg-[var(--sx-bg-181818)] text-white">{o.label}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 3. Job rows ─── */}
      {isLoading ? (
        <div className="divide-y divide-[var(--app-border)]" aria-busy="true" aria-label="Loading jobs">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="py-4 flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-md bg-white/[0.05]" />
              <div className="flex-1 space-y-2"><div className="h-3.5 w-1/3 rounded bg-white/[0.06]" /><div className="h-3 w-1/2 rounded bg-white/[0.04]" /><div className="h-3 w-3/4 rounded bg-white/[0.03]" /></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-14 text-center">
          <AlertCircle className="w-5 h-5 text-zinc-500 mx-auto mb-2" />
          <p className="text-[14px] text-white">Couldn&apos;t load jobs</p>
          <p className="text-[13px] text-zinc-500 mt-1 mb-4">Check your connection and try again.</p>
          <button onClick={() => refetch()} className="h-8 px-4 rounded-lg border border-[var(--app-border-strong)] text-[13px] text-zinc-200 hover:text-white hover:bg-white/[0.04]">Retry</button>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--app-border)] border-t border-[var(--app-border)] pb-4">
          {displayedJobs.map((job: any) => {
            const isSaved = !!savedJobsMap[job.id];
            const appStatus = appliedJobStatusMap[job.id];
            const matchScore = job.analysis?.match_score != null ? Math.round(job.analysis.match_score) : null;
            const applying = applyMutation.isPending && applyMutation.variables === job.id;
            const cap = (v: string) => v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
            const meta = [
              job.location,
              job.work_mode && job.work_mode !== "unknown" ? cap(String(job.work_mode)) : null,
              job.job_type ? cap(String(job.job_type)) : null,
              job.experience_level && job.experience_level !== "unknown" ? cap(String(job.experience_level)) : null,
              ((job.salary_min ?? 0) > 0 || (job.salary_max ?? 0) > 0) ? `₹${job.salary_min || "?"} – ${job.salary_max || "?"}K` : null,
              job.posted_at ? timeAgo(job.posted_at) : null,
              job.source ? `via ${cap(String(job.source))}` : null,
            ].filter(Boolean) as string[];

            return (
              <li key={job.id} className="group relative flex flex-col md:flex-row md:items-start gap-3 py-4 px-2 -mx-2 rounded-lg hover:bg-white/[0.025] focus-within:bg-white/[0.025] transition-colors">
                <CompanyLogo src={job.company_logo_url} companyName={job.company_name} size="sm" />

                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="text-left text-[15px] font-medium text-white leading-snug break-words hover:underline underline-offset-2 decoration-zinc-600 focus:outline-none focus-visible:underline after:absolute after:inset-0 after:content-['']"
                  >
                    {job.title}
                  </button>
                  <div className="text-[13px] text-zinc-300 mt-0.5 break-words">{job.company_name || "Company not listed"}</div>
                  {meta.length > 0 && (
                    <div className="mt-1 text-[12px] text-zinc-500">
                      {meta.map((m, i) => (
                        <span key={i}>{i > 0 && <span className="mx-1.5 text-zinc-700">·</span>}{m}</span>
                      ))}
                    </div>
                  )}
                  <p className="mt-1.5 text-[13px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {job.analysis?.ai_summary || job.description_clean || "No description preview available."}
                  </p>
                </div>

                <div className="relative z-10 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:gap-2 shrink-0 md:w-40">
                  <div className="text-[12px] tabular-nums md:text-right" title={matchScore != null ? `AI match score ${matchScore}%` : "No AI match score available for this job yet"}>
                    {matchScore != null ? (
                      <span className="text-zinc-300">{matchScore}% <span className="text-zinc-500">match</span></span>
                    ) : (
                      <span className="text-zinc-600">Not scored</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleSaveJob(job)}
                      aria-pressed={isSaved}
                      aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
                      title={isSaved ? "Saved — click to remove" : "Save job"}
                      className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Bookmark className={cn("w-4 h-4", isSaved && "fill-current text-white")} />
                    </button>
                    {appStatus === "APPLIED" ? (
                      <span className="h-8 px-3 inline-flex items-center gap-1.5 text-[12px] text-zinc-400"><CheckCircle className="w-3.5 h-3.5" />Applied</span>
                    ) : appStatus === "QUEUED" ? (
                      <span className="h-8 px-3 inline-flex items-center gap-1.5 text-[12px] text-zinc-400"><Clock className="w-3.5 h-3.5" />Queued</span>
                    ) : (
                      <button
                        onClick={() => applyMutation.mutate(job.id)}
                        disabled={applying}
                        className="h-8 px-3.5 rounded-lg bg-white text-black text-[12px] font-medium hover:bg-zinc-200 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                        title="Quick apply with the Applivo agent"
                      >
                        {applying ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}

          {displayedJobs.length === 0 && (
            <li className="py-14 text-center">
              <p className="text-[14px] text-white">
                {viewSavedOnly ? "No saved jobs yet" : filters.keyword ? `No jobs match “${filters.keyword}”` : "No matching jobs"}
              </p>
              <p className="text-[13px] text-zinc-500 mt-1 mb-4 max-w-sm mx-auto">
                {viewSavedOnly ? "Use the bookmark on a job to keep it here." : "Try a broader search or clear the filters."}
              </p>
              <button
                onClick={viewSavedOnly ? () => setViewSavedOnly(false) : clearAllFilters}
                className="h-8 px-4 rounded-lg border border-[var(--app-border-strong)] text-[13px] text-zinc-200 hover:text-white hover:bg-white/[0.04]"
              >
                {viewSavedOnly ? "View all jobs" : "Clear filters"}
              </button>
            </li>
          )}
        </ul>
      )}

      {/* ─── 4. Pagination (Server-side) ─── */}
      {!viewSavedOnly && data && data.pages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--app-border-strong)]/60 pt-3 pb-2 text-[12px]">
          <span className="text-zinc-500 text-[12px]">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7 px-2.5 bg-[var(--app-card)] hover:bg-[var(--sx-bg-202022)] border border-[var(--app-border-strong)] rounded text-zinc-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              ← Prev
            </button>
            <span className="text-zinc-400 px-1 font-medium">
              Page {page} of {data.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="h-7 px-2.5 bg-[var(--app-card)] hover:bg-[var(--sx-bg-202022)] border border-[var(--app-border-strong)] rounded text-zinc-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ─── 5. Job Details Slide-over Drawer ─── */}
      <AnimatePresence>
        {selectedJob && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-over Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-full sm:max-w-xl bg-[var(--app-card)] border-l border-[var(--app-border-strong)] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-[var(--app-border-strong)] flex items-start justify-between gap-3 bg-[var(--app-nested)]">
                <div className="flex items-start gap-3 min-w-0">
                  <CompanyLogo src={selectedJob.company_logo_url} companyName={selectedJob.company_name} size="lg" />
                  <div className="min-w-0">
                    <h2 className="text-[16px] font-semibold text-white tracking-tight leading-snug truncate">
                      {selectedJob.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5 text-[12px] text-zinc-300">
                      <span className="font-medium text-white">{selectedJob.company_name}</span>
                      {selectedJob.location && (
                        <>
                          <span className="text-zinc-600">·</span>
                          <span className="inline-flex items-center gap-1 text-zinc-400">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            {selectedJob.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(null)}
                  className="w-8 h-8 rounded-md bg-[var(--app-card)] border border-[var(--app-border-strong)] text-zinc-400 hover:text-white flex items-center justify-center shrink-0 transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Quick Action Toolbar */}
              <div className="px-4 sm:px-5 py-2.5 bg-[var(--app-card)] border-b border-[var(--app-border-strong)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {appliedJobStatusMap[selectedJob.id] === "APPLIED" ? (
                    <span className="h-8 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[12px] font-medium flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Applied
                    </span>
                  ) : appliedJobStatusMap[selectedJob.id] === "QUEUED" ? (
                    <span className="h-8 px-3 bg-white/[0.04] border border-[var(--app-border-strong)] text-zinc-300 rounded-md text-[12px] font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Queued for Bot
                    </span>
                  ) : (
                    <button
                      onClick={() => applyMutation.mutate(selectedJob.id)}
                      disabled={applyMutation.isPending}
                      className="h-8 px-3.5 bg-white text-black hover:bg-zinc-200 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Apply with Agent
                    </button>
                  )}

                  <button
                    onClick={() => toggleSaveJob(selectedJob)}
                    className={cn(
                      "h-8 px-3 rounded-md border text-[12px] font-medium transition-colors flex items-center gap-1.5",
                      savedJobsMap[selectedJob.id]
                        ? "bg-white/10 text-white border-white/20"
                        : "bg-[var(--app-nested)] text-zinc-300 border-[var(--app-border-strong)] hover:text-white"
                    )}
                  >
                    <Bookmark
                      className={cn("w-3.5 h-3.5", savedJobsMap[selectedJob.id] && "fill-current")}
                    />
                    <span>{savedJobsMap[selectedJob.id] ? "Saved" : "Save"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {!selectedJob.analysis && (
                    <button
                      onClick={() => analyzeMutation.mutate(selectedJob.id)}
                      disabled={analyzeMutation.isPending}
                      className="h-8 px-2.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] hover:bg-[var(--sx-bg-202022)] text-zinc-300 hover:text-white rounded-md text-[12px] font-medium flex items-center gap-1 transition-colors"
                      title="Run AI Match Score Analysis"
                    >
                      <Zap className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="hidden sm:inline">Analyze</span>
                    </button>
                  )}

                  {selectedJob.source_url && (
                    <a
                      href={selectedJob.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-2.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] hover:bg-[var(--sx-bg-202022)] text-zinc-300 hover:text-white rounded-md text-[12px] font-medium flex items-center gap-1 transition-colors"
                      title="Open source posting"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Source</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                {/* 1. Neutral Match Explanation Section (No green Lumi branding) */}
                {selectedJob.analysis ? (
                  <div className="p-3.5 rounded-lg bg-transparent border border-[var(--app-border-strong)] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13px] font-medium text-white">Match details</h4>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--app-card)] border border-[var(--app-border-strong)]">
                          <MatchScoreRing
                            score={selectedJob.analysis.match_score}
                            size={16}
                            strokeWidth={2}
                          />
                          <span className="text-[12px] font-bold text-white tabular-nums">
                            {Math.round(selectedJob.analysis.match_score)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendation / Summary */}
                    {(selectedJob.analysis.ai_recommendation || selectedJob.analysis.ai_summary) && (
                      <p className="text-[12px] text-zinc-300 leading-relaxed bg-[var(--app-card)]/60 p-2.5 rounded border border-[var(--app-border-strong)]/60">
                        {selectedJob.analysis.ai_recommendation || selectedJob.analysis.ai_summary}
                      </p>
                    )}

                    {/* Matching Qualifications */}
                    {selectedJob.analysis.matching_skills?.length > 0 && (
                      <div>
                        <div className="text-[11px] font-medium text-zinc-300 mb-1.5 flex items-center gap-1">
                          <Check className="w-3 h-3 text-zinc-400" /> Matching Qualifications
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedJob.analysis.matching_skills.map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-white/[0.04] border border-[var(--app-border-strong)] text-zinc-200 text-[11px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills / Gaps */}
                    {selectedJob.analysis.missing_skills?.length > 0 && (
                      <div>
                        <div className="text-[11px] font-medium text-zinc-400 mb-1.5 flex items-center gap-1">
                          Skill Gaps
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedJob.analysis.missing_skills.map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-white/[0.02] border border-[var(--app-border-strong)] text-zinc-400 text-[11px]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tech Stack */}
                    {selectedJob.analysis.tech_stack?.length > 0 && (
                      <div>
                        <div className="text-[11px] font-medium text-zinc-400 mb-1.5">
                          Tech Stack
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedJob.analysis.tech_stack.map((t: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[var(--app-card)] border border-[var(--app-border-strong)] text-zinc-300 text-[11px]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg bg-transparent border border-[var(--app-border-strong)] flex items-center justify-between">
                    <div>
                      <h4 className="text-[13px] font-medium text-white">AI Analysis</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Generate profile fit score, matching skills, and resume suggestions.
                      </p>
                    </div>
                    <button
                      onClick={() => analyzeMutation.mutate(selectedJob.id)}
                      disabled={analyzeMutation.isPending}
                      className="h-7 px-3 bg-white text-black hover:bg-zinc-200 rounded text-[11px] font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{analyzeMutation.isPending ? "Queuing…" : "Run Analysis"}</span>
                    </button>
                  </div>
                )}

                {/* 2. Key Metadata Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                  <div className="p-2.5 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)]">
                    <span className="text-[11px] text-zinc-500 block">Work Mode</span>
                    <span className="font-medium text-zinc-200 capitalize mt-0.5 block">
                      {selectedJob.work_mode || "Not specified"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)]">
                    <span className="text-[11px] text-zinc-500 block">Job Type</span>
                    <span className="font-medium text-zinc-200 capitalize mt-0.5 block">
                      {selectedJob.job_type ? selectedJob.job_type.replace("_", " ") : "Not specified"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)]">
                    <span className="text-[11px] text-zinc-500 block">Experience</span>
                    <span className="font-medium text-zinc-200 capitalize mt-0.5 block">
                      {selectedJob.experience_level && selectedJob.experience_level !== "unknown"
                        ? selectedJob.experience_level.replace("_", " ")
                        : "Any"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)]">
                    <span className="text-[11px] text-zinc-500 block">Compensation</span>
                    <span className="font-medium text-zinc-200 mt-0.5 block">
                      {(selectedJob.salary_min && selectedJob.salary_min > 0) || (selectedJob.salary_max && selectedJob.salary_max > 0)
                        ? `₹${selectedJob.salary_min || "?"} – ${selectedJob.salary_max || "?"}K`
                        : "Disclosed later"}
                    </span>
                  </div>
                </div>

                {/* 3. Full Job Description */}
                <div>
                  <h4 className="text-[13px] font-semibold text-white mb-2">Job Description</h4>
                  {selectedJob.description_clean ? (
                    <div className="bg-transparent p-4 rounded-lg border border-[var(--app-border-strong)] overflow-hidden">
                      <FormattedJobDescription text={selectedJob.description_clean} />
                    </div>
                  ) : (
                    <div className="bg-transparent p-4 rounded-lg border border-[var(--app-border-strong)] text-center py-6">
                      <p className="text-[12px] text-zinc-400">
                        Detailed description not available for this posting.
                      </p>
                      {selectedJob.source_url && (
                        <a
                          href={selectedJob.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-[11px] text-zinc-300 hover:text-white transition-colors underline underline-offset-4"
                        >
                          View original listing on {selectedJob.source || "source platform"}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Provenance Footer */}
                <div className="text-[11px] text-zinc-500 flex items-center justify-between border-t border-[var(--app-border-strong)] pt-3">
                  <span>
                    Discovered via <span className="text-zinc-400 capitalize">{selectedJob.source}</span>
                  </span>
                  {selectedJob.scraped_at && (
                    <span>Scraped {timeAgo(selectedJob.scraped_at)}</span>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
