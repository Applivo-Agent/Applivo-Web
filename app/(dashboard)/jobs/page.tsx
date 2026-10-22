"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi, applicationsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn, timeAgo } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Briefcase,
  MapPin,
  Clock,
  Zap,
  Send,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Loader2,
  Bookmark,
  CheckCircle,
  X,
  Building2,
  DollarSign,
  AlertCircle,
  ArrowUpDown,
  Check,
  Share2,
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
      ? "#34d399" // emerald-400
      : score >= 60
      ? "#e4e4e7" // zinc-200
      : score >= 40
      ? "#a1a1aa" // zinc-400
      : "#71717a"; // zinc-500

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
    label: "70%+ Match",
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
    <div className="dash-page relative">
      {/* ─── 1. Header (Compact Linear style) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center shrink-0">
            <Briefcase className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] leading-tight font-medium tracking-tight text-white">
                Find Jobs
              </h1>
              {viewSavedOnly && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Saved View
                </span>
              )}
            </div>
            <p className="text-[12px] sm:text-[13px] text-zinc-400 mt-0.5">
              {viewSavedOnly
                ? `${displayedJobs.length} saved opportunit${displayedJobs.length === 1 ? "y" : "ies"}`
                : `${data?.total ?? 0} matching opportunities`}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setViewSavedOnly(!viewSavedOnly)}
            className={cn(
              "h-8 px-3 rounded-md text-[12px] font-medium transition-colors border flex items-center gap-1.5",
              viewSavedOnly
                ? "bg-white text-black border-white"
                : "bg-[var(--app-card)] hover:bg-[#202022] text-zinc-300 hover:text-white border-[var(--app-border-strong)]"
            )}
            title="Toggle Saved Jobs"
          >
            <Bookmark className={cn("w-3.5 h-3.5", viewSavedOnly && "fill-current")} />
            <span>Saved</span>
            {savedCount > 0 && (
              <span
                className={cn(
                  "ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold",
                  viewSavedOnly ? "bg-black text-white" : "bg-white/10 text-white"
                )}
              >
                {savedCount}
              </span>
            )}
          </button>

          {/* Export CSV button */}
          <button
            onClick={() => handleExportCSV("matching")}
            disabled={isExporting}
            className="h-8 px-2.5 bg-[var(--app-card)] hover:bg-[#202022] text-zinc-300 hover:text-white rounded-md text-[12px] font-medium transition-colors border border-[var(--app-border-strong)] flex items-center gap-1.5 disabled:opacity-50"
            title="Export matching jobs to CSV (including original job URLs)"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
            ) : (
              <Download className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 bg-[var(--app-card)] hover:bg-[#202022] text-zinc-300 hover:text-white rounded-md text-[12px] font-medium transition-colors border border-[var(--app-border-strong)] flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isRefreshing ? "Refreshing feed..." : "Refresh job feed"}
          >
            {isRefreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span className="hidden sm:inline">{isRefreshing ? "Refreshing…" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Search & Filter Sticky Toolbar ─── */}
      <div className="sticky top-0 z-20 bg-[var(--app-bg)]/95 backdrop-blur-md pt-1 pb-3 space-y-2.5 border-b border-[var(--app-border)]/60 mb-3">
        {/* Row 1: Search + Sort + Filter trigger */}
        <div className="flex flex-col md:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search job title, company, skills, or keywords…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 h-8 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-md text-[13px] font-normal text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filters.sort_by}
                onChange={(e) => updateFilter("sort_by", e.target.value)}
                className="h-8 pl-3 pr-7 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-md text-[12px] font-medium text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer appearance-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#181818] text-white">
                    {s.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-8 px-3 rounded-md text-[12px] font-medium transition-colors border flex items-center gap-1.5",
                showFilters || activeFilterCount > 0
                  ? "bg-zinc-800 text-white border-zinc-600"
                  : "bg-[var(--app-card)] text-zinc-300 border-[var(--app-border-strong)] hover:text-white hover:bg-[#202022]"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {(activeFilterCount > 0 || searchInput || viewSavedOnly) && (
              <button
                onClick={clearAllFilters}
                className="h-8 px-2 text-[12px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                title="Clear all filters"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Search Preset Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
          <span className="text-zinc-500 font-medium mr-1 shrink-0">Presets:</span>
          {PRESETS.map((preset) => {
            const isActive = currentPresetId === preset.id && !viewSavedOnly;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={cn(
                  "px-2.5 py-1 rounded-md shrink-0 transition-colors border font-medium",
                  isActive
                    ? "bg-white text-black border-white shadow-xs"
                    : "bg-[var(--app-card)] text-zinc-400 border-[var(--app-border-strong)] hover:text-zinc-200 hover:border-zinc-700"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Collapsible Filter Dropdown Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-[var(--app-card)] rounded-md border border-[var(--app-border-strong)] grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1">
                {/* Work Mode */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Work Mode</label>
                  <select
                    value={filters.work_mode}
                    onChange={(e) => updateFilter("work_mode", e.target.value)}
                    className="w-full h-7 px-2 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded text-[12px] text-zinc-300 focus:outline-none"
                  >
                    {MODES.map((m) => (
                      <option key={m.value} value={m.value} className="bg-[#1b1b1d] text-white">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Type */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Job Type</label>
                  <select
                    value={filters.job_type}
                    onChange={(e) => updateFilter("job_type", e.target.value)}
                    className="w-full h-7 px-2 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded text-[12px] text-zinc-300 focus:outline-none"
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value} className="bg-[#1b1b1d] text-white">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Source Platform</label>
                  <select
                    value={filters.source}
                    onChange={(e) => updateFilter("source", e.target.value)}
                    className="w-full h-7 px-2 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded text-[12px] text-zinc-300 focus:outline-none"
                  >
                    {SOURCES.map((s) => (
                      <option key={s.value} value={s.value} className="bg-[#1b1b1d] text-white">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Match Score */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Min AI Match</label>
                  <select
                    value={filters.min_match_score}
                    onChange={(e) => updateFilter("min_match_score", +e.target.value)}
                    className="w-full h-7 px-2 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded text-[12px] text-zinc-300 focus:outline-none"
                  >
                    {MIN_SCORES.map((s) => (
                      <option key={s.value} value={s.value} className="bg-[#1b1b1d] text-white">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
            <span className="text-zinc-500">Active filters:</span>
            {filters.work_mode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300">
                Mode: {filters.work_mode}
                <button onClick={() => updateFilter("work_mode", "")} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.job_type && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300">
                Type: {filters.job_type.replace("_", " ")}
                <button onClick={() => updateFilter("job_type", "")} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.source && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300">
                Source: {filters.source}
                <button onClick={() => updateFilter("source", "")} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.min_match_score > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300">
                Match: ≥{filters.min_match_score}%
                <button onClick={() => updateFilter("min_match_score", 0)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ─── 3. Job Cards List (Linear Compact Hierarchy) ─── */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[108px] rounded-lg bg-[var(--app-card)] border border-[var(--app-border-strong)] animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-zinc-800" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-48 bg-zinc-800 rounded" />
                    <div className="h-3 w-32 bg-zinc-800/60 rounded" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-zinc-800 rounded" />
              </div>
              <div className="h-3 w-3/4 bg-zinc-800/40 rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-10 text-center">
          <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto mb-2.5" />
          <h3 className="text-[14px] font-medium text-white mb-1">Failed to load jobs</h3>
          <p className="text-[12px] text-zinc-400 max-w-sm mx-auto mb-4">
            Could not fetch opportunities. Please check your network connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="h-8 px-4 bg-white text-black hover:bg-zinc-200 rounded-md text-[12px] font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-2 pb-6">
          {displayedJobs.map((job: any, i: number) => {
            const isSaved = !!savedJobsMap[job.id];
            const appStatus = appliedJobStatusMap[job.id];
            const hasAnalysis = !!job.analysis;
            const matchScore = job.analysis?.match_score != null ? Math.round(job.analysis.match_score) : null;

            // Rating label
            const ratingLabel =
              matchScore != null
                ? matchScore >= 75
                  ? "Strong Match"
                  : matchScore >= 60
                  ? "Good Match"
                  : matchScore >= 40
                  ? "Moderate"
                  : "Low Match"
                : null;

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                onClick={() => setSelectedJob(job)}
                className="bg-[var(--app-card)] p-3.5 sm:p-4 rounded-lg border border-[var(--app-border-strong)] hover:border-zinc-700/80 hover:bg-[#1a1a1c] transition-all flex flex-col md:flex-row items-start gap-3 group cursor-pointer"
              >
                {/* Company Logo (Monochrome building fallback, no initials) */}
                <CompanyLogo src={job.company_logo_url} companyName={job.company_name} size="md" />

                {/* Content Column */}
                <div className="flex-1 min-w-0 w-full">
                  {/* Row 1: Title · Company · Location */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="font-semibold text-[14px] sm:text-[15px] tracking-tight text-white leading-snug group-hover:text-zinc-100 transition-colors">
                      {job.title}
                    </h3>
                    <span className="text-[12px] font-medium text-zinc-300">
                      {job.company_name}
                    </span>
                    {job.location && (
                      <span className="inline-flex items-center gap-1 text-[12px] text-zinc-400">
                        <span className="text-zinc-600">·</span>
                        <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span className="truncate max-w-[140px]">{job.location}</span>
                      </span>
                    )}
                  </div>

                  {/* Row 2: Metadata Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] font-medium text-zinc-400">
                    {job.work_mode && (
                      <span className="bg-[var(--app-nested)] px-2 py-0.5 rounded border border-[var(--app-border-strong)] capitalize text-zinc-300">
                        {job.work_mode}
                      </span>
                    )}
                    {job.job_type && (
                      <span className="bg-[var(--app-nested)] px-2 py-0.5 rounded border border-[var(--app-border-strong)] text-zinc-300">
                        {job.job_type.replace("_", " ")}
                      </span>
                    )}
                    {job.experience_level && job.experience_level !== "unknown" && (
                      <span className="bg-[var(--app-nested)] px-2 py-0.5 rounded border border-[var(--app-border-strong)] text-zinc-400 capitalize">
                        {job.experience_level.replace("_", " ")}
                      </span>
                    )}
                    {((job.salary_min ?? 0) > 0 || (job.salary_max ?? 0) > 0) ? (
                      <span className="text-zinc-200 bg-white/[0.05] border border-[var(--app-border-strong)] px-2 py-0.5 rounded font-medium">
                        ₹{job.salary_min || "?"} – {job.salary_max || "?"}K
                      </span>
                    ) : null}
                    {job.source && (
                      <span className="text-zinc-500 capitalize text-[10px] ml-0.5">
                        via {job.source}
                      </span>
                    )}
                    {job.posted_at && (
                      <span className="inline-flex items-center gap-1 text-zinc-500 text-[11px] ml-auto sm:ml-1">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        {timeAgo(job.posted_at)}
                      </span>
                    )}
                  </div>

                  {/* Row 3: Short Description / AI Summary */}
                  <p className="text-[12px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {job.analysis?.ai_summary || job.description_clean || "No description preview available."}
                  </p>
                </div>

                {/* Right: Match Score + Actions */}
                <div
                  className="flex flex-row md:flex-col items-center md:items-end justify-between shrink-0 gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[var(--app-border-strong)]/50 self-stretch"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Match Score Indicator (real data only) */}
                  <div>
                    {matchScore != null ? (
                      <div
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[var(--app-nested)] rounded-md border border-[var(--app-border-strong)]"
                        title={`AI Match Score: ${matchScore}%`}
                      >
                        <MatchScoreRing score={matchScore} size={16} strokeWidth={2} />
                        <span className="text-[11px] font-semibold text-white tabular-nums">
                          {matchScore}%
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-medium hidden sm:inline",
                            matchScore >= 75 ? "text-emerald-400" : "text-zinc-400"
                          )}
                        >
                          {ratingLabel}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-500 italic hidden md:inline">
                        Unscored
                      </span>
                    )}
                  </div>

                  {/* Actions Group */}
                  <div className="flex items-center gap-1.5">
                    {/* Bookmark / Save Job */}
                    <button
                      onClick={() => toggleSaveJob(job)}
                      className={cn(
                        "w-7 h-7 rounded-md border flex items-center justify-center transition-colors",
                        isSaved
                          ? "bg-white/10 text-white border-white/20"
                          : "bg-[var(--app-nested)] text-zinc-400 border-[var(--app-border-strong)] hover:text-white hover:bg-[var(--app-card)]"
                      )}
                      title={isSaved ? "Remove from saved" : "Save job"}
                    >
                      <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
                    </button>

                    {/* Source link */}
                    {job.source_url && (
                      <a
                        href={job.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 flex items-center justify-center bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md hover:bg-[var(--app-card)] text-zinc-400 hover:text-white transition-colors"
                        title="Open original job posting"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Primary Apply action (application status aware) */}
                    {appStatus === "APPLIED" ? (
                      <span className="h-7 px-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Applied</span>
                      </span>
                    ) : appStatus === "QUEUED" ? (
                      <span className="h-7 px-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-[11px] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Queued</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => applyMutation.mutate(job.id)}
                        disabled={applyMutation.isPending}
                        className="h-7 px-2.5 bg-white text-black rounded-md text-[12px] font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        title="Quick Apply with Applivo Agent"
                      >
                        <Send className="w-3 h-3" />
                        <span>Apply</span>
                      </button>
                    )}

                    {/* Details arrow */}
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="w-7 h-7 flex items-center justify-center bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md hover:bg-[var(--app-card)] text-zinc-400 hover:text-white transition-colors"
                      title="Inspect job details & AI match"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Empty state */}
          {displayedJobs.length === 0 && (
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-10 text-center">
              <Briefcase className="w-8 h-8 text-zinc-500 mx-auto mb-2.5" />
              <h3 className="text-[14px] font-medium text-white mb-1">
                {viewSavedOnly ? "No saved jobs yet" : "No matching jobs found"}
              </h3>
              <p className="text-[12px] text-zinc-400 max-w-sm mx-auto mb-4">
                {viewSavedOnly
                  ? "Click the bookmark icon on any job card to save it for quick review."
                  : "Try clearing active filters, broadening your search query, or checking back soon."}
              </p>
              {viewSavedOnly ? (
                <button
                  onClick={() => setViewSavedOnly(false)}
                  className="h-8 px-4 bg-white text-black hover:bg-zinc-200 rounded-md text-[12px] font-medium transition-colors"
                >
                  View All Opportunities
                </button>
              ) : (
                <button
                  onClick={clearAllFilters}
                  className="h-8 px-4 bg-white text-black hover:bg-zinc-200 rounded-md text-[12px] font-medium transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
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
              className="h-7 px-2.5 bg-[var(--app-card)] hover:bg-[#202022] border border-[var(--app-border-strong)] rounded text-zinc-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              ← Prev
            </button>
            <span className="text-zinc-400 px-1 font-medium">
              Page {page} of {data.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="h-7 px-2.5 bg-[var(--app-card)] hover:bg-[#202022] border border-[var(--app-border-strong)] rounded text-zinc-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
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
                    <span className="h-8 px-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-[12px] font-medium flex items-center gap-1.5">
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
                      className="h-8 px-2.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] hover:bg-[#202022] text-zinc-300 hover:text-white rounded-md text-[12px] font-medium flex items-center gap-1 transition-colors"
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
                      className="h-8 px-2.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] hover:bg-[#202022] text-zinc-300 hover:text-white rounded-md text-[12px] font-medium flex items-center gap-1 transition-colors"
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
                  <div className="p-3.5 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] space-y-3">
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
                  <div className="p-3.5 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-between">
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
                    <div className="bg-[var(--app-nested)] p-4 rounded-lg border border-[var(--app-border-strong)] overflow-hidden">
                      <FormattedJobDescription text={selectedJob.description_clean} />
                    </div>
                  ) : (
                    <div className="bg-[var(--app-nested)] p-4 rounded-lg border border-[var(--app-border-strong)] text-center py-6">
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
