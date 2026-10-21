"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useShell } from "@/components/app-shell";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import {
  Gift, Home, LayoutDashboard, Briefcase, FileText, BarChart2,
  MessageSquare, BotMessageSquare, Settings, LogOut, Crown, Zap,
  Users, Shield, ChevronRight, BookOpen,
  TrendingUp, Mail, Bell, Link2, CreditCard,
  Layers, Target, Star, RefreshCw, Search, Send, PanelLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStatus } from "@/lib/agent-status";

const TASK_MAP: Record<string, { label: string; icon: any; color: string }> = {
  scrape_jobs: { label: "Scraping Jobs", icon: Search, color: "text-zinc-400" },
  analyze_jobs: { label: "Analyzing Jobs", icon: Zap, color: "text-zinc-400" },
  queue_jobs: { label: "Staging Applications", icon: Layers, color: "text-zinc-400" },
  apply_jobs: { label: "Deploying Applications", icon: Send, color: "text-zinc-400" },
};

const navGroups = [
  {
    label: "Core",
    items: [
      { href: "/", icon: Home, label: "Home" },
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/jobs", icon: Briefcase, label: "Jobs" },
      { href: "/applications", icon: Layers, label: "Applications" },
      { href: "/resumes", icon: FileText, label: "Resumes" },
      { href: "/analytics", icon: BarChart2, label: "Analytics" },
      { href: "/chat", icon: MessageSquare, BotMessageSquare, label: "AI Chat" },
      { href: "/messages", icon: Mail, label: "Messages" },
    ],
  },
  {
    label: "Pro Features",
    pro: true,
    items: [
      { href: "/cover-letters", icon: BookOpen, label: "Cover Letters", plan: "pro" },
      { href: "/interviews", icon: Star, label: "Interviews", plan: "pro" },
      { href: "/skill-gaps", icon: Target, label: "Skill Gaps", plan: "pro" },
      { href: "/follow-ups", icon: Bell, label: "Follow-ups", plan: "pro" },
    ],
  },
  {
    label: "Premium",
    premium: true,
    items: [
      { href: "/market", icon: TrendingUp, label: "Market Insights", plan: "premium" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", icon: Users, label: "Profile" },
      { href: "/connect", icon: Link2, label: "Connections" },
      { href: "/subscription", icon: CreditCard, label: "Subscription" },
      { href: "/refer", icon: Gift, label: "Refer & Earn" },
      { href: "/settings", icon: Settings, label: "Settings" },
      { href: "/security", icon: Shield, label: "Security" },
    ],
  },
];

const sidebarVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { plan, quota } = useSubscription();
  const { collapsed, mobileOpen, toggle, expand } = useShell();
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl+K focuses navigation search (expanding the sidebar when it is collapsed).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        expand();
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expand]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isSuper = user?.is_superuser ?? false;
  const planLabel = isSuper
    ? "Admin"
    : plan === "starter" ? "Starter" : plan === "pro" ? "Pro" : plan === "premium" ? "Premium" : "Free";
  const pct = quota && quota.limit > 0 ? Math.min((quota.used / quota.limit) * 100, 100) : 0;

  const q = query.trim().toLowerCase();
  const groups = navGroups
    .map((g) => ({ ...g, items: q ? g.items.filter((i) => i.label.toLowerCase().includes(q)) : g.items }))
    .filter((g) => g.items.length > 0);
  const showAdmin = isSuper && (!q || "admin panel".includes(q));
  const firstMatch = q ? groups[0]?.items[0] ?? (showAdmin ? { href: "/admin" } : undefined) : undefined;

  const hrefFor = (item: (typeof navGroups)[number]["items"][number]) => {
    const need = (item as { plan?: string }).plan;
    const locked = !isSuper && ((need === "pro" && plan !== "pro" && plan !== "premium") || (need === "premium" && plan !== "premium"));
    return { locked, href: locked ? "/subscription" : item.href };
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-dvh min-h-0 flex-col bg-[var(--app-sidebar)] border-r border-[var(--app-border)] transition-[width,transform] duration-200",
        "w-[var(--app-sidebar-w)] -translate-x-full md:translate-x-0",
        mobileOpen && "translate-x-0",
        collapsed && "md:w-[var(--app-sidebar-w-collapsed)]",
      )}
    >
      {/* 1. Brand header */}
      <div className={cn("flex h-[var(--app-header-h)] shrink-0 items-center justify-between px-4", collapsed && "md:justify-center md:px-0")}>
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40" title="Applivo">
          <Image src="/logo.png" alt="" width={28} height={28} className="rounded-md object-contain" />
          <span className={cn("truncate text-[16px] font-medium tracking-tight text-white", collapsed && "md:hidden")}>Applivo</span>
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-label="Collapse sidebar"
          className={cn("app-icon-btn shrink-0", collapsed && "md:hidden")}
        >
          <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* 2. Navigation search */}
      <div className={cn("shrink-0 px-3 pb-2 pt-1", collapsed && "md:px-2")}>
        {collapsed ? (
          <button
            type="button"
            aria-label="Search navigation"
            title="Search (⌘K)"
            onClick={() => { expand(); setTimeout(() => searchRef.current?.focus(), 0); }}
            className="app-icon-btn hidden w-full md:flex"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </button>
        ) : null}
        <label className={cn("app-search", collapsed && "md:hidden")}>
          <Search className="h-4 w-4 shrink-0 text-[var(--app-text-dim)]" strokeWidth={1.75} aria-hidden />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setQuery(""); (e.target as HTMLInputElement).blur(); }
              if (e.key === "Enter" && firstMatch) { setQuery(""); router.push(hrefFor(firstMatch as never).href); }
            }}
            placeholder="Search"
            aria-label="Search navigation"
            className="min-w-0 flex-1 bg-transparent text-[length:var(--fs-base)] text-white outline-none placeholder:text-[var(--app-text-dim)]"
          />
          <kbd className="shrink-0 text-[11px] text-[var(--app-text-dim)]">⌘K</kbd>
        </label>
      </div>

      {/* 3. Scrollable navigation (own scroll container, clears the footer when scrolled to the end) */}
      <nav aria-label="Main" className="app-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-6 pt-2">
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              <p className={cn("app-nav-label flex items-center gap-1.5", collapsed && "md:hidden")}>
                {group.label}
                {group.pro && <span className="rounded px-1 text-[10px] font-medium leading-4 text-[#9a9aa0] bg-white/[0.06]">PRO</span>}
                {group.premium && <span className="rounded px-1 text-[10px] font-medium leading-4 text-[#9a9aa0] bg-white/[0.06]">PREMIUM</span>}
              </p>
              {collapsed && <div className="mx-2 mb-1.5 hidden border-t border-[var(--app-border)] md:block" />}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const { locked, href } = hrefFor(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={cn("app-nav-item", collapsed && "md:justify-center md:px-0", locked && "opacity-60")}
                      >
                        <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        <span className={cn("flex-1 truncate", collapsed && "md:hidden")}>{item.label}</span>
                        {locked && <Crown className={cn("h-3 w-3 text-zinc-500", collapsed && "md:hidden")} strokeWidth={1.75} />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {showAdmin && (
            <div>
              <p className={cn("app-nav-label", collapsed && "md:hidden")}>Admin</p>
              <Link
                href="/admin"
                aria-current={pathname.startsWith("/admin") ? "page" : undefined}
                title={collapsed ? "Admin Panel" : undefined}
                className={cn("app-nav-item", collapsed && "md:justify-center md:px-0")}
              >
                <Shield className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className={cn("truncate", collapsed && "md:hidden")}>Admin Panel</span>
              </Link>
            </div>
          )}

          {q && groups.length === 0 && !showAdmin && (
            <p className="px-2.5 text-[length:var(--fs-meta)] text-[var(--app-text-dim)]">No matching pages.</p>
          )}

          <div className={cn(collapsed && "md:hidden")}>
            <AgentMissionControl />
          </div>
        </div>
      </nav>

      {/* 4. Fixed bottom area: usage + account */}
      <div className={cn("shrink-0 border-t border-[var(--app-border)] p-3", collapsed && "md:px-1.5")}>
        {quota && !collapsed && (
          <div className="mb-2.5 px-1">
            <div className="flex items-center justify-between text-[length:var(--fs-meta)] text-[var(--app-text-dim)]">
              <span>Daily applications</span>
              <span className="tabular-nums text-[var(--app-text)]">{quota.used}/{quota.limit}</span>
            </div>
            <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/[0.08]">
              <div className="h-full rounded-full bg-white/50 transition-[width] duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
        <div className={cn("flex items-center gap-2.5 px-1", collapsed && "md:flex-col md:px-0")}>
          <Link href="/profile" title={collapsed ? `${user?.full_name ?? "Account"} · ${planLabel}` : undefined}
            className={cn("flex min-w-0 flex-1 items-center gap-2.5 rounded-md", collapsed && "md:flex-none")}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2c2c2e] text-[12px] font-semibold text-white">
              {user?.full_name?.charAt(0)?.toUpperCase() ?? "A"}
            </span>
            <span className={cn("min-w-0", collapsed && "md:hidden")}>
              <span className="block truncate text-[length:var(--fs-base)] font-medium leading-5 text-white">{user?.full_name ?? "User"}</span>
              <span className="block text-[length:var(--fs-meta)] leading-4 text-[var(--app-text-dim)]">{planLabel}</span>
            </span>
          </Link>
          <button type="button" onClick={handleLogout} title="Logout" aria-label="Logout" className={cn("app-icon-btn", collapsed && "md:hidden")}>
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function AgentMissionControl() {
  const { isWorking, currentTask } = useAgentStatus();
  const taskInfo = currentTask ? TASK_MAP[currentTask] : null;

  return (
    <AnimatePresence>
      {isWorking && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="px-1"
        >
          <div className="bg-white/[0.03] border border-white/10 rounded-lg p-2.5 relative overflow-hidden group hover:border-white/20 transition-colors">
            {/* Background Activity Pulse */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <motion.div
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1] 
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 -top-4 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl pointer-events-none"
            />

            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="w-6 h-6 rounded-md bg-black border border-white/10 flex items-center justify-center">
                  {taskInfo ? (
                    <taskInfo.icon className="w-3 h-3 text-white" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-white animate-spin" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-zinc-500 leading-3">Agent active</p>
                <p className="text-[12px] font-medium text-white truncate">
                  {taskInfo?.label || "Processing..."}
                </p>
              </div>
            </div>

            {/* Micro-progress bar */}
            <div className="mt-3 h-1 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
