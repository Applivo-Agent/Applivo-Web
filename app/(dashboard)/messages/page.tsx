"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  RefreshCw,
  Loader2,
  Star,
  Search,
  ExternalLink,
  CheckCheck,
  ArrowLeft,
  X,
  AlertCircle,
  Inbox,
  Clock,
  Sparkles,
} from "lucide-react";
import { messagesApi } from "@/lib/api";
import { useExtension } from "@/lib/extension";
import { toast } from "sonner";

interface MessageItem {
  id: string;
  sender: "recruiter" | "candidate";
  sender_name?: string;
  text: string;
  timestamp?: string | null;
}

interface Conversation {
  id: string;
  external_id: string;
  sender_name: string;
  sender: string;
  company?: string;
  job_title?: string;
  subject?: string;
  preview: string;
  content: string;
  url?: string;
  is_important: boolean;
  importance_keywords?: string | null;
  status: "unread" | "read";
  unread: boolean;
  received_at?: string | null;
  messages: MessageItem[];
  platform: string;
}

interface MessageStats {
  total_conversations: number;
  unread_count: number;
  needs_attention_count: number;
  last_synced_at?: string | null;
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Might be already a formatted time like "10:30 AM" or "Yesterday"
    return dateStr;
  }
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const extension = useExtension();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    total_conversations: 0,
    unread_count: 0,
    needs_attention_count: 0,
    last_synced_at: null,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "important">("all");
  const [search, setSearch] = useState("");
  const [mobileDetailView, setMobileDetailView] = useState(false);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await messagesApi.list({ platform: "internshala" });
      const data = res.data;
      if (data && data.conversations) {
        setConversations(data.conversations);
        if (data.stats) {
          setStats(data.stats);
        }
      } else if (Array.isArray(data)) {
        // Fallback for array response
        setConversations(data);
        const unread = data.filter((c: any) => c.status === "unread").length;
        const important = data.filter((c: any) => c.is_important).length;
        setStats({
          total_conversations: data.length,
          unread_count: unread,
          needs_attention_count: important,
          last_synced_at: data[0]?.received_at || null,
        });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load messages");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Selected conversation object
  const selectedConversation = useMemo(() => {
    if (!selectedId) return null;
    return conversations.find((c) => c.id === selectedId) || null;
  }, [conversations, selectedId]);

  // Auto-select first conversation on desktop if none selected and conversations exist
  useEffect(() => {
    if (!selectedId && conversations.length > 0 && typeof window !== "undefined" && window.innerWidth >= 768) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  // Handle message sync via extension
  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      if (extension.status === "not_installed") {
        setSyncError("extension_not_installed");
        toast.error("Applivo extension is not detected. Please install and enable the extension.");
        return;
      }
      if (extension.status === "disconnected" || extension.status === "expired") {
        setSyncError("extension_not_connected");
        toast.error("Please connect the Applivo extension in Settings before syncing.");
        return;
      }

      const res = await extension.syncMessages();
      if (!res.ok) {
        if (res.error === "internshala_tab_missing") {
          setSyncError("internshala_tab_missing");
          toast.error("No active Internshala tab found. Please open Internshala in Chrome.");
        } else if (res.error === "internshala_signed_out") {
          setSyncError("internshala_signed_out");
          toast.error("Your Internshala session is signed out. Please sign in to Internshala.");
        } else {
          setSyncError(res.error || "sync_failed");
          toast.error(res.message || "Failed to sync messages from Internshala.");
        }
        return;
      }

      setSyncError(null);
      const count = res.synced_count ?? res.count ?? 0;
      toast.success(count > 0 ? `Synced ${count} recruiter conversation(s)` : "Sync complete. No new messages found.");
      await loadData();
    } catch (err: any) {
      setSyncError("sync_error");
      toast.error(err?.message || "Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  // Toggle read/unread status
  const handleToggleStatus = async (conv: Conversation) => {
    const nextStatus = conv.status === "unread" ? "read" : "unread";
    try {
      await messagesApi.updateStatus(conv.id, nextStatus);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, status: nextStatus, unread: nextStatus === "unread" } : c))
      );
      setStats((prev) => ({
        ...prev,
        unread_count: Math.max(0, prev.unread_count + (nextStatus === "unread" ? 1 : -1)),
      }));
    } catch {
      toast.error("Failed to update message status");
    }
  };

  // Select a conversation and mark as read if unread
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedId(conv.id);
    setMobileDetailView(true);
    if (conv.status === "unread") {
      void messagesApi.updateStatus(conv.id, "read").catch(() => {});
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, status: "read", unread: false } : c))
      );
      setStats((prev) => ({
        ...prev,
        unread_count: Math.max(0, prev.unread_count - 1),
      }));
    }
  };

  // Filter and search
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (filter === "unread" && c.status !== "unread") return false;
      if (filter === "important" && !c.is_important) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchSender = (c.sender_name || "").toLowerCase().includes(q);
        const matchComp = (c.company || "").toLowerCase().includes(q);
        const matchJob = (c.job_title || "").toLowerCase().includes(q);
        const matchPreview = (c.preview || "").toLowerCase().includes(q);
        if (!matchSender && !matchComp && !matchJob && !matchPreview) return false;
      }
      return true;
    });
  }, [conversations, filter, search]);

  const lastSyncLabel = useMemo(() => {
    if (!stats.last_synced_at) return "Not synced yet";
    return `Last sync: ${formatRelativeTime(stats.last_synced_at)}`;
  }, [stats.last_synced_at]);

  return (
    <div className="dash-page flex flex-col min-h-0 space-y-4">
      {/* ── Compact Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[var(--app-border-strong)]">
        <div>
          <h1 className="text-[20px] leading-6 font-semibold tracking-tight text-white">Messages</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">Recruiter conversations and updates from Internshala.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[12px] text-zinc-400">
            <span
              className={`w-2 h-2 rounded-full ${
                syncing
                  ? "bg-amber-400 animate-pulse"
                  : stats.total_conversations > 0
                  ? "bg-emerald-400"
                  : "bg-zinc-500"
              }`}
            />
            <span>{syncing ? "Syncing..." : lastSyncLabel}</span>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex h-8 items-center gap-2 px-3.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync messages"}</span>
          </button>
        </div>
      </div>

      {/* ── Compact Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-3.5">
          <p className="text-[12px] font-medium text-zinc-400 mb-0.5">Conversations</p>
          <div className="text-[22px] leading-7 font-semibold tracking-tight text-white">
            {stats.total_conversations}
          </div>
        </div>
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-3.5">
          <p className="text-[12px] font-medium text-zinc-400 mb-0.5">Unread</p>
          <div className="text-[22px] leading-7 font-semibold tracking-tight text-white">
            {stats.unread_count}
          </div>
        </div>
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-3.5">
          <p className="text-[12px] font-medium text-zinc-400 mb-0.5">Needs attention</p>
          <div className="text-[22px] leading-7 font-semibold tracking-tight text-white">
            {stats.needs_attention_count}
          </div>
        </div>
      </div>

      {/* ── Error Banner (if sync or connection issue) ────────────────────── */}
      {syncError && (
        <div className="flex items-center justify-between gap-3 p-3 bg-red-950/30 border border-red-800/40 rounded-lg text-[13px] text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              {syncError === "internshala_tab_missing"
                ? "No active Internshala tab detected. Please open Internshala in your Chrome browser."
                : syncError === "internshala_signed_out"
                ? "Your Internshala session is expired or signed out. Please sign in to Internshala in Chrome."
                : syncError === "extension_not_installed"
                ? "Applivo Chrome extension is not detected. Please install or enable it in Chrome."
                : syncError === "extension_not_connected"
                ? "Applivo extension is not linked. Please connect the extension in Settings."
                : "Message sync failed. Check your connection and try again."}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(syncError === "internshala_tab_missing" || syncError === "internshala_signed_out") && (
              <a
                href="https://internshala.com/chat"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 bg-red-900/60 hover:bg-red-800/60 border border-red-700/50 rounded-md text-[12px] font-medium text-white transition-colors"
              >
                Open Internshala
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={() => setSyncError(null)}
              className="text-red-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Two-Pane Inbox ──────────────────────────────────────────────── */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg overflow-hidden flex flex-1 h-[calc(100vh-240px)] min-h-[520px]">
        {/* Left Pane — Conversation List */}
        <div
          className={`${
            mobileDetailView ? "hidden md:flex" : "flex"
          } w-full md:w-[340px] lg:w-[360px] flex-col border-r border-[var(--app-border-strong)] shrink-0 bg-[var(--app-card)]`}
        >
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-[var(--app-border-strong)] space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-7 bg-[#171717] border border-[var(--app-border-strong)] rounded-md text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setFilter("all")}
                className={`h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors border ${
                  filter === "all"
                    ? "bg-[var(--app-nested)] border-white/20 text-white"
                    : "bg-transparent border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                All ({conversations.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors border ${
                  filter === "unread"
                    ? "bg-[var(--app-nested)] border-white/20 text-white"
                    : "bg-transparent border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Unread ({stats.unread_count})
              </button>
              <button
                onClick={() => setFilter("important")}
                className={`h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors border ${
                  filter === "important"
                    ? "bg-[var(--app-nested)] border-white/20 text-white"
                    : "bg-transparent border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Important ({stats.needs_attention_count})
              </button>
            </div>
          </div>

          {/* Conversation List Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--app-border-strong)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                <p className="text-[12px] text-zinc-500">Loading inbox...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center mx-auto text-zinc-500">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">
                    {conversations.length === 0 ? "No conversations yet" : "No matching conversations"}
                  </p>
                  <p className="text-[12px] text-zinc-400 mt-1 leading-relaxed">
                    {conversations.length === 0
                      ? "Open Internshala and sync your recruiter messages to get started."
                      : "Try clearing your search or selecting a different filter."}
                  </p>
                </div>
                {conversations.length === 0 && (
                  <div className="pt-2 flex flex-col gap-2">
                    <a
                      href="https://internshala.com/chat"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 h-8 px-3 bg-[var(--app-nested)] hover:bg-[#252528] border border-[var(--app-border-strong)] rounded-md text-[12px] font-medium text-white transition-colors"
                    >
                      <span>Open Internshala</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                    <button
                      onClick={handleSync}
                      disabled={syncing}
                      className="inline-flex items-center justify-center gap-1.5 h-8 px-3 bg-white text-black hover:bg-zinc-200 rounded-md text-[12px] font-semibold transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
                      <span>{syncing ? "Syncing..." : "Sync messages now"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedId;
                const isUnread = conv.status === "unread";

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1 relative ${
                      isSelected
                        ? "bg-[var(--app-nested)] border-l-2 border-l-white"
                        : "hover:bg-[var(--app-nested)]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {conv.is_important && (
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                        <span
                          className={`text-[13px] truncate ${
                            isUnread ? "font-semibold text-white" : "font-medium text-zinc-300"
                          }`}
                        >
                          {conv.sender_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" title="Unread message" />
                        )}
                        <span className="text-[11px] text-zinc-500">
                          {formatRelativeTime(conv.received_at)}
                        </span>
                      </div>
                    </div>

                    {(conv.company || conv.job_title) && (
                      <div className="text-[11px] text-zinc-400 truncate">
                        {conv.job_title && conv.company
                          ? `${conv.job_title} • ${conv.company}`
                          : conv.company || conv.job_title}
                      </div>
                    )}

                    <p
                      className={`text-[12px] line-clamp-2 mt-0.5 leading-snug ${
                        isUnread ? "text-zinc-200" : "text-zinc-400"
                      }`}
                    >
                      {conv.preview || "No message preview"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane — Selected Conversation & Message History */}
        <div
          className={`${
            mobileDetailView ? "flex" : "hidden md:flex"
          } flex-1 flex-col bg-[var(--app-card)] min-w-0`}
        >
          {selectedConversation ? (
            <>
              {/* Selected Conversation Header */}
              <div className="p-3.5 sm:p-4 border-b border-[var(--app-border-strong)] flex items-center justify-between gap-3 bg-[var(--app-card)] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileDetailView(false)}
                    className="md:hidden p-1.5 rounded-md hover:bg-[var(--app-nested)] text-zinc-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-semibold text-white truncate max-w-[130px] sm:max-w-none">
                        {selectedConversation.sender_name}
                      </h2>
                      {selectedConversation.is_important && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/50">
                          <Star className="w-2.5 h-2.5 fill-amber-300" />
                          Important
                        </span>
                      )}
                    </div>
                    {(selectedConversation.company || selectedConversation.job_title) && (
                      <p className="text-[12px] text-zinc-400 truncate mt-0.5">
                        {selectedConversation.job_title && selectedConversation.company
                          ? `${selectedConversation.job_title} • ${selectedConversation.company}`
                          : selectedConversation.company || selectedConversation.job_title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(selectedConversation)}
                    className="h-7 px-2.5 rounded-md bg-[var(--app-nested)] hover:bg-[#252528] border border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
                    title={selectedConversation.status === "unread" ? "Mark as read" : "Mark as unread"}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {selectedConversation.status === "unread" ? "Mark read" : "Mark unread"}
                    </span>
                  </button>

                  <a
                    href={selectedConversation.url || `https://internshala.com/chat/${selectedConversation.external_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-7 px-2.5 rounded-md bg-white hover:bg-zinc-200 text-black text-[12px] font-semibold transition-colors inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>Open in Internshala</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Message Timeline */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[var(--app-card)]">
                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((m, idx) => {
                    const isCandidate = m.sender === "candidate";

                    return (
                      <div
                        key={m.id || idx}
                        className={`flex flex-col ${isCandidate ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3 text-[13px] leading-relaxed ${
                            isCandidate
                              ? "bg-[#27272a] border border-white/10 text-white rounded-tr-sm"
                              : "bg-[#1c1c1f] border border-[var(--app-border-strong)] text-zinc-200 rounded-tl-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px]">
                            <span className={isCandidate ? "text-zinc-300 font-medium" : "text-zinc-400 font-medium"}>
                              {m.sender_name || (isCandidate ? "You" : selectedConversation.sender_name)}
                            </span>
                            {m.timestamp && (
                              <span className="text-zinc-500 font-normal">
                                {formatRelativeTime(m.timestamp)}
                              </span>
                            )}
                          </div>
                          <div className="whitespace-pre-wrap break-words">{m.text}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-[13px] text-zinc-400">No message history available for this conversation.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Minimal Empty State when no conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center text-zinc-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="max-w-[320px]">
                <p className="text-[14px] font-medium text-white">
                  {conversations.length === 0 ? "No conversations yet" : "Select a conversation"}
                </p>
                <p className="text-[12px] text-zinc-400 mt-1 leading-relaxed">
                  {conversations.length === 0
                    ? "Recruiter messages from your active Internshala account will appear here in chronological order with message history."
                    : "Select a conversation from the left to view the message history."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}