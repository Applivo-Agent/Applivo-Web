"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi, agentApi } from "@/lib/api";
import { cn, getStatusClass, getStatusLabel, timeAgo, formatDate } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Search, Filter, LayoutGrid, List, SlidersHorizontal, Check, Star, RefreshCw, ChevronRight, AlertCircle, Play, Loader2, Layers } from "lucide-react";
import { ApplivoLoader } from "@/components/applivo-loader";

const KANBAN_COLUMNS = [
  { id: "pending_approval", label: "Pending" },
  { id: "queued", label: "Queued" },
  { id: "applying", label: "Applying" },
  { id: "applied", label: "Applied" },
];

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [filters, setFilters] = useState({ status: "", is_starred: undefined as boolean | undefined });
  const [page, setPage] = useState(1);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["applications", filters, page, view === "kanban" ? 100 : 20], // Load more for kanban
    queryFn: () => applicationsApi.list({ ...filters, page, page_size: view === "kanban" ? 100 : 20 }).then((r) => r.data),
  });

  const { data: stats } = useQuery({ queryKey: ["applications-stats"], queryFn: () => applicationsApi.stats().then((r) => r.data) });
  const { data: queue } = useQuery({ queryKey: ["queue-status"], queryFn: () => applicationsApi.queueStatus().then((r) => r.data) });

  const approveMut = useMutation({
    mutationFn: (id: string) => applicationsApi.approve(id),
    onSuccess: () => { toast.success("Approved! Sent to apply queue."); qc.invalidateQueries({ queryKey: ["applications"] }); qc.invalidateQueries({ queryKey: ["queue-status"] }); },
  });

  const starMut = useMutation({
    mutationFn: (id: string) => applicationsApi.star(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });

  const triggerBot = useMutation({
    mutationFn: (id: string) => agentApi.applyOne(id),
    onSuccess: () => toast.success("Bot triggered manually! Check logs shortly."),
  });

  const isRefreshing = isManualRefreshing || isRefetching;

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsManualRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        qc.invalidateQueries({ queryKey: ["applications-stats"] }),
        qc.invalidateQueries({ queryKey: ["queue-status"] }),
      ]);
      toast.success("Applications data refreshed.");
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Group applications for Kanban
  const groupedApps = KANBAN_COLUMNS.reduce((acc, col) => {
    acc[col.id] = data?.items?.filter((app: any) => app.status?.toLowerCase() === col.id.toLowerCase()) ?? [];
    return acc;
  }, {} as Record<string, any[]>);

  const pendingApps = data?.items?.filter((a: any) => a.status?.toLowerCase() === "pending_approval") ?? [];

  return (
    <div className="dash-page space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">Applications Flow</h1>
            <p className="text-[14px] text-zinc-400 mt-1">{data?.total ?? 0} total applications tracked across your automated career growth journey.</p>
            {isRefreshing && (
              <p className="mt-1 text-[12px] font-medium text-zinc-300 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Refreshing latest application activity...
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-8 items-center gap-2 px-3 bg-[#171717] hover:bg-[var(--app-card)] text-white rounded-md text-[13px] font-medium transition-colors border border-[var(--app-border-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
            title={isRefreshing ? "Refreshing..." : "Refresh"}
          >
            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin text-zinc-300" /> : <RefreshCw className="w-4 h-4 text-zinc-400" />}
            <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
          </button>
          <div className="flex h-8 p-0.5 bg-[#171717] rounded-lg border border-[var(--app-border-strong)] items-center">
            <button 
              onClick={() => setView("kanban")} 
              aria-pressed={view === "kanban"}
              className={cn(
                "h-7 px-3 flex items-center gap-1.5 rounded-md text-[13px] font-medium transition-colors", 
                view === "kanban" ? "bg-[var(--app-card)] text-white shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button 
              onClick={() => setView("table")} 
              aria-pressed={view === "table"}
              className={cn(
                "h-7 px-3 flex items-center gap-1.5 rounded-md text-[13px] font-medium transition-colors", 
                view === "table" ? "bg-[var(--app-card)] text-white shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>
        </div>
      </div>

      {pendingApps.length > 0 && filters.status === "" && (
        <div className="flex items-center gap-3 p-4 bg-zinc-700/10 border border-[var(--app-border-strong)]/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-zinc-400 shrink-0" />
          <div className="flex-1">
            <p className="text-[14px] font-medium text-zinc-300">{pendingApps.length} applications pending approval</p>
          </div>
          <button onClick={() => pendingApps.forEach((a: any) => approveMut.mutate(a.id))}
            className="h-8 px-3.5 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-zinc-200 transition-colors">
            Approve All
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <ApplivoLoader variant="content" text="Loading Applications" />
        ) : view === "kanban" ? (
          <div className="h-full overflow-x-auto pb-8 -mx-2 px-2 scrollbar-none">
            <div className="flex gap-5 h-full min-w-max">
              {KANBAN_COLUMNS.map((col) => {
                const columnApps = groupedApps[col.id] || [];
                return (
                  <div key={col.id} className="w-80 flex flex-col bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-3.5 max-h-[72vh]">
                    <div className="px-3 py-2 mb-3 flex items-center justify-between shrink-0">
                      <span className="font-semibold text-[12px] tracking-wider text-zinc-300 uppercase">{col.label}</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-full text-zinc-300">{columnApps.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 px-0.5 pb-2 scrollbar-none">
                      {columnApps.map((app) => (
                        <motion.div 
                          key={app.id} 
                          whileHover={{ y: -2 }}
                          className="bg-[var(--app-nested)] p-4 rounded-lg border border-[var(--app-border-strong)] hover:border-white/20 relative group transition-all"
                        >
                          <button onClick={(e) => { e.stopPropagation(); starMut.mutate(app.id); }} className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-white transition-colors z-10 w-6 h-6 flex items-center justify-center">
                            <Star className={cn("w-3.5 h-3.5", app.is_starred ? "fill-zinc-300 text-zinc-300" : "")} />
                          </button>
                          <div className={cn("inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full mb-2.5 border", getStatusClass(col.id))}>{getStatusLabel(col.id)}</div>
                          <a 
                            href={app.job?.source_url || `/applications/${app.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block hover:opacity-80 transition-opacity"
                          >
                            <p className="font-semibold text-[14px] text-white leading-tight pr-6 tracking-tight mb-1">{app.job_title_snapshot}</p>
                            <p className="text-zinc-400 text-[12px] font-normal">{app.company_snapshot}</p>
                          </a>
                          
                          <div className="flex items-center justify-between mt-3 text-[11px] font-medium text-zinc-400">
                            <span>{timeAgo(app.created_at)}</span>
                            {app.match_score_at_apply && <span className="text-zinc-200 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">{Math.round(app.match_score_at_apply)}%</span>}
                          </div>

                          {col.id === "pending_approval" && (
                            <div className="mt-3 pt-3 border-t border-[var(--app-border-strong)] flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); approveMut.mutate(app.id); }} className="flex-1 h-8 px-3.5 bg-white text-black text-[12px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors">Approve</button>
                            </div>
                          )}
                          {col.id === "queued" && (
                            <div className="mt-3 pt-3 border-t border-[var(--app-border-strong)]">
                              <button onClick={(e) => { e.stopPropagation(); triggerBot.mutate(app.id); }} className="w-full h-8 px-3 flex items-center justify-center gap-2 bg-[#171717] text-white text-[12px] font-medium rounded-md hover:bg-[var(--app-card)] transition-colors border border-[var(--app-border-strong)]">
                                <Play className="w-3 h-3" /> Force Deploy
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {columnApps.length === 0 && (
                        <div className="h-20 flex items-center justify-center bg-[var(--app-nested)]/40 border border-dashed border-[var(--app-border-strong)] rounded-lg">
                          <p className="text-[12px] font-medium text-zinc-500">No applications</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-[var(--app-nested)] text-zinc-400 border-b border-[var(--app-border-strong)] sticky top-0 z-10 text-[12px] font-medium">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer w-10">⭐</th>
                    <th className="px-4 py-3">Role & Company</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Match</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Recruiter</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--app-border-strong)]/40 text-[13px]">
                  {data?.items?.map((app: any) => (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3">
                        <button onClick={() => starMut.mutate(app.id)} className="text-zinc-500 hover:text-white transition-colors">
                          <Star className={cn("w-3.5 h-3.5", app.is_starred ? "fill-zinc-300 text-zinc-300" : "")} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{app.job_title_snapshot}</p>
                        <p className="text-[12px] text-zinc-400">{app.company_snapshot}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2.5 py-0.5 text-[11px] font-medium rounded-full border", getStatusClass(app.status))}>{getStatusLabel(app.status)}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-300">{app.match_score_at_apply ? `${Math.round(app.match_score_at_apply)}%` : "—"}</td>
                      <td className="px-4 py-3 text-zinc-400 text-[12px]">{formatDate(app.created_at)}</td>
                      <td className="px-4 py-3 text-[12px] text-zinc-400">{app.recruiter_name ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {app.status?.toLowerCase() === "pending_approval" ? (
                          <button onClick={() => approveMut.mutate(app.id)} className="h-7 px-3 bg-white text-black text-[12px] font-semibold rounded-md hover:bg-zinc-200 transition-colors">Approve</button>
                        ) : (
                          <a 
                            href={app.job?.source_url || `/applications/${app.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-zinc-300 hover:text-white text-[12px] font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            View <ChevronRight className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data?.items?.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-400 text-[14px]">No applications found.</td></tr>}
                </tbody>
              </table>
            </div>
            {data && data.pages > 1 && (
              <div className="p-3 border-t border-[var(--app-border-strong)] flex items-center justify-center gap-2 shrink-0 bg-[var(--app-card)]">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-7 px-3 bg-[#171717] hover:bg-[var(--app-card)] border border-[var(--app-border-strong)] text-white rounded-md text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
                <span className="text-[12px] text-zinc-400 px-2">Page {page} of {data.pages}</span>
                <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="h-7 px-3 bg-[#171717] hover:bg-[var(--app-card)] border border-[var(--app-border-strong)] text-white rounded-md text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
