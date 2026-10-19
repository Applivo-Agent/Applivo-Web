"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Search,
  BookOpen,
  HelpCircle,
  MessageSquare,
  PlayCircle,
  ArrowUpRight,
  Plus,
  Terminal,
} from "lucide-react";
import { groups, getArticle, getArticleIcon } from "@/lib/docs/registry";

interface DocsSidebarProps {
  slug?: string;
  onNavigate?: () => void;
  onSearch: () => void;
  inDrawer?: boolean;
}

/**
 * Concise sidebar labels that match Linear's compact density
 * while preserving the full title on the article page and in <h1> tags.
 */
const SIDEBAR_LABELS: Record<string, string> = {
  // Getting started
  "key-features": "Key features & overview",
  "sign-in": "Sign in & access",
  "set-up-profile": "Profile & preferences",
  "understanding-the-dashboard": "Dashboard overview",

  // Jobs and discovery
  "jobs-overview": "Jobs overview",
  "finding-jobs": "Finding jobs & filters",
  "job-match-scores": "Match scores & results",
  "job-details-and-status": "Job details & status",
  "jobs-troubleshooting": "Troubleshooting",

  // Applications
  "applications-overview": "Applications overview",
  "application-statuses": "Application statuses",
  "managing-applications": "Managing applications",
  "application-workflow": "Application workflow",
  "answers-and-validation": "Answers & validation",
  "submission-results": "Submission results",
  "applications-troubleshooting": "Troubleshooting",

  // Automation and extension
  "automation-overview": "Automation overview",
  "install-extension": "Install extension",
  "connect-extension": "Connect extension",
  "eligibility": "Eligibility & plans",
  "supported-sites": "Supported sites",
  "starting-a-run": "Starting a run",
  "run-queue-and-stages": "Queue & run stages",
  "ai-answers-and-required-fields": "AI answers & fields",
  "resume-attachments": "Resume attachments",
  "submission-confirmation": "Confirmations",
  "login-expiry-and-captcha": "Login expiry & CAPTCHA",
  "unsupported-forms": "Unsupported forms",
  "extension-permissions-privacy": "Permissions & privacy",
  "extension-troubleshooting": "Troubleshooting",

  // Resumes
  "resume-management": "Resume management",
  "upload-resume": "Upload resume",
  "latex-templates": "LaTeX templates",
  "resume-troubleshooting": "Troubleshooting",

  // AI features
  "ai-overview": "AI features overview",
  "ai-chat": "AI Career Assistant",
  "cover-letters": "Cover letters",
  "interview-preparation": "Interview prep",
  "skill-gaps": "Skill gap analysis",
  "market-insights": "Market insights",
  "follow-ups": "Follow-up reminders",

  // Dashboard and analytics
  "dashboard-overview": "Dashboard overview",
  "quota-and-usage": "Quota and usage",
  "analytics": "Analytics & metrics",

  // Account and settings
  "profile-and-preferences": "Profile & preferences",
  "account-settings": "Account settings",
  "security-and-privacy": "Security & privacy",

  // Plans and billing
  "plans-overview": "Plans overview",
  "usage-limits": "Usage limits",
  "subscription-management": "Subscription",
  "billing-faq": "Billing FAQ",

  // Integrations
  "integrations-overview": "Integrations overview",
  "connect-internshala": "Connect Internshala",
  "integrations-troubleshooting": "Troubleshooting",

  // Developers
  "developer-overview": "Developer overview",
  "local-setup": "Local setup",
  "project-structure": "Project structure",
  "environment-configuration": "Environment config",
  "backend-overview": "Backend overview",
  "frontend-overview": "Frontend overview",
  "authentication": "Auth & permissions",
  "api-reference": "API reference",
  "background-jobs": "Background jobs",
  "database-and-migrations": "Database & migrations",
  "testing": "Testing guide",
  "dev-troubleshooting": "Troubleshooting",

  // Resources
  "changelog": "Changelog",
  "privacy-policy": "Privacy policy",
  "terms-of-use": "Terms of use",

  // Troubleshooting
  "faq": "Frequently asked questions",
  "login-problems": "Login issues",
  "dashboard-loading": "Dashboard loading",
  "missing-jobs": "Missing jobs",
  "extension-not-connecting": "Extension pairing",
  "application-submission-failure": "Submission failure",
  "upload-errors": "Upload errors",
  "quota-errors": "Quota & usage errors",
  "ai-errors": "AI feature errors",
  "contact-support": "Contact support",
};

/** Primary Getting Started articles to preview on docs homepage */
const PRIMARY_GETTING_STARTED = ["welcome", "what-is-applivo", "key-features", "quick-start"];

