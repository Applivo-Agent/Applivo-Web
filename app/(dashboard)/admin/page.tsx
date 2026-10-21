"use client";
import React, { useEffect, useState } from "react";
import {
  Users, Activity, Shield, BarChart3, Globe, Zap,
  AlertCircle, CheckCircle2, Settings, Database, DollarSign,
  Briefcase, TrendingUp, Server, Pause, Play, RotateCcw,
  Trash2, Search, Filter, MoreHorizontal, X, Check,
  ToggleLeft, FileText, History, Cpu, Loader2,
  Clock, Save, Settings2, Share2
} from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, ComposedChart, Cell, CartesianGrid, Legend, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { siGooglegemini } from "simple-icons";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LLMObservability } from "@/components/admin/llm-observability";
import { ApplivoLoader } from "@/components/applivo-loader";

type Tab = "dashboard" | "ai-metrics" | "users" | "subscriptions" | "payments" | "applications" | "jobs" | "bot" | "queue" | "errors" | "analytics" | "features" | "audit" | "settings";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  plan: string;
  created_at: string;
  last_login_at: string | null;
  applications_count: number;
  ai_credits_used: number;
  ai_credits_limit: number;
  total_tokens: number;
}

interface Subscription {
  id: string;
  user_email: string;
  plan: string;
  status: string;
  start_date: string;
  end_date: string | null;
  daily_limit: number;
}

interface Payment {
  id: string;
  user_email: string;
  amount: number;
  currency: string;
  status: string;
  plan?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  created_at: string;
}

interface BotStats {
  applications_today: number;
  success_rate: number;
  failed: number;
  queue_size: number;
  status: string;
}

interface QueueStats {
  pending: number;
  processing: number;
  applying: number;
  failed: number;
  total_jobs: number;
  total_scraped: number;
  scheduled_tasks: { id: string; name: string; next_run: string | null }[];
  scheduler_running: boolean;
  celery_workers: { name: string; status: string; active_tasks: number }[];
  celery_queues: Record<string, number>;
  celery_error?: string;
}

interface SystemHealth {
  status: string;
  timestamp: string;
  checks: Record<string, string>;
  celery_workers?: { name: string; status: string; active_tasks: number }[];
}

interface Stats {
  total_users: number;
  active_users: number;
  total_subscriptions: number;
  active_subscriptions: number;
  total_revenue: number;
  revenue_this_month: number;
  total_applications: number;
  applications_this_month: number;
  jobs_scraped: number;
}

interface Application {
  id: string;
  user_email: string;
  job_title: string;
  company: string;
  status: string;
  error: string | null;
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  source: string;
  status: string;
  scraped_at: string;
}

interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface AuditLog {
  id: string;
  admin_email: string;
  action: string;
  target: string;
  ip_address: string;
  result: string;
  created_at: string;
}

interface AnalyticsData {
  applications_by_day: { date: string; count: number }[];
  revenue_by_day: { date: string; amount: number }[];
  users_by_day: { date: string; count: number }[];
}

interface LLMProviderUsage {
  provider: string;
  model: string;
  requests: number;
  tokens_used: number;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  average_tokens: number;
  success_rate: number;
}

interface LLMTimelinePoint {
  date: string;
  total_requests: number;
  total_tokens: number;
  groq_requests: number;
  groq_tokens: number;
  gemini_requests: number;
  gemini_tokens: number;
  status_200: number;
  status_429: number;
  status_500: number;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  success_rate: number;
  total_errors: number;
}

interface LLMModelTimelinePoint {
  date: string;
  requests: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  errors: number;
}

interface LLMModelMetrics {
  model: string;
  provider: string;
  total_requests: number;
  total_tokens: number;
  success_rate: number;
  rate_limit: number;
  timeline: LLMModelTimelinePoint[];
}

interface LLMSystemOverview {
  avg_latency_ms: number;
  cache_hit_rate: number;
  tps: number;
  availability: number;
}

interface LLMFeatureMetric {
  feature: string;
  tokens: number;
  requests: number;
}

interface LLMUserUsage {
  user_email: string;
  total_tokens: number;
  requests: number;
}

interface LLMUsageData {
  total_requests: number;
  total_tokens: number;
  total_estimated_cost: number;
  providers: LLMProviderUsage[];
  timeline: LLMTimelinePoint[];
  models: LLMModelMetrics[];
  overview: LLMSystemOverview;
  features: LLMFeatureMetric[];
  top_users: LLMUserUsage[];
  error_distribution: Record<string, number>;
}

function KPIItem({ title, value, sub, icon }: { title: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-zinc-400">{title}</span>
        <div className="p-1.5 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-400">
          {icon}
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="text-[24px] leading-8 font-semibold text-white tracking-tight">{value}</div>
        {sub && <div className="text-[12px] text-zinc-500">{sub}</div>}
      </div>
    </div>
  );
}

function ChartContainer({ title, icon, children, rateLimit, subtitle }: { title: string; icon?: React.ReactNode; children: React.ReactNode; rateLimit?: number; subtitle?: string }) {
  return (
    <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 min-h-full">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight">{title}</h4>
        {icon || <div className="w-4 h-4 rounded-full border border-[var(--app-border-strong)] flex items-center justify-center text-[10px] text-zinc-400 font-medium">?</div>}
      </div>
      {subtitle && <p className="text-[13px] text-zinc-400 mb-4">{subtitle}</p>}
      <div className="h-[280px] w-full relative">
        {children}
      </div>
    </div>
  );
}

function DropdownItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] hover:bg-white/5 transition-all cursor-pointer min-w-[140px]">
      <span className="text-[11px] font-medium text-zinc-500">{label}</span>
      <span className="text-[13px] font-medium text-white">{value}</span>
      <MoreHorizontal className="w-3.5 h-3.5 text-zinc-500 ml-auto" />
    </div>
  );
}

function ProviderBadgeIcon({ provider }: { provider: string }) {
  if (provider === "groq") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill="none"
        aria-hidden="true"
        role="img"
        focusable="false"
      >
        <circle cx="12" cy="12" r="8.1" stroke="currentColor" strokeWidth="2.6" />
        <path d="M5.1 19.2L18.9 4.8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    );
  }

  const icon = siGooglegemini;
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="currentColor"
      aria-hidden="true"
      role="img"
      focusable="false"
    >
      <path d={icon.path} />
    </svg>
  );
}

