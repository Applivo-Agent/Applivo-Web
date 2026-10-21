import {
  Rocket, Search, ScrollText, ClipboardList, Bot, FileText, Sparkles, LayoutDashboard, UserRound, CreditCard, Plug, Code2, LifeBuoy,
  BookOpen, Compass, HelpCircle, Layers, UserPlus, KeyRound, UserCheck, Zap, Target, FileSpreadsheet, Clock, SlidersHorizontal,
  GitFork, CheckCircle2, FileCheck, Download, Link2, ShieldCheck, Globe, PlayCircle, ListOrdered, FileUp, CheckCheck, AlertTriangle,
  Ban, Shield, Files, Upload, FileCode, MessageSquare, GraduationCap, BarChart3, TrendingUp, Mail, Gauge, LineChart, User, Settings,
  Sliders, Receipt, Briefcase, Terminal, Laptop, FolderTree, Boxes, Network, Cpu, History, Lock, Scale, Send, LucideIcon
} from "lucide-react";
import { DocArticle, DocGroup, headingsOf } from "./types";
import { gettingStarted } from "./content/getting-started";
import { jobs } from "./content/jobs";
import { applications } from "./content/applications";
import { automation } from "./content/automation";
import { resumes, ai } from "./content/resumes-ai";
import { dashboard, account, billing, integrations, developers, troubleshooting } from "./content/rest";
import { resources } from "./content/resources";

export const articles: DocArticle[] = [
  ...gettingStarted, ...jobs, ...applications, ...automation, ...resumes, ...ai,
  ...dashboard, ...account, ...billing, ...integrations, ...developers, ...troubleshooting, ...resources,
];

const by = (group: string) => articles.filter((a) => a.group === group).map((a) => a.slug);

export const groups: DocGroup[] = [
  { id: "getting-started", title: "Getting started", icon: GraduationCap, blurb: "Create an account and make your first application.", articles: by("getting-started") },
  { id: "jobs", title: "Jobs and discovery", icon: Search, blurb: "Find listings and understand match scores.", articles: by("jobs") },
  { id: "applications", title: "Applications", icon: Layers, blurb: "Track statuses and understand results.", articles: by("applications") },
  { id: "automation", title: "Automation and extension", icon: Bot, blurb: "Apply from your own browser with the Chrome extension.", articles: by("automation") },
  { id: "resumes", title: "Resumes", icon: FileText, blurb: "Upload resumes and generate tailored versions.", articles: by("resumes") },
  { id: "ai", title: "AI features", icon: Sparkles, blurb: "Chat, cover letters, interviews and more.", articles: by("ai") },
  { id: "dashboard", title: "Dashboard and analytics", icon: LayoutDashboard, blurb: "Read your metrics and usage.", articles: by("dashboard") },
  { id: "account", title: "Account and settings", icon: UserRound, blurb: "Profile, settings and security.", articles: by("account") },
  { id: "billing", title: "Plans and billing", icon: CreditCard, blurb: "Plans, limits and subscriptions.", articles: by("billing") },
  { id: "integrations", title: "Integrations", icon: Plug, blurb: "Internshala, the extension and more.", articles: by("integrations") },
  { id: "developers", title: "Developers", icon: Terminal, blurb: "Architecture, local setup and testing.", articles: by("developers") },
  { id: "resources", title: "Resources", icon: ScrollText, blurb: "Changelog, privacy policy and terms of use.", articles: by("resources") },
  { id: "troubleshooting", title: "Troubleshooting and FAQ", icon: LifeBuoy, blurb: "Fix common problems.", articles: by("troubleshooting") },
];