export function DocsSidebar({ slug, onNavigate, onSearch, inDrawer = false }: DocsSidebarProps) {
  const pathname = usePathname();
  const currentGroupId = groups.find((g) => slug && g.articles.includes(slug))?.id;

  // Track open state of sections; auto-open the group of current slug or default to "getting-started"
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    if (slug && currentGroupId) {
      return { [currentGroupId]: true };
    }
    return { "getting-started": true };
  });

  // Track expanded state of Getting Started preview on homepage
  const [expandedGettingStarted, setExpandedGettingStarted] = useState(false);

  // When route changes, auto-expand the category containing the current article and keep unrelated collapsed
  useEffect(() => {
    if (currentGroupId) {
      setOpen({ [currentGroupId]: true });
    } else {
      setOpen({ "getting-started": true });
    }
  }, [currentGroupId, slug]);

  const toggleGroup = (groupId: string) => {
    setOpen((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isBottomActive = (href: string) => {
    if (href === "/contact") return pathname === "/contact";
    if (href === "/docs/developer-api") return slug === "developer-api";
    if (href === "/docs/quick-start") return slug === "quick-start";
    return false;
  };

  return (
    <div className="flex h-full flex-col select-none bg-[var(--docs-bg)] overflow-hidden">
      {/* Linear Docs-style compact sidebar header */}
      <div
        className={`flex h-[var(--docs-header-h)] shrink-0 items-center justify-between border-b border-[var(--docs-border)] px-3.5 ${
          inDrawer ? "pr-12" : ""
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            onClick={onNavigate}
            title="Applivo Home"
            className="group flex items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
          >
            <Image
              src="/logo.png"
              alt="Applivo"
              width={26}
              height={26}
              className="h-6.5 w-6.5 rounded-md object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <span aria-hidden className="h-3.5 w-px bg-white/15" />
          <Link
            href="/docs"
            onClick={onNavigate}
            className="text-[13.5px] font-semibold tracking-tight text-white hover:text-zinc-200 transition-colors"
          >
            Docs
          </Link>
        </div>

        <button
          type="button"
          onClick={onSearch}
          aria-label="Search documentation (⌘K)"
          title="Search documentation (⌘K)"
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={1.6} />
        </button>
      </div>

      {/* Independently scrolling navigation region */}
      <nav
        aria-label="Documentation navigation"
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2.5 pb-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]"
      >
        {groups.map((g) => {
          const isOpen = !!open[g.id];
          const isCurrentGroup = g.id === currentGroupId;
          const isGettingStarted = g.id === "getting-started";

          // On homepage (!slug), Getting Started shows primary guides until expanded.
          // On article pages, Getting Started shows all guides when open.
          const showAllInGettingStarted = !slug ? expandedGettingStarted : true;

          const visibleArticles =
            isGettingStarted && !showAllInGettingStarted
              ? g.articles.filter((s) => PRIMARY_GETTING_STARTED.includes(s))
              : g.articles;

          return (
            <div key={g.id} className="mb-1">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleGroup(g.id)}
                className={`group flex h-8 w-full items-center justify-between rounded-md px-2.5 text-left text-[13px] font-medium transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 ${
                  isCurrentGroup ? "text-zinc-200" : "text-zinc-300"
                }`}
              >
                <span className="truncate">{g.title}</span>
                {isOpen ? (
                  <ChevronDown
                    className="h-3.5 w-3.5 text-zinc-500 transition-colors group-hover:text-zinc-300"
                    strokeWidth={1.6}
                  />
                ) : (
                  <ChevronRight
                    className="h-3.5 w-3.5 text-zinc-500 transition-colors group-hover:text-zinc-300"
                    strokeWidth={1.6}
                  />
                )}
              </button>

              {isOpen && (
                <ul className="mt-0.5 mb-1.5 space-y-0.5">
                  {visibleArticles.map((s) => {
                    const article = getArticle(s);
                    if (!article) return null;

                    const isActive = s === slug;
                    const Icon = getArticleIcon(s, g.id);
                    const label = SIDEBAR_LABELS[s] || article.title;

                    return (
                      <li key={s}>
                        <Link
                          href={`/docs/${s}`}
                          onClick={onNavigate}
                          title={article.title}
                          aria-current={isActive ? "page" : undefined}
                          className={`group flex h-7 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 ${
                            isActive
                              ? "bg-white/[0.08] font-medium text-white shadow-none"
                              : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
                          }`}
                        >
                          <Icon
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                            }`}
                            strokeWidth={1.6}
                            aria-hidden
                          />
                          <span className="truncate whitespace-nowrap">{label}</span>
                        </Link>
                      </li>
                    );
                  })}

                  {/* Unobtrusive expand/collapse toggle for Getting Started on documentation homepage */}
                  {isGettingStarted && !showAllInGettingStarted && (
                    <li>
                      <button
                        type="button"
                        onClick={() => setExpandedGettingStarted(true)}
                        className="group flex h-7 w-full items-center gap-2.5 rounded-md px-2.5 text-[12px] font-medium text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5 shrink-0 text-zinc-500 group-hover:text-zinc-300" strokeWidth={1.6} />
                        <span>{g.articles.length - PRIMARY_GETTING_STARTED.length} more guides</span>
                      </button>
                    </li>
                  )}

                  {isGettingStarted && showAllInGettingStarted && !slug && (
                    <li>
                      <button
                        type="button"
                        onClick={() => setExpandedGettingStarted(false)}
                        className="group flex h-7 w-full items-center gap-2.5 rounded-md px-2.5 text-[12px] font-medium text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
                      >
                        <ChevronUp className="h-3.5 w-3.5 shrink-0 text-zinc-500 group-hover:text-zinc-300" strokeWidth={1.6} />
                        <span>Show fewer</span>
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Pinned bottom resource links matching Linear Docs */}
      <div className="shrink-0 border-t border-[var(--docs-border)] p-2 space-y-0.5 bg-[var(--docs-bg)]">
        {[
          { href: "/docs", label: "Docs", icon: BookOpen },
          { href: "/docs/developer-api", label: "Developers", icon: Terminal },
          { href: "/docs/quick-start", label: "Learn", icon: PlayCircle },
          { href: "/contact", label: "Contact support", icon: MessageSquare },
        ].map(({ href, label, icon: Icon }) => {
          const isActive = isBottomActive(href);

          return (
            <Link
              key={label}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`group flex h-7 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 ${
                isActive
                  ? "bg-white/[0.08] font-medium text-white shadow-none"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${
                  isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                }`}
                strokeWidth={1.6}
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