const TABS = [
  { id: "dashboard" as Tab, label: "Dashboard", icon: BarChart3 },
  { id: "ai-metrics" as Tab, label: "AI Metrics", icon: Cpu },
  { id: "users" as Tab, label: "Users", icon: Users },
  { id: "subscriptions" as Tab, label: "Subscriptions", icon: Zap },
  { id: "payments" as Tab, label: "Payments", icon: DollarSign },
  { id: "applications" as Tab, label: "Applications", icon: FileText },
  { id: "jobs" as Tab, label: "Jobs", icon: Briefcase },
  { id: "bot" as Tab, label: "Bot Monitor", icon: Globe },
  { id: "queue" as Tab, label: "Queue", icon: Server },
  { id: "errors" as Tab, label: "Errors", icon: AlertCircle },
  { id: "analytics" as Tab, label: "Analytics", icon: TrendingUp },
  { id: "features" as Tab, label: "Feature Flags", icon: ToggleLeft },
  { id: "audit" as Tab, label: "Audit Logs", icon: History },
  { id: "settings" as Tab, label: "Settings", icon: Settings },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [botStats, setBotStats] = useState<BotStats | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [llmUsage, setLlmUsage] = useState<LLMUsageData | null>(null);
  const [failedJobs, setFailedJobs] = useState<any[]>([]);
  const [platformMessages, setPlatformMessages] = useState<any[]>([]);

  // Search/filter states
  const [userSearch, setUserSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tabError, setTabError] = useState<string | null>(null);

  // 1. General Tab Loading (runs on tab switch)
  useEffect(() => {
    if (!user || !user.is_superuser) return;
    if (activeTab !== "users") {
      loadTabData(activeTab);
    }
  }, [user, activeTab]);

  // 2. Specialized User Search (runs on search input with debounce)
  useEffect(() => {
    if (!user || !user.is_superuser || activeTab !== "users") return;

    const timeout = setTimeout(() => {
      loadTabData("users", userSearch);
    }, 500);

    return () => clearTimeout(timeout);
  }, [user, activeTab, userSearch]);

  // Safety timeout - reset loading after 10 seconds no matter what
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Admin: safety timeout - setting loading=false");
      setLoading(false);
    }, 10000);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  const loadTabData = async (tab: Tab, searchQuery: string = "") => {
    console.log("loadTabData called with tab:", tab, "current loading:", loading);
    setLoading(true);
    setTabError(null);
    try {
      console.log("Fetching data for tab:", tab);
      switch (tab) {
        case "dashboard": {
          // Parallel fetch for operational dashboard core metrics
          const [statsRes, healthRes, botRes, failedRes] = await Promise.all([
            api.get("/admin/stats"),
            api.get("/admin/system/health"),
            api.get("/admin/automation/status"),
            api.get("/admin/queue/failed").catch(() => ({ data: { failed_jobs: [] } }))
          ]);
          setStats(statsRes.data);
          setSystemHealth(healthRes.data);
          setBotStats(botRes.data);
          setFailedJobs(failedRes.data?.failed_jobs || []);

          // Non-blocking background fetch for queue status
          api.get("/admin/queue/status")
            .then((queueRes) => {
              if (queueRes?.data) setQueueStats(queueRes.data);
            })
            .catch((err) => {
              console.warn("Queue status fetch delayed/failed:", err);
            });
          break;
        }
        case "ai-metrics": {
          const llmRes = await api.get("/admin/llm-usage");
          setLlmUsage(llmRes.data);
          break;
        }
        case "users":
          const usersRes = await api.get(`/admin/users?page_size=50&search=${encodeURIComponent(searchQuery)}`);
          setUsers(usersRes.data || []);
          break;
        case "subscriptions":
          const subsRes = await api.get("/admin/subscriptions");
          setSubscriptions(subsRes.data || []);
          break;
        case "payments":
          const payRes = await api.get("/admin/payments?page_size=50");
          setPayments(Array.isArray(payRes.data) ? payRes.data : (payRes.data.items || []));
          break;
        case "applications":
          const appRes = await api.get("/admin/applications?page_size=50");
          setApplications(appRes.data.items || []);
          break;
        case "jobs":
          const jobsRes = await api.get("/admin/jobs?page_size=50");
          setJobs(jobsRes.data.items || []);
          break;
        case "bot": {
          const botRes = await api.get("/admin/automation/status");
          setBotStats(botRes.data);
          break;
        }
        case "queue": {
          try {
            const queueRes = await api.get("/admin/queue/status");
            setQueueStats(queueRes.data);
          } catch (e: any) {
            console.warn("Queue status unavailable:", e);
            setQueueStats({
              pending: 0,
              processing: 0,
              applying: 0,
              failed: 0,
              total_jobs: 0,
              total_scraped: 0,
              scheduled_tasks: [],
              scheduler_running: false,
              celery_workers: [],
              celery_queues: {},
              celery_error: e?.response?.data?.detail || "Queue service unavailable",
            });
          }
          break;
        }
        case "analytics":
          const analyticsRes = await api.get("/admin/analytics");
          setAnalyticsData(analyticsRes.data);
          break;
        case "features":
          const featuresRes = await api.get("/admin/features");
          setFeatureFlags(featuresRes.data || []);
          break;
        case "audit":
          const auditRes = await api.get("/admin/audit-logs?page_size=50");
          setAuditLogs(auditRes.data.items || []);
          break;
        case "settings":
          const healthRes = await api.get("/admin/system/health");
          setSystemHealth(healthRes.data);
          break;
      }
    } catch (err: any) {
      console.error("Failed to load:", err, err?.response?.data);
      const detail = err?.response?.data?.detail || err?.message || `Failed to load ${tab}`;
      setTabError(detail);
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: "suspend" | "reactivate" | "delete") => {
    setActionLoading(userId);
    try {
      if (action === "delete") {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        await api.delete(`/admin/users/${userId}`);
        toast.success("User deleted");
      } else if (action === "suspend") {
        await api.patch(`/admin/users/${userId}`, { is_active: false });
        toast.success("User suspended");
      } else if (action === "reactivate") {
        await api.patch(`/admin/users/${userId}`, { is_active: true });
        toast.success("User reactivated");
      }
      loadTabData("users");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const runSystemAction = async (action: string) => {
    setLoading(true);
    try {
      await api.post(`/admin/system/${action}`);
      toast.success(`${action} completed`);
      loadTabData("settings");
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.is_superuser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-white mx-auto mb-4" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You must be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  const hasTabData = (tab: Tab) => {
    switch (tab) {
      case "dashboard": return stats !== null || systemHealth !== null;
      case "ai-metrics": return llmUsage !== null;
      case "users": return users.length > 0;
      case "subscriptions": return subscriptions.length > 0;
      case "payments": return payments.length > 0;
      case "applications": return applications.length > 0;
      case "jobs": return jobs.length > 0;
      case "bot": return botStats !== null;
      case "queue": return queueStats !== null;
      case "errors": return true;
      case "analytics": return analyticsData !== null;
      case "features": return featureFlags.length > 0;
      case "audit": return auditLogs.length > 0;
      case "settings": return systemHealth !== null;
      default: return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">Admin Panel</h1>
        <p className="text-[14px] text-zinc-400 mt-1">System operations and infrastructure management</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1 bg-[#171717] border border-[var(--app-border-strong)] rounded-lg w-max max-w-full">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-[var(--app-card)] text-white shadow-sm border border-[var(--app-border-strong)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <ApplivoLoader variant="content" text="Loading Admin Panel" />
      ) : tabError && !hasTabData(activeTab) ? (
        <ApplivoLoader
          variant="content"
          error={tabError}
          onRetry={() => loadTabData(activeTab)}
        />
      ) : (
        <>
          {activeTab === "dashboard" && <DashboardTab stats={stats} botStats={botStats} queueStats={queueStats} health={systemHealth} failedJobs={failedJobs} onAction={runSystemAction} loading={loading} />}
          {activeTab === "ai-metrics" && <AIMetricsTab llmUsage={llmUsage} />}
          {activeTab === "users" && <UsersTab users={filteredUsers} search={userSearch} setSearch={setUserSearch} actionLoading={actionLoading} onAction={handleUserAction} />}
          {activeTab === "subscriptions" && <SubscriptionsTab subscriptions={subscriptions} />}
          {activeTab === "payments" && <PaymentsTab payments={payments} />}
          {activeTab === "applications" && <ApplicationsTab applications={applications} />}
          {activeTab === "jobs" && <JobsTab jobs={jobs} />}
          {activeTab === "bot" && <BotTab stats={botStats} />}
          {activeTab === "queue" && <QueueTab stats={queueStats} />}
          {activeTab === "errors" && <ErrorsTab failedJobs={failedJobs} setFailedJobs={setFailedJobs} loading={loading} />}
          {activeTab === "analytics" && <AnalyticsTab data={analyticsData} />}
          {activeTab === "features" && <FeaturesTab flags={featureFlags} />}
          {activeTab === "audit" && <AuditTab logs={auditLogs} />}
          {activeTab === "settings" && <SettingsTab health={systemHealth} onAction={runSystemAction} loading={loading} />}
        </>
      )}
    </div>
  );
}

function DashboardTab({ stats, botStats, queueStats, health, failedJobs, onAction, loading }: {
  stats: Stats | null;
  botStats: BotStats | null;
  queueStats: QueueStats | null;
  health: SystemHealth | null;
  failedJobs: any[];
  onAction: (a: string) => void;
  loading: boolean;
}) {
  const isBotRunning = botStats?.status === "running" || botStats?.status === "active";
  const isSchedulerRunning = queueStats?.scheduler_running;

  const healthItems = health?.checks ? Object.entries(health.checks).map(([name, status]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    status: status === "healthy" || status === "available" || status === "running",
    icon: name === "database" ? Database : name === "redis" ? Zap : name === "celery" ? Cpu : RotateCcw,
  })) : [
    { name: "Database", status: true, icon: Database },
    { name: "Redis", status: true, icon: Zap },
    { name: "Celery", status: false, icon: Cpu },
    { name: "APScheduler", status: isSchedulerRunning, icon: RotateCcw },
  ];

  const opsMetrics = [
    { label: "Applications Today", value: botStats?.applications_today || 0, sub: "Processing normally", icon: FileText, color: "text-white" },
    { label: "Success Rate", value: botStats?.success_rate ? `${botStats.success_rate}%` : "0%", sub: "Agent accuracy", icon: CheckCircle2, color: "text-white" },
    { label: "Failed Jobs", value: botStats?.failed || 0, sub: "Requires attention", icon: AlertCircle, color: "text-white" },
    { label: "Queue Size", value: botStats?.queue_size || 0, sub: "Pending tasks", icon: Server, color: "text-white" },
    { label: "Bot Status", value: isBotRunning ? "Running" : "Idle", sub: isBotRunning ? "Active session" : "Standby", icon: Globe, color: "text-white" },
  ];

  return (
    <div className="space-y-6">
      {/* CARD 1: SYSTEM HEALTH */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">System Health</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthItems.map((s) => (
            <div key={s.name} className="flex items-center gap-3.5 p-3 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)]">
              <div className="p-2 rounded-md bg-[var(--app-card)] text-zinc-400">
                <s.icon className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-zinc-400 truncate">{s.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[13px] font-medium text-zinc-200">
                    {s.status ? "Online" : "Offline"}
                  </span>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    s.status ? "bg-emerald-400" : "bg-rose-400"
                  )} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CARD 2: LIVE OPERATIONS */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Live Operations</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {opsMetrics.map((met) => (
            <div key={met.label} className="space-y-1">
              <div className="text-[24px] leading-8 font-semibold text-white tracking-tight">{met.value}</div>
              <div className="text-[12px] font-medium text-zinc-400">{met.label}</div>
              <div className="text-[11px] text-zinc-500">
                {met.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CARD 3: MANUAL CONTROLS */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Manual Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onAction('run-scraper')}
            className="flex items-center gap-3.5 p-4 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg hover:bg-white/[0.04] transition-colors group text-left"
          >
            <div className="p-2 rounded-md bg-[var(--app-card)] text-zinc-400 group-hover:text-white transition-colors">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[14px] font-medium text-white">Run Scraper</div>
              <div className="text-[12px] text-zinc-400">Initiate job discovery loop</div>
            </div>
          </button>

          <button
            onClick={() => onAction('clear-queue')}
            className="flex items-center gap-3.5 p-4 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg hover:bg-white/[0.04] transition-colors group text-left"
          >
            <div className="p-2 rounded-md bg-[var(--app-card)] text-zinc-400 group-hover:text-white transition-colors">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[14px] font-medium text-white">Clear Queue</div>
              <div className="text-[12px] text-zinc-400">Flush all pending tasks</div>
            </div>
          </button>

          <button
            onClick={() => onAction('restart-worker')}
            className="flex items-center gap-3.5 p-4 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg hover:bg-white/[0.04] transition-colors group text-left"
          >
            <div className="p-2 rounded-md bg-[var(--app-card)] text-zinc-400 group-hover:text-white transition-colors">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[14px] font-medium text-white">Restart Worker</div>
              <div className="text-[12px] text-zinc-400">Reload background process</div>
            </div>
          </button>
        </div>
      </div>

      {/* CARD 4: RECENT ERRORS */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Recent Errors</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-400">
                <th className="py-2.5 px-3 first:pl-0">Process</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Issue</th>
                <th className="py-2.5 px-3">Retries</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 last:pr-0 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border-strong)]/50">
              {failedJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-10 h-10 rounded-full bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                    </div>
                    <p className="text-[13px] font-medium text-white mb-1">Zero Failure Events</p>
                    <p className="text-[12px] text-zinc-400">System cluster fully synchronized. No intervention required.</p>
                  </td>
                </tr>
              ) : failedJobs.slice(0, 5).map((job) => (
                <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 first:pl-0">
                    <div className="text-[13px] font-medium text-white leading-snug">{job.job_title}</div>
                    <div className="text-[11px] text-zinc-500">Application Loop</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[13px] text-zinc-300">{job.company}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-medium text-zinc-300 bg-[var(--app-nested)] border border-[var(--app-border-strong)] px-2 py-0.5 rounded inline-block max-w-[300px] truncate leading-none">
                      {job.error || "Execution timeout"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[13px] text-zinc-400">{job.retry_count}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[12px] text-zinc-400">{new Date().toLocaleTimeString()}</div>
                  </td>
                  <td className="py-3 px-3 last:pr-0 text-right">
                    <button className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors" title="Retry">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 pt-3 border-t border-[var(--app-border-strong)] text-center">
            <button className="text-[12px] font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 mx-auto">
              View All Failure Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ users, search, setSearch, actionLoading, onAction }: {
  users: User[]; search: string; setSearch: (s: string) => void;
  actionLoading: string | null; onAction: (id: string, a: "suspend" | "reactivate" | "delete") => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight">User Management</h3>
            <span className="px-2 py-0.5 rounded bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-[11px] font-medium text-zinc-400">
              {users.length} Users
            </span>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text" placeholder="Search by name, email, or App ID..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full pl-9 pr-3 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-400">
                <th className="py-2.5 px-3 first:pl-0">User Identity</th>
                <th className="py-2.5 px-3">Access Level</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Usage</th>
                <th className="py-2.5 px-3">Consumption</th>
                <th className="py-2.5 px-3">Registered</th>
                <th className="py-2.5 px-3 last:pr-0 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border-strong)]/50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 first:pl-0">
                    <div className="font-medium text-white text-[13px]">{user.full_name || "System User"}</div>
                    <div className="text-[12px] text-zinc-400 tracking-tight">{user.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${user.is_superuser
                        ? 'bg-white text-black border-white'
                        : 'bg-[var(--app-nested)] text-zinc-300 border-[var(--app-border-strong)]'
                      }`}>
                      {user.is_superuser ? 'Admin' : 'User'}
                    </span>
                    <div className="text-[11px] text-zinc-500 mt-1 capitalize">
                      {user.plan || 'Free'}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-300">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                      {user.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[13px] font-medium text-white leading-none">{user.applications_count}</div>
                    <div className="text-[11px] text-zinc-500 mt-1">Apps</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white"
                            style={{ width: `${user.ai_credits_limit > 0 ? Math.min(100, (user.ai_credits_used / user.ai_credits_limit) * 100) : 0}%` }}
                          />
                        </div>
                        <div className="text-[11px] font-medium text-zinc-300 tabular-nums">
                          {user.ai_credits_used ?? 0}
                          <span className="text-zinc-600 mx-0.5">/</span>
                          {(user.ai_credits_limit ?? 0) > 0 ? user.ai_credits_limit : "-"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="text-[11px] text-zinc-500">Tokens:</div>
                        <div className="text-[11px] font-medium text-zinc-300">{((user.total_tokens || 0) / 1000).toFixed(1)}k</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[12px] text-zinc-400">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-3 last:pr-0 text-right">
                    <div className="flex justify-end gap-1">
                      {user.is_active ? (
                        <button onClick={() => onAction(user.id, 'suspend')} disabled={actionLoading === user.id} className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors" title="Suspend">
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button onClick={() => onAction(user.id, 'reactivate')} disabled={actionLoading === user.id} className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors" title="Reactivate">
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => onAction(user.id, 'delete')} disabled={actionLoading === user.id} className="p-1.5 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-white/5 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SubscriptionsTab({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight">Active Subscriptions</h3>
        <span className="px-2 py-0.5 rounded bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-[11px] font-medium text-zinc-400">
          {subscriptions.length} Plans
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-400">
              <th className="py-2.5 px-3 first:pl-0">User Reference</th>
              <th className="py-2.5 px-3">Service Plan</th>
              <th className="py-2.5 px-3">Operational Status</th>
              <th className="py-2.5 px-3">Throughput Limit</th>
              <th className="py-2.5 px-3">Start Date</th>
              <th className="py-2.5 px-3 last:pr-0">Expiry Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border-strong)]/50">
            {subscriptions.map(sub => (
              <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 first:pl-0 text-[13px] font-medium text-white">{sub.user_email}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${sub.plan === 'premium' ? 'bg-white text-black border-white' :
                      sub.plan === 'pro' ? 'bg-[var(--app-nested)] text-white border-[var(--app-border-strong)]' :
                        'bg-[var(--app-nested)] text-zinc-400 border-[var(--app-border-strong)]'
                    }`}>
                    {sub.plan}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-300 capitalize">
                    <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'active' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                    {sub.status}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="text-[13px] font-medium text-white">{sub.daily_limit}</div>
                  <div className="text-[11px] text-zinc-500">Requests/Day</div>
                </td>
                <td className="py-3 px-3 text-[12px] text-zinc-400">{new Date(sub.start_date).toLocaleDateString()}</td>
                <td className="py-3 px-3 last:pr-0 text-[12px] text-zinc-400">{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'Continuous'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab({ payments }: { payments: Payment[] }) {
  const [search, setSearch] = useState("");
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0
  }).format(amount / 100);

  const filteredPayments = payments.filter((payment) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [
      payment.user_email,
      payment.id,
      payment.plan || "",
      payment.status,
      payment.razorpay_payment_id || "",
      payment.razorpay_order_id || "",
    ].some((value) => String(value).toLowerCase().includes(query));
  });

  return (
    <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight">Payment History</h3>
          <span className="px-2 py-0.5 rounded bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-[11px] font-medium text-zinc-400">
            {payments.length} Payments
          </span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, transaction, status..."
          className="h-9 w-full max-w-sm rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] px-3 text-[13px] text-white placeholder-zinc-500 outline-none focus:border-white/30"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-400">
              <th className="py-2.5 px-3 first:pl-0">Transactional Identity</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Processing Result</th>
              <th className="py-2.5 px-3 last:pr-0 text-right">Settled Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border-strong)]/50">
            {filteredPayments.map(payment => (
              <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 first:pl-0">
                  <div className="text-[13px] font-medium text-white">{payment.user_email}</div>
                  <div className="text-[11px] text-zinc-500 leading-none mt-1">ID: {payment.razorpay_payment_id || payment.razorpay_order_id || payment.id}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="text-[13px] font-semibold text-white">{formatCurrency(payment.amount)}</div>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${['captured', 'success'].includes(payment.status.toLowerCase()) ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' :
                      payment.status.toLowerCase() === 'failed' ? 'bg-rose-950/60 text-rose-400 border-rose-800/40' :
                        'bg-[var(--app-nested)] text-zinc-400 border-[var(--app-border-strong)]'
                    }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="py-3 px-3 last:pr-0 text-right text-[12px] text-zinc-400">
                  {new Date(payment.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td className="py-10 px-4 text-center text-[13px] text-zinc-500" colSpan={4}>
                  No payment records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BotTab({ stats }: { stats: BotStats | null }) {
  if (!stats) return <div className="p-12 text-center text-zinc-500 font-medium">Establishing bot telemetry...</div>;

  const metrics = [
    { label: "Today's Volume", value: stats.applications_today, sub: "Total processed" },
    { label: "Execution Success", value: `${stats.success_rate}%`, sub: "Accuracy rating" },
    { label: "Failure Events", value: stats.failed, sub: "Requires review" },
    { label: "Backlog Size", value: stats.queue_size, sub: "In processing" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-1">
            <div className="text-[24px] leading-8 font-semibold text-white tracking-tight">{m.value}</div>
            <div className="text-[12px] font-medium text-zinc-400">{m.label}</div>
            <div className="text-[11px] text-zinc-500">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Bot System Status</h3>
        <div className="flex items-center justify-between p-3.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="text-[13px] font-medium text-white">Agent Online</div>
          </div>
          <div className="text-[12px] text-zinc-400">Connected to core cluster</div>
        </div>
      </div>
    </div>
  );
}

function QueueTab({ stats }: { stats: QueueStats | null }) {
  if (!stats) return <div className="p-12 text-center text-zinc-500 font-medium">Querying queue controller...</div>;

  const qMetrics = [
    { label: "Pending Tasks", val: stats.pending, icon: Clock },
    { label: "In Progress", val: stats.processing || 0, icon: Play },
    { label: "Failure Log", val: stats.failed, icon: AlertCircle },
    { label: "Operational Registry", val: stats.total_scraped || 0, icon: Save },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {qMetrics.map(m => (
          <div key={m.label} className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[12px] font-medium text-zinc-400">{m.label}</span>
              <m.icon className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-[24px] leading-8 font-semibold text-white tracking-tight">{m.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-400" /> Celery Cluster
          </h3>
          <div className="p-8 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center mx-auto mb-3">
              <Cpu className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-[13px] font-medium text-white mb-1">No Active Nodes Located</p>
            <p className="text-[12px] text-zinc-400 leading-relaxed">Establishing connection to decentralized worker cluster.</p>
          </div>
        </div>

        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 text-center flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-[12px] font-medium text-zinc-400 mb-2">APScheduler Controller</div>
          <div className="text-[24px] font-semibold text-zinc-400 mb-3">Stopped</div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
        </div>
      </div>
    </div>
  );
}

function ErrorsTab({ failedJobs, setFailedJobs, loading }: {
  failedJobs: any[];
  setFailedJobs: React.Dispatch<React.SetStateAction<any[]>>;
  loading: boolean;
}) {
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetry = async (appId: string) => {
    setRetryingId(appId);
    try {
      await api.post(`/admin/queue/retry/${appId}`);
      toast.success("Application queued for retry");
      setFailedJobs(prev => prev.filter(j => j.id !== appId));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Retry failed");
    } finally {
      setRetryingId(null);
    }
  };

  if (loading && failedJobs.length === 0) {
    return <ApplivoLoader variant="compact" text="Synchronizing failure registry" />;
  }

  return (
    <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
      <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Critical Failure Registry</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-400">
              <th className="py-2.5 px-3 first:pl-0">Bot Process</th>
              <th className="py-2.5 px-3">Entity</th>
              <th className="py-2.5 px-3">Failure Signature</th>
              <th className="py-2.5 px-3">Retries</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3 last:pr-0 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border-strong)]/50">
            {failedJobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                  </div>
                  <p className="text-[13px] font-medium text-white mb-1">Critical Registry Clear</p>
                  <p className="text-[12px] text-zinc-400 leading-relaxed">No high-intensity failure events detected in current operational cycle.</p>
                </td>
              </tr>
            ) : failedJobs.map(job => (
              <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 first:pl-0">
                  <div className="text-[13px] font-medium text-white">{job.job_title}</div>
                </td>
                <td className="py-3 px-3 text-[12px] text-zinc-400">{job.company}</td>
                <td className="py-3 px-3">
                  <span className="text-[11px] font-medium text-zinc-300 bg-[var(--app-nested)] border border-[var(--app-border-strong)] px-2 py-0.5 rounded inline-block max-w-[250px] truncate leading-none">
                    {job.error || 'Unknown Exception'}
                  </span>
                </td>
                <td className="py-3 px-3 text-[13px] text-zinc-400">{job.retry_count}</td>
                <td className="py-3 px-3 text-[12px] text-zinc-400">{job.updated_at ? new Date(job.updated_at).toLocaleDateString() : '-'}</td>
                <td className="py-3 px-3 last:pr-0 text-right">
                  <button
                    onClick={() => handleRetry(job.id)}
                    disabled={retryingId === job.id}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Retry"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${retryingId === job.id ? 'animate-spin' : ''}`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab({ health, onAction, loading }: { health: SystemHealth | null; onAction: (a: string) => void; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-5 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-zinc-400" /> Platform Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg">
            <div>
              <div className="text-[13px] font-medium text-white mb-0.5">Maintenance Mode</div>
              <div className="text-[12px] text-zinc-400">Temporarily disable public access</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-zinc-500">Disabled</span>
              <div className="w-9 h-5 rounded-full bg-zinc-800 border border-[var(--app-border-strong)] relative flex items-center px-1">
                <div className="w-3 h-3 rounded-full bg-zinc-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg">
            <div>
              <div className="text-[13px] font-medium text-white mb-0.5">Advanced Logging</div>
              <div className="text-[12px] text-zinc-400">Enable verbose telemetry stream</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-white">Enabled</span>
              <div className="w-9 h-5 rounded-full bg-white/20 border border-white/30 relative flex items-center justify-end px-1">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-5 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-zinc-400" /> External Integrations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg space-y-2">
            <div className="text-[13px] font-medium text-white">Razorpay Gateway</div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-400">Connected</span>
            </div>
            <div className="text-[11px] text-zinc-500">Live production environment</div>
          </div>

          <div className="p-4 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg space-y-2">
            <div className="text-[13px] font-medium text-white">OpenAI API</div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-400">Connected</span>
            </div>
            <div className="text-[11px] text-zinc-500">gpt-4o orchestration</div>
          </div>

          <div className="p-4 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg space-y-2 opacity-60">
            <div className="text-[13px] font-medium text-white">Stripe Sync</div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span className="text-[11px] font-medium text-zinc-400">Standby</span>
            </div>
            <div className="text-[11px] text-zinc-500">Awaiting credentials</div>
          </div>

          <div className="p-4 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg space-y-2 opacity-60">
            <div className="text-[13px] font-medium text-white">Redis Cluster</div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span className="text-[11px] font-medium text-zinc-400">Standby</span>
            </div>
            <div className="text-[11px] text-zinc-500">Caching layer pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationsTab({ applications }: { applications: Application[] }) {
  return (
    <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight">Application Registry</h3>
        <span className="px-2 py-0.5 rounded bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-[11px] font-medium text-zinc-400">
          {applications.length} Records
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-400">
              <th className="py-2.5 px-3 first:pl-0">Applicant Identity</th>
              <th className="py-2.5 px-3">Target Role</th>
              <th className="py-2.5 px-3">Organization</th>
              <th className="py-2.5 px-3 text-center">Outcome</th>
              <th className="py-2.5 px-3">Log</th>
              <th className="py-2.5 px-3 last:pr-0 text-right">Settled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border-strong)]/50">
            {applications.map(app => (
              <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 first:pl-0">
                  <div className="text-[13px] font-medium text-white leading-none">{app.user_email}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="text-[13px] font-medium text-zinc-200">{app.job_title}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="text-[12px] text-zinc-400">{app.company}</div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize border ${[
                      'success', 'applied', 'viewed', 'shortlisted',
                      'interview_scheduled', 'interview_completed',
                      'offer_received', 'offer_accepted'
                    ].includes(app.status.toLowerCase()) ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' :
                      ['failed', 'rejected'].includes(app.status.toLowerCase()) ? 'bg-rose-950/60 text-rose-400 border-rose-800/40' :
                        'bg-[var(--app-nested)] text-zinc-400 border-[var(--app-border-strong)]'
                    }`}>
                    {app.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="text-[11px] font-medium text-zinc-400 max-w-[200px] truncate bg-[var(--app-nested)] px-2 py-0.5 rounded border border-[var(--app-border-strong)]">
                    {app.error || '-'}
                  </div>
                </td>
                <td className="py-3 px-3 last:pr-0 text-right text-[12px] text-zinc-400">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JobsTab({ jobs }: { jobs: Job[] }) {
  return (
    <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
      <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Job Discovery Index</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-400">
              <th className="py-2.5 px-3 first:pl-0">Position Identity</th>
              <th className="py-2.5 px-3">Organization</th>
              <th className="py-2.5 px-3">Source Origin</th>
              <th className="py-2.5 px-3">Discovery Status</th>
              <th className="py-2.5 px-3 last:pr-0 text-right">Discovered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border-strong)]/50">
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 first:pl-0 text-[13px] font-medium text-white">{job.title}</td>
                <td className="py-3 px-3 text-[12px] text-zinc-400">{job.company}</td>
                <td className="py-3 px-3">
                  <span className="text-[11px] font-medium text-zinc-300 bg-[var(--app-nested)] px-2 py-0.5 rounded border border-[var(--app-border-strong)] uppercase">{job.source}</span>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize border ${job.status === 'active' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' : 'bg-[var(--app-nested)] text-zinc-400 border-[var(--app-border-strong)]'}`}>
                    {job.status}
                  </span>
                </td>
                <td className="py-3 px-3 last:pr-0 text-right text-[12px] text-zinc-400">
                  {new Date(job.scraped_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsTab({ data }: { data: AnalyticsData | null }) {
  if (!data) return <div className="p-12 text-center text-zinc-500 font-medium">Establishing analytics telemetry...</div>;

  const maxApp = Math.max(...data.applications_by_day.map(d => d.count), 1);
  const maxRev = Math.max(...data.revenue_by_day.map(d => d.amount), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-5">Applications (Last 7 Days)</h3>
        <div className="space-y-4">
          {data.applications_by_day.slice(-7).map(d => (
            <div key={d.date} className="flex items-center gap-3">
              <span className="text-[12px] text-zinc-400 w-24">{d.date}</span>
              <div className="flex-1 h-2 bg-[var(--app-nested)] rounded-full overflow-hidden border border-[var(--app-border-strong)]">
                <div className="h-full bg-white transition-all duration-500" style={{ width: `${(d.count / maxApp) * 100}%` }}></div>
              </div>
              <span className="text-[12px] font-medium text-white w-8 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-5">Revenue Stream (Last 7 Days)</h3>
        <div className="space-y-4">
          {data.revenue_by_day.slice(-7).map(d => (
            <div key={d.date} className="flex items-center gap-3">
              <span className="text-[12px] text-zinc-400 w-24">{d.date}</span>
              <div className="flex-1 h-2 bg-[var(--app-nested)] rounded-full overflow-hidden border border-[var(--app-border-strong)]">
                <div className="h-full bg-zinc-400 transition-all duration-500" style={{ width: `${(d.amount / maxRev) * 100}%` }}></div>
              </div>
              <span className="text-[12px] font-medium text-white w-16 text-right">₹{d.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturesTab({ flags }: { flags: FeatureFlag[] }) {
  const defaultFlags: FeatureFlag[] = [
    { key: "auto_apply", label: "Auto Apply", description: "Automatically apply to matching jobs", enabled: true },
    { key: "ai_chat", label: "AI Chat", description: "AI-powered chat support", enabled: true },
    { key: "payments", label: "Payments", description: "Enable payment system", enabled: true },
    { key: "scraper", label: "Scraper", description: "Enable job scraping", enabled: true },
    { key: "maintenance", label: "Maintenance Mode", description: "Show maintenance page to users", enabled: false },
  ];

  const displayFlags = flags.length > 0 ? flags : defaultFlags;

  return (
    <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
      <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-5">Infrastructure Control Flags</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayFlags.map(flag => (
          <div key={flag.key} className="bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[13px] font-medium text-white mb-0.5">{flag.label}</div>
                <div className="text-[12px] text-zinc-400">{flag.description}</div>
              </div>
              <div className={`w-2 h-2 rounded-full ${flag.enabled ? 'bg-emerald-400' : 'bg-zinc-600'}`}></div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-medium px-2 py-0.5 border rounded ${flag.enabled ? 'bg-white text-black border-white' : 'bg-[var(--app-card)] text-zinc-400 border-[var(--app-border-strong)]'
                }`}>
                {flag.enabled ? 'Operational' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditTab({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
      <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Infrastructure Audit Trail</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-400">
              <th className="py-2.5 px-3 first:pl-0">Operator</th>
              <th className="py-2.5 px-3">Action Event</th>
              <th className="py-2.5 px-3">Target Resource</th>
              <th className="py-2.5 px-3">Network Node</th>
              <th className="py-2.5 px-3 text-center">Result</th>
              <th className="py-2.5 px-3 last:pr-0 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border-strong)]/50">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center mx-auto mb-3">
                    <History className="w-4 h-4 text-zinc-400" />
                  </div>
                  <p className="text-[13px] font-medium text-white mb-1">Audit Registry Empty</p>
                  <p className="text-[12px] text-zinc-400 leading-relaxed">No administrative activity logged within the current settlement window.</p>
                </td>
              </tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 first:pl-0">
                  <div className="text-[13px] font-medium text-white leading-none">{log.admin_email}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="text-[12px] font-medium text-zinc-200">{log.action}</div>
                </td>
                <td className="py-3 px-3 text-[12px] text-zinc-400">{log.target}</td>
                <td className="py-3 px-3 text-[11px] font-mono text-zinc-400">{log.ip_address}</td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium border bg-[var(--app-nested)] text-zinc-300 border-[var(--app-border-strong)]">
                    {log.result}
                  </span>
                </td>
                <td className="py-3 px-3 last:pr-0 text-right text-[12px] text-zinc-400 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MessagesTab({ messages }: { messages: any[] }) {
  const importantMessages = messages.filter(m => m.is_important);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-1">
          <div className="text-[24px] leading-8 font-semibold text-white tracking-tight">{messages.length}</div>
          <div className="text-[12px] font-medium text-zinc-400">Message Volume</div>
          <div className="text-[11px] text-zinc-500">Total aggregated records</div>
        </div>
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-1">
          <div className="text-[24px] leading-8 font-semibold text-white tracking-tight">{importantMessages.length}</div>
          <div className="text-[12px] font-medium text-zinc-400">Critical Intensity</div>
          <div className="text-[11px] text-zinc-500">High priority events</div>
        </div>
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-1">
          <div className="text-[24px] leading-8 font-semibold text-white tracking-tight">
            {new Set(messages.map(m => m.platform)).size}
          </div>
          <div className="text-[12px] font-medium text-zinc-400">Source Channels</div>
          <div className="text-[11px] text-zinc-500">Active platform nodes</div>
        </div>
      </div>

      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Communication Telemetry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--app-border-strong)] text-[12px] font-medium text-zinc-400">
                <th className="py-2.5 px-3 first:pl-0">Network Hub</th>
                <th className="py-2.5 px-3">Origin Sender</th>
                <th className="py-2.5 px-3">Subject Vector</th>
                <th className="py-2.5 px-3">Priority Status</th>
                <th className="py-2.5 px-3 last:pr-0 text-right">Settled Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border-strong)]/50">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-10 h-10 rounded-full bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-4 h-4 text-zinc-400" />
                    </div>
                    <p className="text-[13px] font-medium text-white mb-1">Communication Log Empty</p>
                    <p className="text-[12px] text-zinc-400 leading-relaxed">Awaiting telemetry from external communication channels.</p>
                  </td>
                </tr>
              ) : messages.map(msg => (
                <tr key={msg.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 first:pl-0">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium border border-[var(--app-border-strong)] bg-[var(--app-nested)] text-zinc-400 uppercase">
                      {msg.platform}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[13px] font-medium text-white">{msg.sender || '-'}</td>
                  <td className="py-3 px-3 text-[12px] text-zinc-400 max-w-[200px] truncate">{msg.subject || '-'}</td>
                  <td className="py-3 px-3">
                    {msg.is_important ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 text-amber-400 border border-amber-800/40">Priority</span>
                    ) : (
                      <span className="text-[11px] text-zinc-500">Routine</span>
                    )}
                  </td>
                  <td className="py-3 px-3 last:pr-0 text-right text-[12px] text-zinc-400 whitespace-nowrap">
                    {msg.created_at ? new Date(msg.created_at).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function useQueryAI(range: string) {
  return useQuery({
    queryKey: ["admin-llm-usage-full", range],
    queryFn: async () => {
      const rangeMap: Record<string, string> = { "7d": "7d", "24h": "24h", "30d": "30d" };
      const res = await api.get(`/admin/llm-usage?range=${rangeMap[range] || "7d"}`);
      return res.data;
    },
    staleTime: 60_000,
  });
}

// AIMetricsTab embeds the full AI Observability page inline.
// It self-fetches with its own richer type so it doesn't depend on the
// parent's LLMUsageData shape.

interface AIFullUsage {
  total_requests: number; total_tokens: number;
  total_estimated_cost: number; today_cost: number; week_cost: number; month_cost: number;
  providers: { provider: string; model: string; requests: number; tokens_used: number; prompt_tokens: number; completion_tokens: number; cached_tokens: number; success_rate: number; cost: number; latency_p50: number; latency_p95: number; }[];
  timeline: { date: string; total_requests: number; total_tokens: number; prompt_tokens: number; completion_tokens: number; cached_tokens: number; success_rate: number; total_errors: number; cost: number; latency_avg: number; groq_requests: number; gemini_requests: number; openrouter_requests: number; status_429: number; status_500: number; }[];
  models: { model: string; provider: string; total_requests: number; total_tokens: number; success_rate: number; rate_limit: number; cost: number; latency_p50: number; latency_p95: number; cached_tokens: number; timeline: { date: string; requests: number; prompt_tokens: number; completion_tokens: number; total_tokens: number; errors: number; cost: number; latency: number; }[]; }[];
  overview: { avg_latency_ms: number; cache_hit_rate: number; tps: number; availability: number; p50_latency: number; p95_latency: number; p99_latency: number; rpm: number; peak_rpm: number; error_rate: number; };
  features: { feature: string; tokens: number; requests: number; cost: number; latency_avg: number; }[];
  top_users: { user_email: string; total_tokens: number; requests: number; cost: number; provider: string; last_active: string; }[];
  error_distribution: Record<string, number>;
  provider_credits: { provider: string; current_credit: number; spend_today: number; projected_burn: number; remaining_days: number; }[];
  routing: { preferred_provider: string; fallback_activations: number; provider_switches: number; failed_routes: number; success_rate: number; } | null;
}

const AI_PROVIDER_COLORS: Record<string, string> = { groq: "#8e8e93", gemini: "#a1a1aa", openrouter: "#e4e4e7", openai: "#e4e4e7", anthropic: "#71717a" };
const AI_MODEL_COLORS = ["#71717a","#e4e4e7","#a1a1aa","#e4e4e7","#8e8e93","#a1a1aa","#d4d4d8","#d4d4d8"];

function AIStatusBadge({ status }: { status: string }) {
  const c: Record<string, string> = { healthy: "text-zinc-300 bg-white/[0.06] border-[var(--app-border-strong)]", degraded: "text-zinc-300 bg-white/[0.06] border-[var(--app-border-strong)]", down: "text-zinc-300 bg-white/[0.06] border-[var(--app-border-strong)]" };
  return <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border", c[status] || c.down)}>{status}</span>;
}

function AISparkline({ data, color = "#fff" }: { data: number[]; color?: string }) {
  if (data.length < 2) return <div className="w-20 h-6" />;
  const max = Math.max(...data, 1), min = Math.min(...data, 0), range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 80},${24 - ((v - min) / range) * 24}`).join(" ");
  return (
    <svg width={80} height={24} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
      <circle cx={80} cy={24 - ((data[data.length - 1] - min) / range) * 24} r={2.5} fill={color} />
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AIMetricsTab({ llmUsage: _ignored }: { llmUsage: LLMUsageData | null }) {
  const [timeRange, setTimeRange] = useState("7d");
  const [activeSubTab, setActiveSubTab] = useState<"overview"|"trends"|"explore"|"models">("overview");
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  // Self-fetch with richer type
  const { data, isLoading, refetch } = useQueryAI(timeRange);
  const d = data as AIFullUsage | undefined;

  const fmtDate = (v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const fmt$ = (n: number | null | undefined, digits = 2) => (n == null || isNaN(n)) ? "--" : `$${n.toFixed(digits)}`;
  const fmtN = (n: number | null | undefined) => (n == null || isNaN(n)) ? "--" : n.toLocaleString();
  const fmtK = (n: number | null | undefined, digits = 1) => (n == null || isNaN(n)) ? "--" : `${(n / 1000).toFixed(digits)}K`;
  const fmtPct = (n: number | null | undefined, digits = 1) => (n == null || isNaN(n)) ? "--" : `${n.toFixed(digits)}%`;
  const fmtMs = (n: number | null | undefined) => (n == null || isNaN(n)) ? "--" : `${Math.round(n)}ms`;
  const fmtSec = (n: number | null | undefined) => (n == null || isNaN(n)) ? "--" : `${(n / 1000).toFixed(1)}s`;

  const timeline = (d?.timeline || []);
  const providers = d?.providers || [];
  const models = d?.models || [];
  const features = d?.features || [];
  const topUsers = d?.top_users || [];
  const routing = d?.routing || null;
  const overview = d?.overview;

  const totalTokens = d?.total_tokens || 0;
  const totalRequests = d?.total_requests || 0;
  const inputTokens = providers.reduce((s, p) => s + p.prompt_tokens, 0);
  const outputTokens = providers.reduce((s, p) => s + p.completion_tokens, 0);
  const cachedTokens = providers.reduce((s, p) => s + p.cached_tokens, 0);

  const sparkReq = timeline.map(t => t.total_requests);
  const sparkTok = timeline.map(t => t.total_tokens);
  const sparkCost = timeline.map(t => t.cost);
  const sparkLatency = timeline.map(t => t.latency_avg);

  const modelRows = [...models].sort((a, b) => b.total_tokens - a.total_tokens);
  const maxTok = Math.max(...modelRows.map(m => m.total_tokens), 1);

  const errorChartData = Object.entries(d?.error_distribution || {}).map(([code, count]) => ({
    code: code === "429" ? "Rate Limit" : code === "500" ? "Server Error" : code === "timeout" ? "Timeout" : `HTTP ${code}`,
    count,
    color: code === "429" ? "#8e8e93" : code === "500" ? "#a1a1aa" : "#e4e4e7",
  }));

  const tStyle = { backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", fontSize: 11 } as const;

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-10">

      {/* ── Cost & reliability: per-request ledger (free, no external service) ── */}
      <LLMObservability />

      {/* ── Sub-header: time range + sub-tabs ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-[16px] font-semibold text-white tracking-tight">Activity</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Real-time AI infrastructure telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#171717] border border-[var(--app-border-strong)] rounded-lg p-0.5">
            {(["24h","7d","30d"] as const).map(r => (
              <button key={r} onClick={() => setTimeRange(r)}
                className={cn("px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all",
                  timeRange === r ? "bg-white text-black" : "text-zinc-400 hover:text-white")}>
                {r === "24h" ? "Last 24h" : r === "7d" ? "7 Days" : "30 Days"}
              </button>
            ))}
          </div>
          <button onClick={() => refetch()} className="p-2 bg-[#171717] border border-[var(--app-border-strong)] rounded-lg text-zinc-400 hover:text-white transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="flex items-center gap-1 border-b border-[var(--app-border-strong)] mb-6">
        {([
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "trends",   label: "Trends",   icon: TrendingUp },
          { id: "explore",  label: "Explore",  icon: Globe },
          { id: "models",   label: "Models",   icon: Cpu },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
            className={cn("flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px",
              activeSubTab === tab.id ? "border-white text-white" : "border-transparent text-zinc-400 hover:text-zinc-200")}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeSubTab === "overview" && (
        <div className="space-y-5">

          {/* 4 stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total spend",    value: fmt$(d?.today_cost),                sub: `7d: ${fmt$(d?.week_cost)} · 30d: ${fmt$(d?.month_cost)}`,  data: sparkCost,    color: "#e4e4e7" },
              { label: "Requests",       value: fmtN(totalRequests),                sub: `RPM: ${fmtN(overview?.rpm)} · Peak: ${fmtN(overview?.peak_rpm)}`, data: sparkReq,     color: "#e4e4e7" },
              { label: "Token volume",   value: fmtK(totalTokens),                  sub: `In: ${fmtK(inputTokens, 0)} · Out: ${fmtK(outputTokens, 0)}`, data: sparkTok,     color: "#a1a1aa" },
              { label: "Cache hit rate", value: fmtPct(overview?.cache_hit_rate),   sub: `${fmtK(cachedTokens, 0)} cached`,                              data: timeline.map(t => t.cached_tokens), color: "#8e8e93" },
            ].map((card, i) => (
              <div key={card.label} className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 hover:border-zinc-700 transition-all">
                <p className="text-[11px] sm:text-[12px] font-medium text-zinc-400 mb-2">{card.label}</p>
                <p className="text-[24px] leading-8 font-semibold text-white tabular-nums tracking-tight">{card.value}</p>
                <div className="h-10 my-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={card.data.map((v, j) => ({ v, j }))} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <defs><linearGradient id={`ai-ov-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={card.color} stopOpacity={0.3}/><stop offset="100%" stopColor={card.color} stopOpacity={0}/></linearGradient></defs>
                      <Area type="monotone" dataKey="v" stroke={card.color} strokeWidth={1.5} fill={`url(#ai-ov-${i})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-zinc-500">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Provider cards + system stats */}
          {/* Provider cards + system stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              {(providers.length > 0 ? providers : [
                { provider: "openrouter", model: "", requests: 0, tokens_used: 0, prompt_tokens: 0, completion_tokens: 0, cached_tokens: 0, success_rate: 0, cost: 0, latency_p50: 0, latency_p95: 0 },
                { provider: "gemini",     model: "", requests: 0, tokens_used: 0, prompt_tokens: 0, completion_tokens: 0, cached_tokens: 0, success_rate: 0, cost: 0, latency_p50: 0, latency_p95: 0 },
                { provider: "groq",       model: "", requests: 0, tokens_used: 0, prompt_tokens: 0, completion_tokens: 0, cached_tokens: 0, success_rate: 0, cost: 0, latency_p50: 0, latency_p95: 0 },
              ]).slice(0, 3).map((p, i) => {
                const color = AI_PROVIDER_COLORS[p.provider] || "#71717a";
                const status = p.requests === 0 ? "down" : p.success_rate > 95 ? "healthy" : p.success_rate > 80 ? "degraded" : "down";
                const spark = timeline.map(t => (t[`${p.provider}_requests` as keyof typeof t] as number) || 0);
                return (
                  <div key={p.provider} className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-sm font-semibold text-white capitalize">{p.provider}</span>
                      </div>
                      <AIStatusBadge status={status} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
                      {[["Requests", fmtN(p.requests)], ["Success", fmtPct(p.success_rate)], ["Latency", fmtSec(p.latency_p50)], ["Cost", fmt$(p.cost)]].map(([l, v]) => (
                        <div key={l}><p className="text-xs text-zinc-400 mb-0.5">{l}</p><p className="text-sm font-bold text-white">{v}</p></div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div><p className="text-xs text-zinc-400 mb-0.5">Tokens</p><p className="text-sm font-semibold text-white">{fmtK(p.tokens_used)}</p></div>
                      <AISparkline data={spark} color={color} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 space-y-4">
              <p className="text-[14px] font-semibold text-white">System stats</p>
              {[
                { l: "Avg latency",      v: fmtMs(overview?.avg_latency_ms),  sub: `P50: ${fmtMs(overview?.p50_latency)} · P95: ${fmtMs(overview?.p95_latency)}` },
                { l: "Availability",     v: fmtPct(overview?.availability, 2), sub: "Provider uptime" },
                { l: "Est. monthly burn",v: fmt$(d ? d.month_cost * 4 : 0),   sub: "Projected cost" },
                { l: "Active users",     v: fmtN(topUsers.length),             sub: "Consuming AI" },
                ...(routing ? [{ l: "Fallback activations", v: fmtN(routing.fallback_activations), sub: `${routing.provider_switches} switches` }] : []),
              ].map(({ l, v, sub }) => (
                <div key={l} className="flex items-start justify-between gap-2 pb-4 border-b border-[var(--app-border-strong)] last:border-0 last:pb-0">
                  <div><p className="text-xs text-zinc-400 font-medium">{l}</p>{sub && <p className="text-[10px] text-zinc-500 mt-0.5">{sub}</p>}</div>
                  <p className="text-sm font-bold text-white tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
              <p className="text-[14px] font-semibold text-white mb-4">Spend over time</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                    <defs>{Object.entries(AI_PROVIDER_COLORS).map(([k, c]) => <linearGradient key={k} id={`ai-sp-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c} stopOpacity={0.25}/><stop offset="95%" stopColor={c} stopOpacity={0}/></linearGradient>)}</defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={fmtDate} />
                    <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={tStyle} formatter={(v: any) => [fmt$(Number(v)), ""]} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                    {Object.keys(AI_PROVIDER_COLORS).map(p => (
                      <Area key={p} type="monotone" dataKey={`${p}_cost`} name={p} stroke={AI_PROVIDER_COLORS[p]} strokeWidth={1.5} fill={`url(#ai-sp-${p})`} stackId="cost" dot={false} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[14px] font-semibold text-white">Token breakdown</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  {[["Input","#a1a1aa"],["Output","#e4e4e7"],["Cached","#e4e4e7"]].map(([l,c]) => (
                    <span key={l} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: c }} />{l}</span>
                  ))}
                </div>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeline} margin={{ top: 4, right: 0, left: -28, bottom: 0 }} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={fmtDate} />
                    <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? fmtK(v, 0) : v} />
                    <Tooltip contentStyle={tStyle} />
                    <Bar dataKey="prompt_tokens" name="Input" fill="#a1a1aa" fillOpacity={0.7} stackId="a" />
                    <Bar dataKey="completion_tokens" name="Output" fill="#e4e4e7" fillOpacity={0.7} stackId="a" />
                    <Bar dataKey="cached_tokens" name="Cached" fill="#e4e4e7" fillOpacity={0.7} radius={[3,3,0,0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top users + features */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--app-border-strong)]"><p className="text-[14px] font-semibold text-white">Top users</p><p className="text-xs text-zinc-400 mt-0.5">By token consumption</p></div>
              <table className="w-full">
                <thead><tr className="border-b border-[var(--app-border-strong)]">
                  {["#","User","Requests","Tokens","Cost","Provider"].map(h => <th key={h} className="px-5 py-3 text-left text-xs font-medium text-zinc-500">{h}</th>)}
                </tr></thead>
                <tbody>
                  {topUsers.length > 0 ? topUsers.slice(0, 8).map((u, i) => (
                    <tr key={u.user_email} className="border-b border-[var(--app-border-strong)] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-xs font-bold text-zinc-600">{i+1}</td>
                      <td className="px-5 py-3 text-sm font-medium text-white">{u.user_email}</td>
                      <td className="px-5 py-3 text-sm text-zinc-300 tabular-nums">{fmtN(u.requests)}</td>
                      <td className="px-5 py-3 text-sm text-zinc-300 tabular-nums">{fmtK(u.total_tokens)}</td>
                      <td className="px-5 py-3 text-sm text-zinc-300 tabular-nums">{fmt$(u.cost)}</td>
                      <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded-full border border-white/[0.08] text-zinc-400 capitalize">{u.provider || "--"}</span></td>
                    </tr>
                  )) : <tr><td colSpan={6} className="py-10 text-center text-sm text-zinc-500">No user data yet</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
              <p className="text-[14px] font-semibold text-white mb-1">Feature usage</p>
              <p className="text-xs text-zinc-400 mb-5">Token consumption by feature</p>
              {features.length > 0 ? (
                <div className="space-y-4">
                  {features.map((f, i) => {
                    const maxF = Math.max(...features.map(x => x.tokens), 1);
                    return (
                      <div key={f.feature}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-zinc-300 font-medium capitalize">{f.feature}</span>
                          <span className="text-xs text-zinc-500 tabular-nums">{fmtK(f.tokens)}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(f.tokens/maxF)*100}%`, background: AI_MODEL_COLORS[i % AI_MODEL_COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-600"><Zap className="w-7 h-7 mb-2" /><p className="text-sm text-zinc-500">No feature data yet</p></div>
              )}
            </div>
          </div>

          {/* Error charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
              <p className="text-[14px] font-semibold text-white mb-1">Error distribution</p>
              <p className="text-xs text-zinc-400 mb-4">By HTTP status code</p>
              <div className="h-44">
                {errorChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={errorChartData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="code" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tStyle} />
                      <Bar dataKey="count" radius={[4,4,0,0]} barSize={36}>
                        {errorChartData.map((e, idx) => <Cell key={idx} fill={e.color} fillOpacity={0.75} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-7 h-7 text-zinc-400" />
                    <p className="text-sm text-zinc-500">Zero errors detected</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
              <p className="text-[14px] font-semibold text-white mb-1">Error timeline</p>
              <p className="text-xs text-zinc-400 mb-4">Error frequency over time</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                    <defs><linearGradient id="ai-err" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.25}/><stop offset="95%" stopColor="#a1a1aa" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={fmtDate} />
                    <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tStyle} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                    <Area type="monotone" dataKey="total_errors" name="Errors" stroke="#a1a1aa" strokeWidth={1.5} fill="url(#ai-err)" dot={false} />
                    <Area type="monotone" dataKey="status_429" name="Rate Limits" stroke="#8e8e93" strokeWidth={1.5} fill="none" dot={false} />
                    <Area type="monotone" dataKey="status_500" name="Server Errors" stroke="#e4e4e7" strokeWidth={1.5} fill="none" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TRENDS ── */}
      {activeSubTab === "trends" && (
        <div className="space-y-5">
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
            <p className="text-[14px] font-semibold text-white mb-4">Request volume by model</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} margin={{ top: 4, right: 0, left: -28, bottom: 0 }} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={fmtDate} />
                  <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  {models.map((m, i) => <Bar key={m.model} dataKey={`model_${m.model}_requests`} name={m.model} fill={AI_MODEL_COLORS[i%AI_MODEL_COLORS.length]} fillOpacity={0.75} radius={[2,2,0,0]} stackId="req" />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.slice(0, 4).map((m, i) => (
              <div key={m.model} className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-4 flex items-center gap-4 hover:border-zinc-700 transition-all">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${AI_MODEL_COLORS[i%AI_MODEL_COLORS.length]}18` }}>
                  <Cpu className="w-4 h-4" style={{ color: AI_MODEL_COLORS[i%AI_MODEL_COLORS.length] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{m.model}</p>
                  <p className="text-xs text-zinc-500">by {m.provider}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-zinc-300 flex items-center gap-1"><TrendingUp className="w-3 h-3" />New</p>
                  <p className="text-xs text-zinc-500">{fmtN(m.total_requests)} req</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EXPLORE ── */}
      {activeSubTab === "explore" && (
        <div className="space-y-5">
          {/* Model table */}
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--app-border-strong)]">
              <p className="text-[14px] font-semibold text-white">Usage by model</p>
              <span className="text-xs text-zinc-400">{modelRows.length} models</span>
            </div>
            {/* mini bar */}
            <div className="px-5 py-4 border-b border-[var(--app-border-strong)]">
              <div className="flex items-end gap-1 h-14">
                {modelRows.slice(0,8).map((m,i) => {
                  const pct = (m.total_tokens / maxTok) * 100;
                  return <div key={m.model} className="flex-1 flex flex-col justify-end"><div className="rounded-t-sm" style={{ height:`${Math.max(pct,4)}%`, background: AI_MODEL_COLORS[i%AI_MODEL_COLORS.length] }} /></div>;
                })}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {modelRows.slice(0,5).map((m,i) => (
                  <span key={m.model} className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="w-2 h-2 rounded-full" style={{ background: AI_MODEL_COLORS[i%AI_MODEL_COLORS.length] }} />{m.model}
                  </span>
                ))}
              </div>
            </div>
            <table className="w-full">
              <thead><tr className="border-b border-[var(--app-border-strong)]">
                {["Model","Requests","Tokens","Success","% of Total"].map((h,i) => <th key={h} className={cn("px-5 py-3 text-xs font-medium text-zinc-500", i>0?"text-right":"text-left")}>{h}</th>)}
              </tr></thead>
              <tbody>
                {modelRows.length > 0 ? modelRows.map((m,i) => {
                  const pct = maxTok > 0 ? (m.total_tokens/maxTok)*100 : 0;
                  const color = AI_MODEL_COLORS[i%AI_MODEL_COLORS.length];
                  return (
                    <tr key={m.model} className="border-b border-[var(--app-border-strong)] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: color }} /><span className="text-sm font-medium text-white">{m.model}</span><span className="text-xs text-zinc-500 capitalize">{m.provider}</span></div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm text-zinc-300 tabular-nums">{fmtN(m.total_requests)}</td>
                      <td className="px-5 py-3.5 text-right text-sm text-zinc-300 tabular-nums">{fmtK(m.total_tokens)}</td>
                      <td className="px-5 py-3.5 text-right text-sm tabular-nums" style={{ color: m.success_rate>=95?"#f4f4f5":m.success_rate>=80?"#a1a1aa":"#c7c7cc" }}>{fmtPct(m.success_rate)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-white/[0.05] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width:`${pct}%`, background: color }} /></div>
                          <span className="text-xs text-zinc-400 tabular-nums w-8 text-right">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                }) : <tr><td colSpan={5} className="py-10 text-center text-sm text-zinc-500">No model data yet</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Cache + prompt caching charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
              <p className="text-[14px] font-semibold text-white mb-4">Prompt token caching</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeline} margin={{ top: 4, right: 0, left: -28, bottom: 0 }} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={fmtDate} />
                    <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => v>=1000?fmtK(v,0):v} />
                    <Tooltip contentStyle={tStyle} />
                    <Bar dataKey="prompt_tokens" name="Prompt" fill="#a1a1aa" fillOpacity={0.6} radius={[2,2,0,0]} />
                    <Bar dataKey="cached_tokens" name="Cached" fill="#e4e4e7" fillOpacity={0.6} radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
              <p className="text-[14px] font-semibold text-white mb-4">Usage type over time</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                    <defs><linearGradient id="ai-ut" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e4e4e7" stopOpacity={0.3}/><stop offset="95%" stopColor="#e4e4e7" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={fmtDate} />
                    <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={tStyle} formatter={(v: any) => [fmt$(Number(v)), ""]} />
                    <Area type="monotone" dataKey="cost" name="Spend" stroke="#e4e4e7" strokeWidth={2} fill="url(#ai-ut)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODELS ── */}
      {activeSubTab === "models" && (
        <div className="space-y-3">
          {models.length > 0 ? models.map((model, i) => {
            const isExp = expandedModel === model.model;
            const color = AI_MODEL_COLORS[i % AI_MODEL_COLORS.length];
            const tl = model.timeline.map(t => ({ ...t, label: fmtDate(t.date) }));
            return (
              <div key={model.model} className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg overflow-hidden hover:border-zinc-700 transition-all">
                <button onClick={() => setExpandedModel(isExp ? null : model.model)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <div>
                      <p className="text-base font-bold text-white">{model.model}</p>
                      <p className="text-xs text-zinc-500">by {model.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {[["requests", fmtN(model.total_requests)], ["tokens", fmtK(model.total_tokens)], ["cost", fmt$(model.cost)], ["success", fmtPct(model.success_rate)], ["latency", fmtSec(model.latency_p50)]].map(([l, v]) => (
                      <div key={l} className="text-right hidden md:block">
                        <p className="text-sm font-bold text-white">{v}</p>
                        <p className="text-[10px] text-zinc-500">{l}</p>
                      </div>
                    ))}
                    {isExp ? <AlertCircle className="w-4 h-4 text-zinc-500 rotate-180" /> : <AlertCircle className="w-4 h-4 text-zinc-500" style={{ transform: "rotate(0deg)" }} />}
                  </div>
                </button>
                {isExp && (
                  <div className="px-5 pb-5 border-t border-[var(--app-border-strong)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                      {[
                        { title: "Requests over time", key: "requests" as const, color },
                        { title: "Token usage", key: "total_tokens" as const, color: "#a1a1aa" },
                      ].map(({ title, key, color: c }) => (
                        <div key={title} className="bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg p-4">
                          <p className="text-xs font-semibold text-zinc-400 mb-3">{title}</p>
                          <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={tl} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                                <defs><linearGradient id={`ai-m-${key}-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c} stopOpacity={0.2}/><stop offset="95%" stopColor={c} stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="label" stroke="#3f3f46" fontSize={9} tickLine={false} axisLine={false} />
                                <YAxis stroke="#3f3f46" fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => v>=1000?fmtK(v,0):v} />
                                <Tooltip contentStyle={tStyle} />
                                <Area type="monotone" dataKey={key} stroke={c} strokeWidth={2} fill={`url(#ai-m-${key}-${i})`} dot={false} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="text-center py-16">
              <Cpu className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No model data yet</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}


// ── UTILITY COMPONENTS (EXPANDED) ──────────────────────────────────────────