/** Dedicated distinct icons for every documentation article, eliminating repetition. */
export const ARTICLE_ICONS: Record<string, LucideIcon> = {
  // Getting started
  "welcome": Compass,
  "what-is-applivo": HelpCircle,
  "key-features": Layers,
  "create-account": UserPlus,
  "sign-in": KeyRound,
  "set-up-profile": UserCheck,
  "quick-start": Zap,
  "understanding-the-dashboard": LayoutDashboard,

  // Jobs and discovery
  "jobs-overview": Compass,
  "finding-jobs": Search,
  "job-match-scores": Target,
  "job-details-and-status": FileSpreadsheet,
  "jobs-troubleshooting": LifeBuoy,

  // Applications
  "applications-overview": Layers,
  "application-statuses": Clock,
  "managing-applications": SlidersHorizontal,
  "application-workflow": GitFork,
  "answers-and-validation": CheckCircle2,
  "submission-results": FileCheck,
  "applications-troubleshooting": LifeBuoy,

  // Automation and extension
  "automation-overview": Bot,
  "install-extension": Download,
  "connect-extension": Link2,
  "eligibility": ShieldCheck,
  "supported-sites": Globe,
  "starting-a-run": PlayCircle,
  "run-queue-and-stages": ListOrdered,
  "ai-answers-and-required-fields": Sparkles,
  "resume-attachments": FileUp,
  "submission-confirmation": CheckCheck,
  "login-expiry-and-captcha": AlertTriangle,
  "unsupported-forms": Ban,
  "extension-permissions-privacy": Shield,
  "extension-troubleshooting": LifeBuoy,

  // Resumes
  "resume-management": Files,
  "upload-resume": Upload,
  "latex-templates": FileCode,
  "resume-troubleshooting": LifeBuoy,

  // AI features
  "ai-overview": Sparkles,
  "ai-chat": MessageSquare,
  "cover-letters": FileText,
  "interview-preparation": GraduationCap,
  "skill-gaps": BarChart3,
  "market-insights": TrendingUp,
  "follow-ups": Mail,

  // Dashboard and analytics
  "dashboard-overview": LayoutDashboard,
  "quota-and-usage": Gauge,
  "analytics": LineChart,

  // Account and settings
  "profile-and-preferences": User,
  "account-settings": Settings,
  "security-and-privacy": ShieldCheck,

  // Plans and billing
  "plans-overview": CreditCard,
  "usage-limits": Sliders,
  "subscription-management": Receipt,
  "billing-faq": HelpCircle,

  // Integrations
  "integrations-overview": Plug,
  "applivo-companion": Bot,
  "browser-extension": Bot,
  "internshala": Briefcase,
  "connect-internshala": Briefcase,
  "adzuna": Search,
  "greenhouse": Briefcase,
  "lever": GitFork,
  "ashby": Compass,
  "remotive": Globe,
  "linkedin": UserCheck,
  "indeed": Target,
  "glassdoor": BarChart3,
  "google-drive": FolderTree,
  "microsoft-onedrive": Files,
  "ats-resume-intelligence": Target,
  "overleaf": FileCode,
  "gmail": Mail,
  "microsoft-outlook": Mail,
  "outlook-mail": Mail,
  "google-calendar": Clock,
  "outlook-calendar": Clock,
  "calendly": CheckCircle2,
  "github": Terminal,
  "openrouter": Cpu,
  "notion": FileSpreadsheet,
  "slack": MessageSquare,
  "telegram": Send,
  "zapier": Zap,
  "make": Boxes,
  "n8n": Network,
  "lumi": Sparkles,
  "integrations-troubleshooting": LifeBuoy,

  // Developers
  "developer-overview": Terminal,
  "local-setup": Laptop,
  "project-structure": FolderTree,
  "environment-configuration": Settings,
  "backend-overview": Network,
  "frontend-overview": LayoutDashboard,
  "docker-deployment": Boxes,
  "extension-architecture": Cpu,
  "api-workflow": Network,

  // Resources
  "changelog": History,
  "privacy-policy": Lock,
  "terms-of-use": Scale,

  // Troubleshooting
  "faq": HelpCircle,
};

export function getArticleIcon(slug: string, fallbackGroup?: string): LucideIcon {
  if (ARTICLE_ICONS[slug]) return ARTICLE_ICONS[slug];
  if (fallbackGroup) {
    const g = getGroup(fallbackGroup);
    if (g?.icon) return g.icon;
  }
  return FileText;
}

const bySlug = new Map(articles.map((a) => [a.slug, a]));
export const getArticle = (slug: string) => bySlug.get(slug);
export const getGroup = (id: string) => groups.find((g) => g.id === id);

/** Reading order across the whole portal. */
const order = groups.flatMap((g) => g.articles);
export function prevNext(slug: string) {
  const i = order.indexOf(slug);
  return {
    prev: i > 0 ? bySlug.get(order[i - 1]) : undefined,
    next: i >= 0 && i < order.length - 1 ? bySlug.get(order[i + 1]) : undefined,
  };
}

export interface SearchEntry { slug: string; title: string; group: string; heading?: string; hash?: string; text: string }

/** Local search index: one entry per article plus one per heading. */
export const searchIndex: SearchEntry[] = articles.flatMap((a) => {
  const g = getGroup(a.group)?.title ?? "";
  const body = a.blocks.map((b) => ("text" in b ? b.text : "items" in b ? b.items.join(" ") : "")).join(" ");
  return [
    { slug: a.slug, title: a.title, group: g, text: `${a.description} ${body}` },
    ...headingsOf(a).map((h) => ({ slug: a.slug, title: a.title, group: g, heading: h.text, hash: h.id, text: h.text })),
  ];
});

export function search(q: string, limit = 12): SearchEntry[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored = searchIndex.map((e) => {
    const title = e.title.toLowerCase(), heading = (e.heading ?? "").toLowerCase(), text = e.text.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (heading ? heading.includes(t) : title.includes(t)) score += 10;
      else if (title.includes(t)) score += 4;
      else if (text.includes(t)) score += 1;
      else return { e, score: 0 };
    }
    return { e, score: heading ? score + 1 : score + 2 };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.e);
}
