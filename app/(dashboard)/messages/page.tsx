"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Loader2,
  Search,
  ExternalLink,
  CheckCheck,
  ArrowLeft,
  X,
  AlertCircle,
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
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function renderMessageContent(text: string) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#EDEDED] underline decoration-[#525252] underline-offset-2 hover:decoration-[#EDEDED] transition-colors break-all"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
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
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [mobileDetailView, setMobileDetailView] = useState(false);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await messagesApi.list({ platform: "internshala" });
      const data = res.data;
      let rawList: Conversation[] = [];
      if (data && data.conversations) {
        rawList = data.conversations;
        if (data.stats) {
          setStats(data.stats);
        }
      } else if (Array.isArray(data)) {
        rawList = data;
        const unread = data.filter((c: any) => c.status === "unread").length;
        setStats({
          total_conversations: data.length,
          unread_count: unread,
          needs_attention_count: 0,
          last_synced_at: data[0]?.received_at || null,
        });
      }

      // Deduplicate by external_id or id
      const seen = new Set<string>();
      const dedupedList: Conversation[] = [];
      for (const conv of rawList) {
        const key = conv.external_id || conv.id;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        dedupedList.push(conv);
      }

      setConversations(dedupedList);
      if (!data?.stats) {
        setStats((prev) => ({
          ...prev,
          total_conversations: dedupedList.length,
          unread_count: dedupedList.filter((c) => c.status === "unread").length,
        }));
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

  // Auto-select first conversation on desktop if none selected
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
        toast.error("Applivo Chrome extension is not detected. Please install and enable the extension.");
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

  const syncStatusLabel = useMemo(() => {
    if (syncing) return "Syncing messages...";
    if (!stats.last_synced_at) return "Not synced yet";
    return `Last synced ${formatRelativeTime(stats.last_synced_at)}`;
  }, [syncing, stats.last_synced_at]);

  return (
    <div className="flex flex-col min-h-0 space-y-4">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262626]">
        <div>
          <h1 className="text-[22px] font-semibold text-[#EDEDED] tracking-tight leading-none">
            Messages
          </h1>
          <p className="text-[13px] text-[#929292] mt-1.5">
            Recruiter conversations and updates from your connected job platforms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#929292]">
            {syncStatusLabel}
          </span>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="h-7 px-3 bg-[#181818] hover:bg-[#202020] border border-[#262626] text-[#EDEDED] rounded text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3 h-3 text-[#929292] ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync messages"}</span>
          </button>
        </div>
      </div>

      {/* ── Error Banner (if sync or connection issue) ────────────────────── */}
      {syncError && (
        <div className="flex items-center justify-between gap-3 p-3 bg-[#151111] border border-[#332222] rounded text-[12px] text-[#D4A5A5]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-[#D4A5A5] shrink-0" />
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
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-0.5 bg-[#241717] hover:bg-[#2F1D1D] border border-[#3D2626] rounded text-[11px] font-medium text-[#EDEDED] transition-colors"
              >
                <span>Open Internshala</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
            <button
              onClick={() => setSyncError(null)}
              className="text-[#929292] hover:text-[#EDEDED] p-1"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Two-Column Inbox ────────────────────────────────────────────── */}
      <div className="bg-[#111111] border border-[#262626] rounded-lg overflow-hidden flex flex-1 h-[calc(100vh-200px)] min-h-[560px]">
        {/* Left Panel — Conversation List */}
        <div
          className={`${
            mobileDetailView ? "hidden md:flex" : "flex"
          } w-full md:w-[350px] lg:w-[360px] flex-col border-r border-[#262626] shrink-0 bg-[#111111]`}
        >
          {/* Search & Filters */}
          <div className="p-3 border-b border-[#262626] space-y-2.5 bg-[#111111]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#737373] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-7 bg-[#151515] border border-[#262626] rounded text-[12px] text-[#EDEDED] placeholder-[#737373] focus:outline-none focus:border-[#404040] transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#EDEDED]"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Simple Text Filters: All and Unread */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 text-[12px] font-medium rounded transition-colors ${
                  filter === "all"
                    ? "bg-[#1F1F1F] text-[#EDEDED]"
                    : "text-[#929292] hover:text-[#EDEDED]"
                }`}
              >
                All {conversations.length > 0 && <span className="ml-1 text-[11px] text-[#737373]">{conversations.length}</span>}
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-2.5 py-1 text-[12px] font-medium rounded transition-colors ${
                  filter === "unread"
                    ? "bg-[#1F1F1F] text-[#EDEDED]"
                    : "text-[#929292] hover:text-[#EDEDED]"
                }`}
              >
                Unread {stats.unread_count > 0 && <span className="ml-1 text-[11px] text-[#737373]">{stats.unread_count}</span>}
              </button>
            </div>
          </div>

          {/* Vertically Scrollable Real Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1C1C1C]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#737373]" />
                <p className="text-[12px] text-[#737373]">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center space-y-2.5">
                <p className="text-[13px] font-medium text-[#EDEDED]">
                  {conversations.length === 0 ? "No conversations yet" : "No matching conversations"}
                </p>
                <p className="text-[12px] text-[#737373] leading-relaxed">
                  {conversations.length === 0
                    ? "Connect your account and sync recruiter messages to get started."
                    : "Try adjusting your search query or switching filters."}
                </p>
                {conversations.length === 0 && (
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={handleSync}
                      disabled={syncing}
                      className="inline-flex items-center justify-center gap-1.5 h-7 px-3 bg-[#181818] hover:bg-[#202020] border border-[#262626] rounded text-[12px] font-medium text-[#EDEDED] transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 text-[#929292] ${syncing ? "animate-spin" : ""}`} />
                      <span>{syncing ? "Sync messages" : "Sync messages"}</span>
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
                    className={`w-full text-left px-3.5 py-3 transition-colors flex flex-col gap-1 border-l-2 ${
                      isSelected
                        ? "bg-[#1A1A1A] border-l-[#EDEDED]"
                        : isUnread
                        ? "bg-[#141414] hover:bg-[#181818] border-l-transparent"
                        : "bg-transparent hover:bg-[#161616] border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[13px] truncate ${
                          isUnread ? "font-semibold text-[#EDEDED]" : "font-normal text-[#B5B5B5]"
                        }`}
                      >
                        {conv.sender_name}
                      </span>
                      <span className="text-[11px] text-[#737373] shrink-0 font-normal">
                        {formatRelativeTime(conv.received_at)}
                      </span>
                    </div>

                    {(conv.company || conv.job_title) && (
                      <div className="text-[12px] text-[#929292] truncate">
                        {conv.job_title && conv.company
                          ? `${conv.job_title} · ${conv.company}`
                          : conv.company || conv.job_title}
                      </div>
                    )}

                    <p
                      className={`text-[12px] line-clamp-1 leading-normal ${
                        isUnread ? "text-[#D4D4D4]" : "text-[#737373]"
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

        {/* Right Panel — Conversation Reader */}
        <div
          className={`${
            mobileDetailView ? "flex" : "hidden md:flex"
          } flex-1 flex-col bg-[#0E0E0E] min-w-0`}
        >
          {selectedConversation ? (
            <>
              {/* Selected Conversation Header */}
              <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[#262626] flex items-center justify-between gap-3 bg-[#111111] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileDetailView(false)}
                    className="md:hidden p-1 rounded hover:bg-[#1A1A1A] text-[#929292] hover:text-[#EDEDED]"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-[#EDEDED] truncate">
                      {selectedConversation.sender_name}
                    </h2>
                    {(selectedConversation.company || selectedConversation.job_title) && (
                      <p className="text-[12px] text-[#929292] truncate mt-0.5">
                        {selectedConversation.job_title && selectedConversation.company
                          ? `${selectedConversation.job_title} · ${selectedConversation.company}`
                          : selectedConversation.company || selectedConversation.job_title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(selectedConversation)}
                    className="h-7 px-2.5 rounded bg-[#181818] hover:bg-[#202020] border border-[#262626] text-[12px] font-medium text-[#929292] hover:text-[#EDEDED] transition-colors inline-flex items-center gap-1.5"
                    title={selectedConversation.status === "unread" ? "Mark as read" : "Mark as unread"}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {selectedConversation.status === "unread" ? "Mark read" : "Mark unread"}
                    </span>
                  </button>

                  <a
                    href={
                      selectedConversation.url ||
                      `https://internshala.com/chat/${selectedConversation.external_id}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-7 px-2.5 rounded bg-[#181818] hover:bg-[#202020] border border-[#262626] text-[12px] font-medium text-[#EDEDED] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Open in source</span>
                    <ExternalLink className="w-3 h-3 text-[#929292]" />
                  </a>
                </div>
              </div>

              {/* Message History Chronological List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0E0E0E]">
                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((m, idx) => {
                    const isCandidate = m.sender === "candidate";

                    return (
                      <div
                        key={m.id || idx}
                        className={`flex flex-col ${isCandidate ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-md p-3.5 text-[13px] leading-relaxed border ${
                            isCandidate
                              ? "bg-[#181818] border-[#2B2B2B]"
                              : "bg-[#141414] border-[#222222]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1.5 text-[11px]">
                            <span className="font-medium text-[#EDEDED]">
                              {m.sender_name || (isCandidate ? "You" : selectedConversation.sender_name)}
                            </span>
                            {m.timestamp && (
                              <span className="text-[#737373] font-normal">
                                {formatRelativeTime(m.timestamp)}
                              </span>
                            )}
                          </div>
                          <div className="text-[#D4D4D4] whitespace-pre-wrap break-words leading-relaxed">
                            {renderMessageContent(m.text)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-[13px] text-[#737373]">
                      No message history available for this conversation.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Quiet Empty State when no conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <p className="text-[13px] text-[#737373]">Select a conversation to read messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}