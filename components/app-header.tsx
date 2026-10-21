"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PanelLeft, Sparkles, Settings, CreditCard, UserRound, Shield, LogOut, ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/lib/subscription";
import { useShell } from "@/components/app-shell";
import { useLumi } from "@/lib/lumi-context";
import { cn } from "@/lib/utils";

const TITLES: [string, string][] = [
  ["/dashboard", "Dashboard"],
  ["/jobs", "Jobs"],
  ["/applications", "Applications"],
  ["/resumes", "Resumes"],
  ["/analytics", "Analytics"],
  ["/chat", "AI Chat"],
  ["/messages", "Messages"],
  ["/cover-letters", "Cover Letters"],
  ["/interviews", "Interviews"],
  ["/skill-gaps", "Skill Gaps"],
  ["/follow-ups", "Follow-ups"],
  ["/market", "Market Insights"],
  ["/profile", "Profile"],
  ["/connect", "Connections"],
  ["/subscription", "Subscription"],
  ["/refer", "Refer & Earn"],
  ["/settings", "Settings"],
  ["/security", "Security"],
  ["/admin", "Admin Panel"],
];

function titleFor(pathname: string) {
  return TITLES.find(([p]) => pathname === p || pathname.startsWith(p + "/"))?.[1] ?? "Applivo";
}

const PLAN_LABEL: Record<string, string> = { starter: "Starter", pro: "Pro", premium: "Premium" };

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { plan, quota } = useSubscription();
  const { toggle, collapsed } = useShell();
  const { togglePanel, isOpen: isLumiOpen } = useLumi();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = user?.full_name || user?.email || "Account";
  const initials = name.trim().charAt(0).toUpperCase() || "A";
  const isAdmin = user?.is_superuser ?? false;
  const planLabel = isAdmin ? "Admin" : PLAN_LABEL[plan] ?? "Free";
  const canUpgrade = !isAdmin && plan !== "premium";

  const items: { href: string; label: string; icon: typeof Settings }[] = [
    { href: "/profile", label: "Profile", icon: UserRound },
    { href: "/subscription", label: "Subscription", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/security", label: "Security", icon: Shield },
  ];

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const els = Array.from(wrapRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (!els.length) return;
    e.preventDefault();
    const i = els.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? (i + 1) % els.length : (i - 1 + els.length) % els.length;
    els[next].focus();
  };

  return (
    <header className="app-header sticky top-0 z-20 flex h-[var(--app-header-h)] shrink-0 items-center justify-between gap-3 bg-[var(--app-header)] border-b border-[var(--app-border)] px-4 md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Open navigation"}
          className={collapsed ? "app-icon-btn" : "app-icon-btn md:hidden"}
        >
          <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <h1 className="truncate text-[13px] font-normal leading-5 text-white">{titleFor(pathname)}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={togglePanel}
          className={cn(
            "app-btn transition-colors gap-1.5",
            isLumiOpen && "bg-white/[0.08] text-white border-white/20"
          )}
          aria-label="Ask Lumi"
          aria-expanded={isLumiOpen}
        >
          <Image
            src="/lumi-logo.png"
            alt="Lumi"
            width={16}
            height={16}
            className="w-4 h-4 object-contain shrink-0"
            priority
          />
          <span className="hidden sm:inline">Ask Lumi</span>
        </button>

        <Link
          href="/subscription"
          className="app-btn tabular-nums"
          title={quota ? `${quota.used} of ${quota.limit} applications used today` : undefined}
        >
          <span className="text-[var(--app-text-dim)]">{planLabel}</span>
          {quota && (
            <span className="hidden sm:inline text-white">
              {quota.used}/{quota.limit}
            </span>
          )}
        </Link>

        {canUpgrade && (
          <Link href="/subscription" className="app-btn app-btn-accent hidden md:inline-flex">
            Upgrade
          </Link>
        )}

        <div ref={wrapRef} className="relative ml-1" onKeyDown={onMenuKey}>
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Account menu"
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full bg-[#2a2a2c] text-[13px] font-semibold text-white outline-none transition-colors",
              "hover:bg-[#343437] focus-visible:ring-2 focus-visible:ring-white/40",
              open && "ring-1 ring-white/20",
            )}
          >
            {initials}
          </button>

          {open && (
            <div
              role="menu"
              aria-label="Account"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-[232px] max-w-[calc(100vw-16px)] overflow-hidden rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-menu)] shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
            >
              <div className="border-b border-[var(--app-border)] px-4 py-3">
                <p className="truncate text-[13px] font-medium text-white">{name}</p>
                {user?.email && user.email !== name && (
                  <p className="truncate text-[12px] text-[var(--app-text-dim)]">{user.email}</p>
                )}
                <p className="mt-1 text-[12px] text-[var(--app-text-dim)]">{planLabel} plan</p>
              </div>
              <div className="p-1.5">
                {items.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="app-menu-item"
                  >
                    <Icon className="h-4 w-4 text-[var(--app-text-dim)]" strokeWidth={1.75} />
                    {label}
                  </Link>
                ))}
                {canUpgrade && (
                  <Link href="/subscription" role="menuitem" onClick={() => setOpen(false)} className="app-menu-item">
                    <ArrowUpRight className="h-4 w-4 text-[var(--app-text-dim)]" strokeWidth={1.75} />
                    Upgrade plan
                  </Link>
                )}
              </div>
              <div className="border-t border-[var(--app-border)] p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setOpen(false); logout(); router.push("/login"); }}
                  className="app-menu-item w-full text-left"
                >
                  <LogOut className="h-4 w-4 text-[var(--app-text-dim)]" strokeWidth={1.75} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
