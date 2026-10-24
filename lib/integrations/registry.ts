/**
 * Central Integration Registry for Applivo
 * ========================================
 * Strategic catalog organized into three clear architectural types:
 * 1. Job Sources (Platforms & Job Boards from which Applivo discovers openings)
 * 2. Connected Services (User-authorized OAuth/API services for mail, calendar, portfolio, notifications & storage)
 * 3. Built-in Capabilities (Core Applivo engines that power AI, resume parsing, and automation)
 */

export type IntegrationCategory =
  | "All"
  | "Job Sources"
  | "Connected Services"
  | "Built-in Capabilities";

export type IntegrationArchitectureType =
  | "job_source"
  | "connected_service"
  | "builtin";

export interface IntegrationItem {
  id: string;
  name: string;
  category: "Job Sources" | "Connected Services" | "Built-in Capabilities";
  architectureType: IntegrationArchitectureType;
  badge: string; // Architectural classification displayed in badge
  tag: string; // Specific capability or protocol
  description: string;
  summary: string;
  logo: string;
  logoAlt: string;
  featured: boolean; // Flag for the 8-card featured grid (4 cols x 2 rows)
  status: "Active" | "High Priority" | "High Value" | "Available" | "Setup Required" | "Built-in" | "Roadmap";
  capabilities: string[];
  docSlug?: string;
}

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  "All",
  "Job Sources",
  "Connected Services",
  "Built-in Capabilities",
];

