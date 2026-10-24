"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi, agentApi } from "@/lib/api";
import { cn, getStatusClass, getStatusLabel, timeAgo, formatDate } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  ChevronDown,
  Play,
  Loader2,
  Download,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  X,
  CheckSquare,
  Square,
  ChevronRight,
} from "lucide-react";

interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  job_title_snapshot: string;
  company_snapshot: string;
  match_score_at_apply?: number | null;
  recruiter_name?: string | null;
  recruiter_email?: string | null;
  interview_date?: string | null;
  offer_salary?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  applied_at?: string | null;
  job?: {
    id: string;
    title: string;
    company_name: string;
    source_url?: string;
    location?: string;
    salary_range?: string;
  };
}

const KANBAN_COLUMNS = [
  { id: "pending_approval", label: "Pending Approval" },
  { id: "queued", label: "Queued" },
  { id: "applying", label: "Applying" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
  { id: "failed", label: "Failed / Skipped" },
];

export default function ApplicationsPage() {
  const qc = useQueryClient();

  // View & Pagination
  const [view, setView] = useState<"kanban" | "table">("table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters & Search
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Selection & UI State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [activeMenuAppId, setActiveMenuAppId] = useState<string | null>(null);

  // Drawer & Modal State
  const [drawerApp, setDrawerApp] = useState<Application | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Drawer form state
  const [drawerForm, setDrawerForm] = useState({
    status: "",
    recruiter_name: "",
    recruiter_email: "",
    interview_date: "",
    offer_salary: "",
    notes: "",
  });

  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close export menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch applications
  const effectivePageSize = view === "kanban" ? 250 : pageSize;
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: [
      "applications",
      {
        page: view === "kanban" ? 1 : page,
        page_size: effectivePageSize,
        search: debouncedSearch,
        status: statusFilter,
        sort_by: sortBy,
      },
    ],
    queryFn: () =>
      applicationsApi
        .list({
          page: view === "kanban" ? 1 : page,
          page_size: effectivePageSize,
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          sort_by: sortBy,
        })
        .then((r) => r.data),
  });

  // Fetch stats for stable summary counters
  const { data: stats } = useQuery({
    queryKey: ["applications-stats"],
    queryFn: () => applicationsApi.stats().then((r) => r.data),
  });

  const isRefreshing = isManualRefreshing || isRefetching;

  // Mutations
  const approveMut = useMutation({
    mutationFn: (id: string) => applicationsApi.approve(id),
    onSuccess: () => {
      toast.success("Approved and queued for application.");
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["applications-stats"] });
    },
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      applicationsApi.updateStatus(id, payload),
    onSuccess: (_, variables) => {
      toast.success("Application updated successfully");
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["applications-stats"] });
      if (drawerApp && drawerApp.id === variables.id) {
        setDrawerApp((prev) => (prev ? ({ ...prev, ...variables.payload } as Application) : null));
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to update status");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => applicationsApi.delete(id),
    onSuccess: () => {
      toast.success("Application deleted");
      setDeleteConfirmId(null);
      if (drawerApp && drawerApp.id === deleteConfirmId) {
        setDrawerApp(null);
      }
      setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirmId));
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["applications-stats"] });
    },
    onError: () => toast.error("Failed to delete application"),
  });

  const bulkMut = useMutation({
    mutationFn: (payload: { action: string; application_ids: string[]; status?: string }) =>
      applicationsApi.bulk(payload),
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "Bulk action completed");
      setSelectedIds([]);
      setIsBulkDeleting(false);
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["applications-stats"] });
    },
    onError: () => toast.error("Bulk action failed"),
  });

  const triggerBotMut = useMutation({
    mutationFn: (id: string) => agentApi.applyOne(id),
    onSuccess: () => toast.success("Automated application triggered!"),
  });

  // Manual refresh handler
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsManualRefreshing(true);
    try {
      await Promise.all([refetch(), qc.invalidateQueries({ queryKey: ["applications-stats"] })]);
      toast.success("Applications refreshed");
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Export CSV handler
  const handleExport = async (scope: "current_page" | "matching" | "all" | "selected") => {
    setIsExporting(true);
    setIsExportMenuOpen(false);
    try {
      const params: Record<string, unknown> = { scope };
      if (scope === "current_page") {
        params.page = page;
        params.page_size = pageSize;
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter) params.status = statusFilter;
        if (sortBy) params.sort_by = sortBy;
      } else if (scope === "matching") {
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter) params.status = statusFilter;
        if (sortBy) params.sort_by = sortBy;
      } else if (scope === "selected") {
        if (selectedIds.length === 0) {
          toast.error("No applications selected for export");
          setIsExporting(false);
          return;
        }
        params.application_ids = selectedIds.join(",");
      }

      const res = await applicationsApi.exportCsv(params);
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute("download", `applivo-applications-${today}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV export downloaded successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // Drawer open handler
  const openDrawer = (app: Application) => {
    setDrawerApp(app);
    setDrawerForm({
      status: app.status || "queued",
      recruiter_name: app.recruiter_name || "",
      recruiter_email: app.recruiter_email || "",
      interview_date: app.interview_date ? new Date(app.interview_date).toISOString().slice(0, 16) : "",
      offer_salary: app.offer_salary ? String(app.offer_salary) : "",
      notes: app.notes || "",
    });
  };

  const handleSaveDrawer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerApp) return;
    updateStatusMut.mutate({
      id: drawerApp.id,
      payload: {
        status: drawerForm.status,
        recruiter_name: drawerForm.recruiter_name || null,
        recruiter_email: drawerForm.recruiter_email || null,
        interview_date: drawerForm.interview_date ? new Date(drawerForm.interview_date).toISOString() : null,
        offer_salary: drawerForm.offer_salary ? parseInt(drawerForm.offer_salary) : null,
        notes: drawerForm.notes || null,
      },
    });
  };

  // Group applications for Kanban
  const groupedApps = useMemo(() => {
    const map: Record<string, Application[]> = {};
    KANBAN_COLUMNS.forEach((c) => {
      map[c.id] = [];
    });
    data?.items?.forEach((app: Application) => {
      const s = (app.status || "").toLowerCase();
      if (s === "failed" || s === "skipped") {
        map["failed"]?.push(app);
      } else if (map[s]) {
        map[s].push(app);
      } else if (s === "interview_scheduled" || s === "interview_completed") {
        map["interview"]?.push(app);
      } else if (s.startsWith("offer")) {
        map["offer"]?.push(app);
      } else {
        map["queued"]?.push(app);
      }
    });
    return map;
  }, [data?.items]);

  // Selection helpers
  const allCurrentPageSelected = useMemo(() => {
    if (!data?.items?.length) return false;
    return data.items.every((a: Application) => selectedIds.includes(a.id));
  }, [data?.items, selectedIds]);

  const toggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const pageIds = new Set(data?.items?.map((a: Application) => a.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const newIds = new Set(selectedIds);
      data?.items?.forEach((a: Application) => newIds.add(a.id));
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Active filter tracking (no star filter!)
  const isFiltered = !!(debouncedSearch || statusFilter || sortBy !== "newest");
  const activeFilterCount =
    (debouncedSearch ? 1 : 0) + (statusFilter ? 1 : 0) + (sortBy !== "newest" ? 1 : 0);

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("");
    setSortBy("newest");
    setPage(1);
  };

  // Summary strip status pills configuration (stable counts from backend)
  const summaryPills = [
    { id: "", label: "Total", count: stats?.total ?? 0 },
    { id: "queued", label: "Queued", count: stats?.queued ?? 0 },
    { id: "applying", label: "Applying", count: stats?.applying ?? 0 },
    { id: "applied", label: "Applied", count: stats?.applied ?? 0 },
    { id: "interview", label: "Interview", count: stats?.interviews ?? 0 },
    { id: "offer", label: "Offers", count: stats?.offers ?? 0 },
    { id: "failed", label: "Failed / Skipped", count: (stats?.failed ?? 0) + (stats?.skipped ?? 0) },
  ];

  return (
    <div className="dash-page relative w-full min-w-0 !gap-3">
      {/* ── 1. Page Header (Jobs Page style, strictly aligned) ──────── */}
      <div className="flex justify-end">
        {/* Left: Icon, Title, Count Badge, Subtitle */}
        {/* Right: Export, Refresh, View Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              disabled={isExporting}
              className="h-8 px-2.5 bg-[var(--app-card)] hover:bg-[var(--sx-bg-202022)] text-zinc-300 hover:text-white rounded-md text-[12px] font-medium transition-colors border border-[var(--app-border-strong)] flex items-center gap-1.5 disabled:opacity-50"
              title="Export applications to CSV"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
              ) : (
                <Download className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-zinc-500 ml-0.5" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 py-1 bg-[var(--app-card)] border border-white/[0.1] rounded-lg shadow-2xl z-50 text-[12px]">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-white/[0.06]">
                  Export CSV
                </div>
                <button
                  onClick={() => handleExport("current_page")}
                  className="w-full text-left px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                >
                  <span>Current Page</span>
                  <span className="text-[11px] text-zinc-500">{data?.items?.length || 0} rows</span>
                </button>
                <button
                  onClick={() => handleExport("matching")}
                  className="w-full text-left px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                >
                  <span>Filtered Results</span>
                  <span className="text-[11px] text-zinc-500">{data?.total || 0} rows</span>
                </button>
                <button
                  onClick={() => handleExport("all")}
                  className="w-full text-left px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                >
                  <span>All Applications</span>
                  <span className="text-[11px] text-zinc-500">{stats?.total || data?.total || 0} rows</span>
                </button>
                {selectedIds.length > 0 && (
                  <button
                    onClick={() => handleExport("selected")}
                    className="w-full text-left px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center justify-between border-t border-white/[0.06]"
                  >
                    <span>Selected Applications</span>
                    <span className="text-[11px] text-zinc-400 font-medium">{selectedIds.length} rows</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-2.5 bg-[var(--app-card)] hover:bg-[var(--sx-bg-202022)] text-zinc-300 hover:text-white rounded-md text-[12px] font-medium transition-colors border border-[var(--app-border-strong)] flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isRefreshing ? "Refreshing..." : "Refresh"}
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-zinc-400", isRefreshing && "animate-spin text-zinc-200")} />
            <span className="hidden sm:inline">{isRefreshing ? "Refreshing…" : "Refresh"}</span>
          </button>

          {/* Table / Kanban Switcher */}
          <div className="h-8 p-0.5 bg-[var(--app-card)] rounded-md border border-[var(--app-border-strong)] flex items-center">
            <button
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
              className={cn(
                "h-7 px-2.5 flex items-center gap-1.5 rounded text-[12px] font-medium transition-colors",
                view === "table" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => setView("kanban")}
              aria-pressed={view === "kanban"}
              className={cn(
                "h-7 px-2.5 flex items-center gap-1.5 rounded text-[12px] font-medium transition-colors",
                view === "kanban" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Compact Status Summary Strip ───────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[12px]">
        {summaryPills.map((pill) => {
          const isActive = statusFilter === pill.id;
          return (
            <button
              key={pill.id || "all"}
              onClick={() => {
                setStatusFilter(isActive ? "" : pill.id);
                setPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded-md border flex items-center gap-1.5 shrink-0 transition-colors",
                isActive
                  ? "bg-zinc-800 border-zinc-600 text-white font-medium"
                  : "bg-[var(--app-card)] hover:bg-[var(--sx-bg-202022)] border-[var(--app-border-strong)] text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span>{pill.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded text-[10px] font-mono",
                  isActive ? "bg-white/10 text-white" : "bg-white/[0.04] text-zinc-400"
                )}
              >
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 3. Search and Filter Toolbar (Clean, compact, no star!) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search role, company, recruiter..."
              className="w-full pl-9 pr-8 h-8 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md text-[13px] font-normal text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
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

          {/* Status Dropdown Filter (Synchronized with summary pills) */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 pl-3 pr-7 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md text-[12px] font-medium text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="" className="bg-[var(--sx-bg-181818)] text-white">All Statuses</option>
              <option value="pending_approval" className="bg-[var(--sx-bg-181818)] text-white">Pending Approval</option>
              <option value="queued" className="bg-[var(--sx-bg-181818)] text-white">Queued</option>
              <option value="applying" className="bg-[var(--sx-bg-181818)] text-white">Applying</option>
              <option value="applied" className="bg-[var(--sx-bg-181818)] text-white">Applied</option>
              <option value="interview" className="bg-[var(--sx-bg-181818)] text-white">Interview</option>
              <option value="offer" className="bg-[var(--sx-bg-181818)] text-white">Offers</option>
              <option value="rejected" className="bg-[var(--sx-bg-181818)] text-white">Rejected</option>
              <option value="failed" className="bg-[var(--sx-bg-181818)] text-white">Failed / Skipped</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Clear Filters (only shown when an actual filter is active) */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="h-8 px-2.5 flex items-center gap-1.5 rounded-md text-[12px] text-zinc-400 hover:text-white transition-colors border border-[var(--app-border-strong)] rounded-md bg-[var(--app-nested)] hover:bg-[var(--sx-bg-202022)]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear ({activeFilterCount})</span>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative self-start sm:self-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 pl-3 pr-7 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md text-[12px] font-medium text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer appearance-none"
          >
            <option value="newest" className="bg-[var(--sx-bg-181818)] text-white">Newest First</option>
            <option value="oldest" className="bg-[var(--sx-bg-181818)] text-white">Oldest First</option>
            <option value="updated" className="bg-[var(--sx-bg-181818)] text-white">Recently Updated</option>
            <option value="match_score" className="bg-[var(--sx-bg-181818)] text-white">Highest Match Score</option>
            <option value="applied_date" className="bg-[var(--sx-bg-181818)] text-white">Applied Date</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── 4. Bulk Action Bar (when rows are selected, no star!) ──── */}
      {selectedIds.length > 0 && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 text-white font-medium">
              {selectedIds.length} selected
            </span>
            <span className="text-[12px] text-zinc-400">Perform bulk operation on selected applications:</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Status Move */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  bulkMut.mutate({
                    action: "update_status",
                    application_ids: selectedIds,
                    status: e.target.value,
                  });
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="h-7 px-2 bg-[var(--app-nested)] hover:bg-[var(--sx-bg-202022)] border border-[var(--app-border-strong)] rounded text-[12px] text-zinc-200 focus:outline-none"
            >
              <option value="" disabled>
                Move Status...
              </option>
              <option value="queued">Queued</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Bulk Export */}
            <button
              onClick={() => handleExport("selected")}
              className="h-7 px-2.5 flex items-center gap-1 rounded bg-[var(--app-nested)] hover:bg-[var(--sx-bg-202022)] border border-[var(--app-border-strong)] text-[12px] text-zinc-200"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" /> Export CSV
            </button>

            {/* Bulk Delete */}
            <button
              onClick={() => setIsBulkDeleting(true)}
              className="h-7 px-2.5 flex items-center gap-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-[12px] text-rose-300"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="h-7 w-7 flex items-center justify-center rounded text-zinc-400 hover:text-white"
              title="Deselect all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── 5. Main Content Area: Kanban or Table ───────────────────── */}
      {isLoading ? (
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          <p className="text-[13px] text-zinc-400">Loading applications...</p>
        </div>
      ) : view === "kanban" ? (
        /* ── Kanban View (Deliberately contained, stable horizontal scroll) ── */
        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
            <div className="flex gap-3 min-w-max pb-1">
              {KANBAN_COLUMNS.map((col) => {
                const colApps = groupedApps[col.id] || [];
                const isOver = dragOverColumn === col.id;

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverColumn(col.id);
                    }}
                    onDragLeave={() => {
                      if (dragOverColumn === col.id) setDragOverColumn(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverColumn(null);
                      if (draggedAppId) {
                        updateStatusMut.mutate({ id: draggedAppId, payload: { status: col.id } });
                        setDraggedAppId(null);
                      }
                    }}
                    className={cn(
                      "w-[280px] shrink-0 bg-[var(--app-card)] border rounded-lg p-2.5 flex flex-col max-h-[76vh] transition-colors",
                      isOver ? "border-white/40 bg-white/[0.03]" : "border-[var(--app-border-strong)]"
                    )}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--app-border-strong)]/60 shrink-0">
                      <span className="text-[12px] font-medium text-zinc-300">{col.label}</span>
                      <span className="px-1.5 py-0.2 rounded text-[11px] font-mono bg-white/[0.04] text-zinc-400 border border-[var(--app-border-strong)]">
                        {colApps.length}
                      </span>
                    </div>

                    {/* Column Cards (No star icon!) */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin">
                      {colApps.map((app) => (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={() => setDraggedAppId(app.id)}
                          onDragEnd={() => setDraggedAppId(null)}
                          onClick={() => openDrawer(app)}
                          className="p-3 bg-[var(--app-nested)] hover:bg-[var(--sx-bg-202024)] border border-[var(--app-border-strong)] hover:border-white/20 rounded-md transition-all cursor-pointer relative group shadow-sm"
                        >
                          {/* Top Row: Match Score & Action Menu */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <div>
                              {app.match_score_at_apply ? (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {Math.round(app.match_score_at_apply)}% Match
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                  {getStatusLabel(app.status)}
                                </span>
                              )}
                            </div>

                            {/* Card menu */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuAppId((prev) => (prev === app.id ? null : app.id));
                                }}
                                className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-white rounded"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>

                              {activeMenuAppId === app.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 mt-1 w-40 py-1 bg-[var(--sx-bg-1c1c20)] border border-white/[0.1] rounded shadow-xl z-30 text-[11px]"
                                >
                                  <button
                                    onClick={() => {
                                      openDrawer(app);
                                      setActiveMenuAppId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-white/[0.05] text-zinc-200"
                                  >
                                    View Details
                                  </button>
                                  {app.job?.source_url && (
                                    <a
                                      href={app.job.source_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full text-left px-3 py-1.5 hover:bg-white/[0.05] text-zinc-200 flex items-center justify-between"
                                    >
                                      <span>Job URL</span>
                                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => {
                                      setDeleteConfirmId(app.id);
                                      setActiveMenuAppId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-rose-950/40 text-rose-400 border-t border-white/[0.06]"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Role & Company */}
                          <p
                            className="text-[13px] font-medium text-white leading-snug line-clamp-2 mb-0.5"
                            title={app.job_title_snapshot}
                          >
                            {app.job_title_snapshot || "Untitled Role"}
                          </p>
                          <p
                            className="text-[12px] text-zinc-400 truncate mb-2"
                            title={app.company_snapshot}
                          >
                            {app.company_snapshot || "—"}
                          </p>

                          {/* Bottom Row: Date & Action */}
                          <div className="flex items-center justify-between pt-2 border-t border-[var(--app-border-strong)]/40 text-[11px] text-zinc-500">
                            <span>{timeAgo(app.created_at)}</span>

                            {col.id === "pending_approval" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  approveMut.mutate(app.id);
                                }}
                                className="px-2 py-0.5 bg-white text-black font-semibold rounded text-[11px] hover:bg-zinc-200 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {col.id === "queued" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerBotMut.mutate(app.id);
                                }}
                                className="px-2 py-0.5 bg-zinc-800 text-zinc-200 border border-[var(--app-border-strong)] hover:bg-zinc-700 rounded text-[11px] flex items-center gap-1 transition-colors"
                                title="Force trigger automated apply"
                              >
                                <Play className="w-2.5 h-2.5" /> Apply
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {colApps.length === 0 && (
                        <div className="py-6 text-center border border-dashed border-[var(--app-border-strong)]/60 rounded-md">
                          <p className="text-[11px] text-zinc-500">No applications</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── Table View (Clean, compact, no star column!) ────────── */
        <div className="w-full min-w-0 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg overflow-hidden flex flex-col shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-[var(--app-border-strong)] bg-[var(--app-nested)] text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                  {/* 1. Selection Checkbox */}
                  <th className="w-10 px-3 py-2.5 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="text-zinc-400 hover:text-white"
                      title={allCurrentPageSelected ? "Deselect page" : "Select page"}
                    >
                      {allCurrentPageSelected ? (
                        <CheckSquare className="w-4 h-4 text-white" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-500" />
                      )}
                    </button>
                  </th>

                  {/* 2. Role & Company (Natural share of width) */}
                  <th className="px-4 py-2.5 min-w-[280px]">Role & Company</th>

                  {/* 3. Status */}
                  <th className="px-3 py-2.5 w-32">Status</th>

                  {/* 4. Match Score */}
                  <th className="px-3 py-2.5 w-24 text-center">Match</th>

                  {/* 5. Date Added */}
                  <th className="px-3 py-2.5 w-32">Date Added</th>

                  {/* 6. Recruiter */}
                  <th className="px-3 py-2.5 w-40">Recruiter</th>

                  {/* 7. Actions */}
                  <th className="px-4 py-2.5 w-24 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--app-border-strong)]/40 text-[13px]">
                {data?.items?.map((app: Application) => {
                  const isSelected = selectedIds.includes(app.id);

                  return (
                    <tr
                      key={app.id}
                      onClick={() => openDrawer(app)}
                      className={cn(
                        "hover:bg-white/[0.02] transition-colors cursor-pointer group",
                        isSelected && "bg-white/[0.03]"
                      )}
                    >
                      {/* Checkbox */}
                      <td
                        className="px-3 py-2.5 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectRow(app.id);
                        }}
                      >
                        <button className="text-zinc-500 hover:text-white">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-white" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-600" />
                          )}
                        </button>
                      </td>

                      {/* Role & Company */}
                      <td className="px-4 py-2.5">
                        <p
                          className="font-medium text-white hover:text-zinc-200 transition-colors truncate max-w-md"
                          title={app.job_title_snapshot}
                        >
                          {app.job_title_snapshot || "Untitled Role"}
                        </p>
                        <p className="text-[12px] text-zinc-400 truncate max-w-md" title={app.company_snapshot}>
                          {app.company_snapshot || "—"}
                        </p>
                      </td>

                      {/* Status Badge */}
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 text-[11px] font-medium rounded-full border",
                            getStatusClass(app.status)
                          )}
                        >
                          {getStatusLabel(app.status)}
                        </span>
                      </td>

                      {/* Match Score */}
                      <td className="px-3 py-2.5 text-center">
                        {app.match_score_at_apply ? (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            {Math.round(app.match_score_at_apply)}%
                          </span>
                        ) : (
                          <span className="text-zinc-600 font-mono text-[12px]">—</span>
                        )}
                      </td>

                      {/* Date Added */}
                      <td className="px-3 py-2.5 text-[12px] text-zinc-400 whitespace-nowrap">
                        {formatDate(app.created_at)}
                      </td>

                      {/* Recruiter */}
                      <td className="px-3 py-2.5 text-[12px] text-zinc-400 truncate max-w-[150px]">
                        {app.recruiter_name ? (
                          <span title={`${app.recruiter_name} ${app.recruiter_email ? `(${app.recruiter_email})` : ""}`}>
                            {app.recruiter_name}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-2.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status === "pending_approval" ? (
                            <button
                              onClick={() => approveMut.mutate(app.id)}
                              className="h-6 px-2.5 bg-white text-black text-[11px] font-semibold rounded hover:bg-zinc-200 transition-colors"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => openDrawer(app)}
                              className="h-6 px-2 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-[11px] font-medium rounded border border-[var(--app-border-strong)] transition-colors"
                            >
                              Details
                            </button>
                          )}

                          {app.job?.source_url && (
                            <a
                              href={app.job.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-6 w-6 flex items-center justify-center text-zinc-500 hover:text-white rounded hover:bg-white/[0.05]"
                              title="Open original job posting"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => setDeleteConfirmId(app.id)}
                            className="h-6 w-6 flex items-center justify-center text-zinc-500 hover:text-rose-400 rounded hover:bg-rose-950/20"
                            title="Delete application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {data?.items?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <p className="text-[13px] text-zinc-400">
                        {isFiltered ? "No applications match the active filters." : "No applications found."}
                      </p>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-2 text-[12px] text-zinc-300 hover:text-white hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {data && (
            <div className="px-4 py-2.5 border-t border-[var(--app-border-strong)] bg-[var(--app-nested)] flex flex-wrap items-center justify-between gap-3 text-[12px] text-zinc-400">
              <div className="flex items-center gap-3">
                <span>
                  Showing {data.total > 0 ? (page - 1) * pageSize + 1 : 0}–
                  {Math.min(page * pageSize, data.total)} of {data.total} applications
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-500">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-6 px-1.5 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded text-[11px] text-zinc-300 focus:outline-none"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-7 px-2.5 bg-[var(--app-card)] hover:bg-[var(--sx-bg-202022)] border border-[var(--app-border-strong)] text-zinc-200 rounded text-[12px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-2 text-zinc-400">
                  Page {data.pages > 0 ? page : 0} of {data.pages || 0}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page >= data.pages}
                  className="h-7 px-2.5 bg-[var(--app-card)] hover:bg-[var(--sx-bg-202022)] border border-[var(--app-border-strong)] text-zinc-200 rounded text-[12px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 6. Application Details Slide-over Drawer (No star!) ────── */}
      {drawerApp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[var(--sx-bg-141416)] border-l border-[var(--app-border-strong)] h-full shadow-2xl flex flex-col p-6 overflow-y-auto text-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (No star button!) */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[var(--app-border-strong)]">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[11px] font-medium rounded-full border",
                      getStatusClass(drawerApp.status)
                    )}
                  >
                    {getStatusLabel(drawerApp.status)}
                  </span>
                  {drawerApp.match_score_at_apply ? (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {Math.round(drawerApp.match_score_at_apply)}% Match
                    </span>
                  ) : null}
                </div>
                <h2 className="text-[18px] font-semibold text-white tracking-tight leading-snug">
                  {drawerApp.job_title_snapshot || "Untitled Role"}
                </h2>
                <p className="text-[13px] text-zinc-400 mt-0.5">{drawerApp.company_snapshot || "—"}</p>
              </div>

              <button
                onClick={() => setDrawerApp(null)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--app-border-strong)] bg-[var(--app-card)] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form & Editable Details */}
            <form onSubmit={handleSaveDrawer} className="space-y-4 py-5 flex-1">
              {/* Status Selector */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                  Application Status
                </label>
                <select
                  value={drawerForm.status}
                  onChange={(e) => setDrawerForm({ ...drawerForm, status: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md text-[13px] text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="pending_approval" className="bg-[var(--sx-bg-181818)] text-white">Pending Approval</option>
                  <option value="queued" className="bg-[var(--sx-bg-181818)] text-white">Queued</option>
                  <option value="applying" className="bg-[var(--sx-bg-181818)] text-white">Applying</option>
                  <option value="applied" className="bg-[var(--sx-bg-181818)] text-white">Applied</option>
                  <option value="interview" className="bg-[var(--sx-bg-181818)] text-white">Interview</option>
                  <option value="offer" className="bg-[var(--sx-bg-181818)] text-white">Offer</option>
                  <option value="rejected" className="bg-[var(--sx-bg-181818)] text-white">Rejected</option>
                  <option value="failed" className="bg-[var(--sx-bg-181818)] text-white">Failed</option>
                  <option value="skipped" className="bg-[var(--sx-bg-181818)] text-white">Skipped</option>
                </select>
              </div>

              {/* Recruiter Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                    Recruiter Name
                  </label>
                  <input
                    type="text"
                    value={drawerForm.recruiter_name}
                    onChange={(e) => setDrawerForm({ ...drawerForm, recruiter_name: e.target.value })}
                    placeholder="e.g. Jane Smith"
                    className="w-full h-8 px-2.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md text-[13px] text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                    Recruiter Email
                  </label>
                  <input
                    type="email"
                    value={drawerForm.recruiter_email}
                    onChange={(e) => setDrawerForm({ ...drawerForm, recruiter_email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full h-8 px-2.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md text-[13px] text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Interview Date & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                    Interview Date
                  </label>
                  <input
                    type="datetime-local"
                    value={drawerForm.interview_date}
                    onChange={(e) => setDrawerForm({ ...drawerForm, interview_date: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md text-[12px] text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                    Offer Salary (Annual)
                  </label>
                  <input
                    type="number"
                    value={drawerForm.offer_salary}
                    onChange={(e) => setDrawerForm({ ...drawerForm, offer_salary: e.target.value })}
                    placeholder="e.g. 120000"
                    className="w-full h-8 px-2.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md text-[13px] text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-zinc-400 mb-1.5">
                  Private Notes & Feedback
                </label>
                <textarea
                  rows={4}
                  value={drawerForm.notes}
                  onChange={(e) => setDrawerForm({ ...drawerForm, notes: e.target.value })}
                  placeholder="Add notes about phone screening, questions asked, referrals..."
                  className="w-full p-2.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-md text-[13px] text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
                />
              </div>

              {/* Quick Links */}
              <div className="pt-2 flex items-center justify-between text-[12px]">
                {drawerApp.job?.source_url ? (
                  <a
                    href={drawerApp.job.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-300 hover:text-white hover:underline flex items-center gap-1"
                  >
                    <span>View original job posting</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span />
                )}

                <Link
                  href={`/applications/${drawerApp.id}`}
                  className="text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  <span>Full page details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[var(--app-border-strong)] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(drawerApp.id)}
                  className="h-8 px-3 rounded-md bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-[12px] text-rose-300 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDrawerApp(null)}
                    className="h-8 px-3 rounded-md bg-[var(--app-card)] hover:bg-zinc-800 border border-[var(--app-border-strong)] text-[12px] text-zinc-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateStatusMut.isPending}
                    className="h-8 px-4 rounded-md bg-white hover:bg-zinc-200 text-black font-semibold text-[12px] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {updateStatusMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. Single Delete Confirmation Dialog ───────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-[16px] font-semibold text-white mb-2">Delete Application</h3>
            <p className="text-[13px] text-zinc-400 mb-5">
              Are you sure you want to delete this application record? This action will remove the application history
              and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="h-8 px-3.5 rounded-md bg-[var(--sx-bg-242428)] hover:bg-[var(--sx-bg-2c2c32)] text-zinc-300 text-[12px] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMut.mutate(deleteConfirmId)}
                disabled={deleteMut.isPending}
                className="h-8 px-3.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-50"
              >
                {deleteMut.isPending ? "Deleting..." : "Delete Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. Bulk Delete Confirmation Dialog ─────────────────────── */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-[16px] font-semibold text-white mb-2">Delete Selected Applications</h3>
            <p className="text-[13px] text-zinc-400 mb-5">
              Are you sure you want to delete <span className="text-white font-medium">{selectedIds.length}</span>{" "}
              selected applications? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsBulkDeleting(false)}
                className="h-8 px-3.5 rounded-md bg-[var(--sx-bg-242428)] hover:bg-[var(--sx-bg-2c2c32)] text-zinc-300 text-[12px] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => bulkMut.mutate({ action: "delete", application_ids: selectedIds })}
                disabled={bulkMut.isPending}
                className="h-8 px-3.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-50"
              >
                {bulkMut.isPending ? "Deleting..." : `Delete ${selectedIds.length} Applications`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
