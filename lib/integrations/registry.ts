/**
 * Central Integration Registry for Applivo
 * ========================================
 * Strategic catalog organized into three clear architectural types:
 * 1. Job Sources (Platforms & Job Boards from which Applivo discovers openings)
 * 2. Connected Services (User-authorized OAuth/API services for mail, calendar, portfolio & storage)
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
    description: "Multi-market job search aggregation with real-time salary benchmarks and regional listing feeds.",
    summary: "Aggregate verified job listings and salary insights directly into Applivo via Adzuna's documented job-search API.",
    logo: "/logos/adzuna.png",
    logoAlt: "Adzuna Logo",
    featured: true,
    status: "High Priority",
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
    description: "Company job board discovery and listing synchronization directly from organization boards.",
    summary: "Synchronize published openings from company Greenhouse boards directly into your Applivo discovery feed.",
    logo: "/logos/greenhouse.svg",
    logoAlt: "Greenhouse Logo",
    featured: true,
    status: "Available",
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
    description: "Real-time opportunity synchronization and structured role retrieval using Lever's public postings API.",
    summary: "Fetch and index structured career opportunities from companies using Lever ATS for real-time match scoring.",
    logo: "/logos/lever.svg",
    logoAlt: "Lever Logo",
    featured: true,
    status: "Available",
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
    description: "Company career page job discovery powered by Ashby's public job board API.",
    summary: "Discover published job openings from fast-growing startups using Ashby's public career page API.",
    logo: "/logos/ashby.png",
    logoAlt: "Ashby Logo",
    featured: false,
    status: "Available",
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
    description: "Curated worldwide remote job listings for software engineering, product, and design roles.",
    summary: "Explore verified remote-first opportunities with transparent source attribution and geographic criteria.",
    logo: "/logos/remotive.png",
    logoAlt: "Remotive Logo",
    featured: false,
    status: "Available",
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
    tag: "Roadmap",
    description: "Planned session connection and job matching for professional networking opportunities.",
    summary: "Under development: structured job discovery and application draft assistance for professional networks.",
    logo: "/logos/linkedin.svg",
    logoAlt: "LinkedIn Logo",
    featured: false,
    status: "Roadmap",
    capabilities: [
      "Opportunity discovery matching verified career preferences",
      "Easy Apply screening question assistance and draft answers",
      "Profile link synchronization for hiring team review",
      "Status tracking for active application pipelines"
    ]
  },

  // ─── 4. EXTENDED CONNECTED SERVICES ───
  {
    id: "outlook",
    name: "Microsoft Outlook",
    category: "Connected Services",
    architectureType: "connected_service",
    badge: "Connected Service",
    tag: "Microsoft Graph",
    description: "Support for candidates using Microsoft 365 for interview scheduling and email confirmation tracking.",
    summary: "Connect your Microsoft 365 or Outlook account for integrated interview calendars and application updates.",
    logo: "/logos/outlook.png",
    logoAlt: "Microsoft Outlook Logo",
    featured: false,
    status: "Roadmap",
    capabilities: [
      "Microsoft Graph calendar event scheduling",
      "Interview reminder alerts and follow-up tasks",
      "Application receipt email detection from corporate domains",
      "Secure Microsoft identity authorization"
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
    summary: "Send real-time webhooks to Zapier or n8n to log application events into Notion, Slack, or Google Sheets.",
    logo: "/logos/zapier.png",
    logoAlt: "Zapier Logo",
    featured: false,
    status: "Available",
    capabilities: [
      "Real-time event webhooks for status updates and interview bookings",
      "Zero-code sync to Notion, Airtable, Slack, and Discord",
      "Encrypted webhook secret signing for authentic payloads",
      "Custom payload filtering by role, salary, and company"
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
    capabilities: [
      "In-situ screening question extraction on active web pages",
      "Single-click field pre-filling with manual user review",
      "Direct session security keeping credentials entirely on-device",
      "Real-time sync with candidate vault and application tracker"
    ]
  }
];