export const INTEGRATION_REGISTRY: IntegrationItem[] = [
  // ─── 1. FEATURED ROW 1: CORE JOB SOURCES & DEV CONTEXT ───
  {
    id: "internshala",
    name: "Internshala",
    category: "Job Sources",
    architectureType: "job_source",
    badge: "Job Source",
    tag: "Session Sync",
    description: "Session-based internship sync and background form preparation for verified student opportunities.",
    summary: "Connect your Internshala account to automatically discover matching internships and draft tailored application answers.",
    logo: "/logos/internshala-mark.svg",
    logoAlt: "Internshala Logo",
    featured: true,
    status: "Active",
    docSlug: "internshala",
    capabilities: [
      "Session synchronization via encrypted local storage state",
      "Automated internship discovery filtered by role and location",
      "Screening question extraction and candidate answer drafts",
      "Draft review with single-click manual confirmation"
    ]
  },
  {
    id: "adzuna",
    name: "Adzuna",
    category: "Job Sources",
    architectureType: "job_source",
    badge: "Job Source",
    tag: "Discovery API",
    description: "Planned: multi-market job search aggregation with real-time salary benchmarks and regional listing feeds.",
    summary: "Aggregate verified job listings and salary insights directly into Applivo via Adzuna's documented job-search API.",
    logo: "/logos/adzuna.png",
    logoAlt: "Adzuna Logo",
    featured: true,
    status: "Roadmap",
    docSlug: "adzuna",
    capabilities: [
      "Broad multi-country job search aggregation",
      "Market salary index benchmarks and compensation percentiles",
      "Location and seniority-based candidate matching",
      "Automated feed indexing directly into the Applivo job dashboard"
    ]
  },
  {
    id: "github",
    name: "GitHub",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Dev Portfolio",
    description: "Connect repositories to extract project metadata, languages, and verifiable portfolio evidence.",
    summary: "Link your GitHub profile to supply authentic repository metadata and technical context for engineering applications.",
    logo: "/logos/github.svg",
    logoAlt: "GitHub Logo",
    featured: true,
    status: "Setup Required",
    docSlug: "github",
    capabilities: [
      "Read-only sync of public repositories and project hierarchies",
      "Language distribution and primary framework extraction",
      "README and documentation context for AI answer drafting",
      "Automated project evidence linking in technical applications"
    ]
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    category: "Job Sources",
    architectureType: "job_source",
    badge: "Job Source",
    tag: "Job Board API",
    description: "Planned: company job board discovery and listing synchronization directly from organization boards.",
    summary: "Synchronize published openings from company Greenhouse boards directly into your Applivo discovery feed.",
    logo: "/logos/greenhouse.svg",
    logoAlt: "Greenhouse Logo",
    featured: true,
    status: "Roadmap",
    docSlug: "greenhouse",
    capabilities: [
      "Public job board synchronization via organization token",
      "Department, team, and office location filtering",
      "Structured job requirements extraction for Lumi matching",
      "Direct link routing to authentic company application portals"
    ]
  },

  // ─── 2. FEATURED ROW 2: ATS SOURCES & PRODUCTIVITY APIS ───
  {
    id: "lever",
    name: "Lever",
    category: "Job Sources",
    architectureType: "job_source",
    badge: "Job Source",
    tag: "Postings API",
    description: "Planned: real-time opportunity synchronization and structured role retrieval using Lever's public postings API.",
    summary: "Fetch and index structured career opportunities from companies using Lever ATS for real-time match scoring.",
    logo: "/logos/lever.svg",
    logoAlt: "Lever Logo",
    featured: true,
    status: "Roadmap",
    docSlug: "lever",
    capabilities: [
      "Real-time job opening retrieval by organization slug",
      "Team, commitment (full-time/part-time), and workplace type parsing",
      "Skill matching against candidate resume and experience graph",
      "Clean referral tracking and original posting verification"
    ]
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Interview Sync",
    description: "Automatic scheduling of recruiter screen calls, technical interviews, and follow-up reminders.",
    summary: "Sync recruiter screen calls and interview rounds directly to your calendar with automated follow-up reminders.",
    logo: "/logos/google-calendar.png",
    logoAlt: "Google Calendar Logo",
    featured: true,
    status: "High Priority",
    docSlug: "google-calendar",
    capabilities: [
      "Two-way interview event scheduling with recruiter invites",
      "Automated application follow-up and prep notifications",
      "Timezone conversion and conflict-free availability slots",
      "Secure OAuth 2.0 calendar scope with user authorization"
    ]
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Email Tracker",
    description: "Privacy-first detection of job confirmations, interview invites, and status changes in your inbox.",
    summary: "Detect application receipts, interview invitations, and status updates to keep your job tracker automatically updated.",
    logo: "/logos/gmail.png",
    logoAlt: "Gmail Logo",
    featured: true,
    status: "High Value",
    docSlug: "gmail",
    capabilities: [
      "Automated status detection (Applied, Screening, Interview, Offer)",
      "Strict zero-storage parsing of sender headers and interview links",
      "Granular user-consented OAuth scopes with full privacy controls",
      "Real-time pipeline progression without manual spreadsheet updates"
    ]
  },
  {
    id: "google-drive",
    name: "Google Drive",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Document Vault",
    description: "Seamless import of existing resumes and portfolio docs with automatic backup of tailored PDFs.",
    summary: "Import existing resumes from Drive and automatically save role-tailored PDF versions back to your folder.",
    logo: "/logos/google-drive.png",
    logoAlt: "Google Drive Logo",
    featured: true,
    status: "Available",
    docSlug: "google-drive",
    capabilities: [
      "One-click import of master CVs from Google Drive",
      "Auto-export of AI-tailored PDF resumes to an Applivo Drive folder",
      "Version history synchronization between cloud and local vault",
      "Secure Google Drive OAuth file picker integration"
    ]
  },

  // ─── 3. EXTENDED JOB SOURCES ───
  {
    id: "ashby",
    name: "Ashby",
    category: "Job Sources",
    architectureType: "job_source",
    badge: "Job Source",
    tag: "Career Pages API",
    description: "Planned: company career page job discovery powered by Ashby's public job board API.",
    summary: "Discover published job openings from fast-growing startups using Ashby's public career page API.",
    logo: "/logos/ashby.png",
    logoAlt: "Ashby Logo",
    featured: false,
    status: "Roadmap",
    docSlug: "ashby",
    capabilities: [
      "Public career board discovery for technology startups",
      "Custom compensation range and remote eligibility extraction",
      "Structured job requirements parsing for Lumi scoring",
      "Direct company application link generation"
    ]
  },
  {
    id: "remotive",
    name: "Remotive",
    category: "Job Sources",
    architectureType: "job_source",
    badge: "Job Source",
    tag: "Remote Feed API",
    description: "Planned: curated worldwide remote job listings for software engineering, product, and design roles.",
    summary: "Explore verified remote-first opportunities with transparent source attribution and geographic criteria.",
    logo: "/logos/remotive.png",
    logoAlt: "Remotive Logo",
    featured: false,
    status: "Roadmap",
    docSlug: "remotive",
    capabilities: [
      "Curated remote software and tech opportunities",
      "Geographic eligibility verification (Worldwide, Americas, EMEA, APAC)",
      "Official public API feed with source link attribution",
      "Automated skill matching against candidate profiles"
    ]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Job Sources",
    architectureType: "job_source",
    badge: "Job Source",
    tag: "External Portal",
    description: "Assisted job discovery, keyword gap analysis, and tailored resume preparation for LinkedIn Easy Apply.",
    summary: "Assisted preparation and tailored answers for manual application submission on LinkedIn.",
    logo: "/logos/linkedin.svg",
    logoAlt: "LinkedIn Logo",
    featured: false,
    status: "Available",
    docSlug: "linkedin",
    capabilities: [
      "Opportunity discovery matching verified career preferences",
      "Easy Apply screening question assistance and draft answers",
      "Profile link synchronization for hiring team review",
      "Status tracking for active application pipelines"
    ]
  },
  {
    id: "indeed",
    name: "Indeed",
    category: "Job Sources",
    architectureType: "job_source",
    badge: "Job Source",
    tag: "External Portal",
    description: "Job match scoring and tailored application answers for manual application on Indeed.",
    summary: "Analyze employer requirements and generate tailored application answers for Indeed jobs.",
    logo: "/logos/indeed.svg",
    logoAlt: "Indeed Logo",
    featured: false,
    status: "Available",
    docSlug: "indeed",
    capabilities: [
      "Requirement gap analysis and keyword density scoring",
      "Tailored application answers for employer screening assessments",
      "External manual submission assistance",
      "Pipeline stage tracking"
    ]
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    category: "Job Sources",
    architectureType: "job_source",
    badge: "Job Source",
    tag: "Market Intel",
    description: "Employer reputation insights, interview intelligence, and verified salary benchmarks.",
    summary: "Research company culture, interview trends, and compensation percentiles for prospective roles.",
    logo: "/logos/glassdoor.svg",
    logoAlt: "Glassdoor Logo",
    featured: false,
    status: "Available",
    docSlug: "glassdoor",
    capabilities: [
      "Interview question trend analysis for target companies",
      "Compensation percentile benchmarks by seniority tier",
      "Company ratings and culture evaluations",
      "Offer negotiation preparation data"
    ]
  },

  // ─── 4. EXTENDED CONNECTED SERVICES ───
  {
    id: "slack",
    name: "Slack",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Notifications",
    description: "Job alerts and application lifecycle notifications delivered directly to your Slack channel.",
    summary: "Receive real-time Slack alerts for high-match opportunities, run completions, and interview reminders.",
    logo: "/logos/slack.svg",
    logoAlt: "Slack Logo",
    featured: false,
    status: "Available",
    docSlug: "slack",
    capabilities: [
      "Job match notifications (score >= 50)",
      "Application run completion summaries",
      "Interview and follow-up reminders",
      "Configurable per-event notification preferences"
    ]
  },
  {
    id: "notion",
    name: "Notion",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Workspace Sync",
    description: "Sync saved jobs and application tracking data into your custom Notion workspace database.",
    summary: "Automatically synchronize high-match jobs and application stages into your personal Notion database.",
    logo: "/logos/notion.svg",
    logoAlt: "Notion Logo",
    featured: false,
    status: "Available",
    docSlug: "notion",
    capabilities: [
      "Job tracker database sync (idempotent)",
      "User-selected Notion database destination",
      "Configurable field mapping",
      "Automatic background sync on job match discoveries"
    ]
  },
  {
    id: "telegram",
    name: "Telegram",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Bot Alerts",
    description: "Personal job alerts and reminders delivered securely to your Telegram account.",
    summary: "Link your Telegram account via @ApplivoBot for instant mobile alerts on job matches and application updates.",
    logo: "/logos/telegram.svg",
    logoAlt: "Telegram Logo",
    featured: false,
    status: "Available",
    docSlug: "telegram",
    capabilities: [
      "Secure bot-based account linking via cryptographic code",
      "High-match job notifications on mobile and desktop",
      "Application run execution summaries",
      "Interview and follow-up alerts"
    ]
  },
  {
    id: "calendly",
    name: "Calendly",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Interview Sync",
    description: "Two-way interview scheduling reconciliation, webhook event handling, and appointment tracking.",
    summary: "Automatically record interview appointments and cancellations scheduled via your Calendly booking links.",
    logo: "/logos/calendly.svg",
    logoAlt: "Calendly Logo",
    featured: false,
    status: "Available",
    docSlug: "calendly",
    capabilities: [
      "Scheduling link and event type detection",
      "Automatic interview record creation on booking",
      "Cancellation tracking with status reconciliation",
      "Pending match review for ambiguous appointments"
    ]
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Microsoft Graph",
    description: "Support for candidates using Microsoft 365 for interview scheduling and email confirmation tracking.",
    summary: "Connect your Microsoft 365 or Outlook account for integrated interview calendars and application updates.",
    logo: "/logos/outlook.svg",
    logoAlt: "Microsoft Outlook Logo",
    featured: false,
    status: "Roadmap",
    docSlug: "microsoft-outlook",
    capabilities: [
      "Microsoft Graph calendar event scheduling",
      "Interview reminder alerts and follow-up tasks",
      "Application receipt email detection from corporate domains",
      "Secure Microsoft identity authorization"
    ]
  },
  {
    id: "onedrive",
    name: "Microsoft OneDrive",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Document Vault",
    description: "Access your career files and export tailored resumes directly through your Microsoft account.",
    summary: "Import resumes and export tailored PDFs directly to your personal or enterprise OneDrive.",
    logo: "/logos/onedrive.svg",
    logoAlt: "Microsoft OneDrive Logo",
    featured: false,
    status: "Roadmap",
    docSlug: "microsoft-onedrive",
    capabilities: [
      "OneDrive file picker for resumes",
      "Export tailored documents to cloud folder",
      "Microsoft Graph delegated permissions",
      "Support for personal and M365 enterprise accounts"
    ]
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Webhooks",
    description: "Trigger custom automations across 5,000+ apps when interview status updates or applications are sent.",
    summary: "Send real-time webhooks to Zapier to log application events into Notion, Airtable, Slack, or Google Sheets.",
    logo: "/logos/zapier.svg",
    logoAlt: "Zapier Logo",
    featured: false,
    status: "Available",
    docSlug: "zapier",
    capabilities: [
      "Real-time event webhooks for status updates and interview bookings",
      "Zero-code sync to Notion, Airtable, Slack, and Discord",
      "Encrypted webhook secret signing for authentic payloads",
      "Custom payload filtering across 8 lifecycle events"
    ]
  },
  {
    id: "make",
    name: "Make",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Webhooks",
    description: "Automate sophisticated visual scenarios in Make from Applivo application events.",
    summary: "Connect Applivo webhooks to Make scenarios to power custom multi-step candidate workflows.",
    logo: "/logos/make.svg",
    logoAlt: "Make Logo",
    featured: false,
    status: "Available",
    docSlug: "make",
    capabilities: [
      "Outbound webhook delivery on configurable events",
      "HMAC-SHA256 signed payloads with SSRF IP protection",
      "Delivery history log with HTTP status codes and latency",
      "Branching visual scenario automation in Make"
    ]
  },
  {
    id: "n8n",
    name: "n8n",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Webhooks",
    description: "Send Applivo events to your self-hosted or cloud n8n workflows via secure outbound webhooks.",
    summary: "Privacy-focused workflow automation connecting Applivo events directly to your n8n pipelines.",
    logo: "/logos/n8n.svg",
    logoAlt: "n8n Logo",
    featured: false,
    status: "Available",
    docSlug: "n8n",
    capabilities: [
      "Outbound webhook on configurable events",
      "HMAC-SHA256 signed payloads with cryptographic verification",
      "Delivery history and bounded retry engine",
      "Direct integration with self-hosted n8n nodes"
    ]
  },

  // ─── 5. BUILT-IN SYSTEM CAPABILITIES ───
  {
    id: "openrouter",
    name: "OpenRouter AI Engine",
    category: "Built-in Capabilities",
    architectureType: "builtin",
    badge: "Built-in Engine",
    tag: "AI Reasoning",
    description: "Applivo's internal reasoning gateway routing candidate profiling across state-of-the-art LLMs.",
    summary: "Applivo's configured internal AI infrastructure, routing application drafting to optimal models.",
    logo: "/logos/openrouter.svg",
    logoAlt: "OpenRouter Logo",
    featured: false,
    status: "Built-in",
    docSlug: "openrouter",
    capabilities: [
      "Multi-model routing across verified reasoning architectures",
      "Strict prompt guardrails enforcing truthful candidate representations",
      "Zero data retention mode for candidate privacy and safety",
      "High-speed streaming for instant cover letter drafting"
    ]
  },
  {
    id: "ats-engine",
    name: "ATS Resume Intelligence",
    category: "Built-in Capabilities",
    architectureType: "builtin",
    badge: "Built-in Engine",
    tag: "Resume Scoring",
    description: "Native keyword match scoring, format compliance auditing, and role-tailored resume generation.",
    summary: "Applivo's native resume engine analyzing keyword density, structure, and ATS parser compatibility.",
    logo: "/logos/ats.svg",
    logoAlt: "ATS Engine Logo",
    featured: false,
    status: "Built-in",
    docSlug: "ats-resume-intelligence",
    capabilities: [
      "Instant ATS match percentage calculation against target job specs",
      "Section-by-section keyword extraction and missing term warnings",
      "Clean single-column formatting audit for parser compliance",
      "Multi-format export supporting clean PDF and plain text"
    ]
  },
  {
    id: "overleaf",
    name: "Overleaf LaTeX Engine",
    category: "Built-in Capabilities",
    architectureType: "builtin",
    badge: "Built-in Engine",
    tag: "LaTeX Pipeline",
    description: "Automated LaTeX resume compilation and export-ready formatting for Overleaf academic projects.",
    summary: "Generate clean moderncv and academic LaTeX source code ready for immediate compilation in Overleaf.",
    logo: "/logos/overleaf.svg",
    logoAlt: "Overleaf Logo",
    featured: false,
    status: "Built-in",
    docSlug: "overleaf",
    capabilities: [
      "Overleaf-compatible moderncv and academic LaTeX templates",
      "Automated escaping of special LaTeX characters and ligatures",
      "Export-ready .tex file generation from candidate profile data",
      "Direct copy and project import for publishing and printing"
    ]
  },
  {
    id: "companion",
    name: "Applivo Companion",
    category: "Built-in Capabilities",
    architectureType: "builtin",
    badge: "Built-in Engine",
    tag: "Browser Core",
    description: "Local browser companion executing hands-free form filling with candidate oversight and zero telemetry.",
    summary: "The official browser extension providing in-context application drafting directly on job board portals.",
    logo: "/logos/extension.png",
    logoAlt: "Applivo Companion Logo",
    featured: false,
    status: "Built-in",
    docSlug: "applivo-companion",
    capabilities: [
      "In-situ screening question extraction on active web pages",
      "Single-click field pre-filling with manual user review",
      "Direct session security keeping credentials entirely on-device",
      "Real-time sync with candidate vault and application tracker"
    ]
  },
  {
    id: "lumi",
    name: "Lumi AI Assistant",
    category: "Built-in Capabilities",
    architectureType: "builtin",
    badge: "Built-in Engine",
    tag: "AI Assistant",
    description: "Built-in conversational career assistant and multi-agent application workflow orchestrator.",
    summary: "Interactive AI career coaching, skill gap analysis, and realistic mock interview simulations.",
    logo: "/logos/lumi.png",
    logoAlt: "Lumi Logo",
    featured: false,
    status: "Built-in",
    docSlug: "lumi",
    capabilities: [
      "Context-aware career advisory grounded in candidate experience",
      "Skill gap analysis with targeted project recommendations",
      "Role-specific mock interview simulations with answer critiques",
      "Automated recruiter follow-up drafting"
    ]
  }
];
