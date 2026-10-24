"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Compass,
  CheckCircle2,
  FileText,
  Layers,
  BarChart3,
  MapPin,
  Briefcase,
  Search,
  Building2,
  Calendar,
  Lock,
  Sparkles,
  SlidersHorizontal,
  Bot,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

/* ─── MINI SIDEBAR FOR APPLIVO PREVIEW ────────────────────────── */

function PreviewSidebar({ activeTab }: { activeTab: string }) {
  const menuItems = [
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "assistant", label: "Assistant", icon: Bot },
    { id: "applications", label: "Applications", icon: Layers },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="w-[140px] sm:w-[155px] shrink-0 border-r border-white/[0.08] bg-[var(--sx-bg-0c0c0e)] p-3 flex flex-col justify-between text-xs select-none">
      <div className="space-y-3">
        {/* Workspace Brand */}
        <div className="flex items-center gap-2 px-1 py-1">
          <div className="w-5 h-5 rounded-md bg-white/[0.08] border border-white/10 flex items-center justify-center p-0.5">
            <Image
              src="/logo.png"
              alt="Applivo"
              width={14}
              height={14}
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-white text-xs tracking-tight">Applivo</span>
        </div>

        {/* Navigation list */}
        <div className="space-y-0.5 pt-1">
          <div className="px-1.5 mb-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
            Workspace
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* User tag */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 px-1">
        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-300">
          A
        </div>
        <span className="text-[10px] text-zinc-400 truncate">Candidate Profile</span>
      </div>
    </div>
  );
}

/* ─── STEP 1 PREVIEW: JOB DISCOVERY ──────────────────────────── */

function JobDiscoveryPreview() {
  const sampleJobs = [
    {
      title: "Full Stack Engineer Intern",
      company: "Razorpay",
      location: "Bengaluru / Remote",
      stipend: "₹40k–50k/mo",
      tags: ["React", "TypeScript", "Node.js"],
      match: 94,
    },
    {
      title: "Frontend Developer (Junior)",
      company: "Zerodha",
      location: "Remote (India)",
      stipend: "Full-time",
      tags: ["Next.js", "Tailwind CSS", "REST"],
      match: 88,
    },
    {
      title: "AI Software Intern",
      company: "Swiggy",
      location: "Bengaluru (Hybrid)",
      stipend: "₹45k/mo",
      tags: ["Python", "FastAPI", "LLMs"],
      match: 83,
    },
    {
      title: "Backend Engineer (Go/Python)",
      company: "Meesho",
      location: "Bengaluru / Remote",
      stipend: "₹50k/mo",
      tags: ["Golang", "PostgreSQL", "Docker"],
      match: 81,
    },
  ];

  return (
    <div className="flex h-full w-full bg-[var(--sx-bg-0c0c0e)] text-zinc-300 font-sans select-none overflow-hidden">
      <PreviewSidebar activeTab="jobs" />

      <div className="flex-1 flex flex-col p-3.5 sm:p-4 text-xs overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Breadcrumb + Search */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span>Jobs</span>
            <span>›</span>
            <span className="text-zinc-300 font-medium">Recommended Feed</span>
          </div>
          <span className="text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
            4 matches today
          </span>
        </div>

        {/* Search & Filter row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 bg-[var(--sx-bg-141417)] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-zinc-400 text-[11px]">
            <Search className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-500">Filter by role, skills, location...</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 bg-[var(--sx-bg-141417)] border border-white/[0.07] rounded-lg text-[10px] text-zinc-300">
            <SlidersHorizontal className="w-2.5 h-2.5" />
            <span>&gt; 80% Match</span>
          </div>
        </div>

        {/* Job Cards List */}
        <div className="space-y-2">
          {sampleJobs.map((job, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[var(--sx-bg-131316)] border border-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-[12px] font-semibold text-white truncate">
                    {job.title}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-zinc-400">
                  <span className="text-zinc-300 font-medium">{job.company}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-zinc-500" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span>{job.stipend}</span>
                </div>
                <div className="flex items-center gap-1 pt-0.5">
                  {job.tags.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.2 text-[9px] rounded bg-white/[0.04] border border-white/[0.05] text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match Score Badge */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white font-mono text-[11px] font-semibold">
                  <Sparkles className="w-2.5 h-2.5 text-zinc-400" />
                  <span>{job.match}%</span>
                </div>
                <span className="text-[9.5px] text-zinc-400 hover:text-white flex items-center gap-0.5 cursor-pointer">
                  Details <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── STEP 2 PREVIEW: PREPARE AND APPLY ──────────────────────── */

function PrepareAndApplyPreview() {
  return (
    <div className="flex h-full w-full bg-[var(--sx-bg-0c0c0e)] text-zinc-300 font-sans select-none overflow-hidden">
      <PreviewSidebar activeTab="assistant" />

      <div className="flex-1 flex flex-col p-3.5 sm:p-4 text-xs overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span>Companion</span>
            <span>›</span>
            <span className="text-zinc-300 font-medium">Application Assistant</span>
          </div>
        </div>

        {/* Selected Job Context Card */}
        <div className="p-3 rounded-xl bg-[var(--sx-bg-141417)] border border-white/[0.07] mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                Target Role
              </p>
              <h4 className="text-xs font-bold text-white mt-0.5">
                Software Engineer Intern • PhonePe
              </h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400">Selected Resume</span>
              <p className="text-[11px] text-zinc-200 font-medium flex items-center gap-1">
                <FileText className="w-3 h-3 text-zinc-400" />
                Alex_Dev_2026.pdf
              </p>
            </div>
          </div>
        </div>

        {/* Application Readiness Checklist */}
        <div className="space-y-2 mb-3">
          <p className="text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider pl-0.5">
            Application Readiness Checklist
          </p>

          <div className="p-2.5 rounded-lg bg-[var(--sx-bg-121215)] border border-white/[0.05] space-y-2 text-[11px]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Profile & contact fields aligned</p>
                <p className="text-[10px] text-zinc-500">Full name, email, GitHub, LinkedIn verified</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Resume skills matching requirements</p>
                <p className="text-[10px] text-zinc-500">Python, SQL, REST APIs highlighted for this ATS</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">AI-assisted response draft generated</p>
                <p className="text-[10px] text-zinc-500">Tailored 120-word response to: &quot;Why are you a good fit?&quot;</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Custom salary & eligibility expectations set</p>
                <p className="text-[10px] text-zinc-500">Auto-configured to match employer questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-1 flex items-center justify-between gap-2 border-t border-white/[0.05]">
          <span className="text-[10px] text-zinc-500">Supported portal: Internshala</span>
          <button className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-[11px] font-semibold transition-all">
            Autofill with Extension
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP 3 PREVIEW: TRACK YOUR PROGRESS ────────────────────── */

function TrackProgressPreview() {
  const trackerItems = [
    {
      company: "Cred",
      role: "Frontend Engineer Intern",
      status: "Interview Scheduled",
      statusColor: "text-white bg-white/10 border-white/20",
      date: "Nov 2, 2:00 PM",
    },
    {
      company: "Groww",
      role: "SWE (Full-Time)",
      status: "Assessment Pending",
      statusColor: "text-zinc-300 bg-white/[0.05] border-white/10",
      date: "Due in 2 days",
    },
    {
      company: "Postman",
      role: "API Platform Intern",
      status: "Application Viewed",
      statusColor: "text-zinc-400 bg-white/[0.04] border-white/[0.08]",
      date: "3 days ago",
    },
    {
      company: "Urban Company",
      role: "Software Developer",
      status: "Under Review",
      statusColor: "text-zinc-400 bg-white/[0.04] border-white/[0.08]",
      date: "5 days ago",
    },
    {
      company: "Flipkart",
      role: "Software Development Intern",
      status: "Application Submitted",
      statusColor: "text-zinc-500 bg-white/[0.03] border-white/[0.06]",
      date: "1 week ago",
    },
  ];

  return (
    <div className="flex h-full w-full bg-[var(--sx-bg-0c0c0e)] text-zinc-300 font-sans select-none overflow-hidden">
      <PreviewSidebar activeTab="applications" />

      <div className="flex-1 flex flex-col p-3.5 sm:p-4 text-xs overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span>Applications</span>
            <span>›</span>
            <span className="text-zinc-300 font-medium">Tracking Overview</span>
          </div>
          <span className="text-[10px] text-zinc-400">Last updated: Today</span>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-4 gap-2 mb-3.5">
          {[
            { label: "Submitted", val: "28" },
            { label: "Under Review", val: "14" },
            { label: "Interviews", val: "4" },
            { label: "Avg Match", val: "86%" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-2 rounded-lg bg-[var(--sx-bg-141417)] border border-white/[0.06] text-center"
            >
              <p className="text-white font-bold text-sm leading-tight">{stat.val}</p>
              <p className="text-[9px] text-zinc-400 mt-0.5 truncate">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Applications pipeline list */}
        <div className="space-y-1.5">
          <p className="text-[10.5px] font-semibold text-zinc-400 uppercase tracking-wider pl-0.5">
            Active Applications
          </p>

          <div className="divide-y divide-white/[0.04] rounded-lg bg-[var(--sx-bg-121215)] border border-white/[0.05] overflow-hidden">
            {trackerItems.map((item, i) => (
              <div
                key={i}
                className="px-3 py-2 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-white font-medium text-[11.5px] truncate">
                    {item.role}
                  </p>
                  <p className="text-[10px] text-zinc-400">{item.company}</p>
                </div>

                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span
                    className={`text-[9.5px] font-medium px-2 py-0.5 rounded-full border ${item.statusColor}`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[9px] text-zinc-500">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP DEFINITIONS ───────────────────────────────────────── */

const steps = [
  {
    id: 1,
    label: "Discover",
    heading: "Know which listings are worth your time",
    body: "Applivo collects Internshala listings and compares each one with your resume. You see a match score, the skills you already have and the ones you are missing, so you can pick what to apply to.",
    bullets: [
      { icon: Compass, text: "Listings collected for your role and location" },
      { icon: Sparkles, text: "Match score with matching and missing skills" },
      { icon: FileText, text: "Requirements and eligibility in one view" },
    ],
    note: "Needs a resume and an Internshala account. The preview shows sample listings.",
    mockup: <JobDiscoveryPreview />,
  },
  {
    id: 2,
    label: "Prepare",
    heading: "Get your answers ready, then choose how to run",
    body: "Applivo drafts answers to screening questions from your own profile and resume only. If you lack a requirement, the draft says so. The Companion extension then fills the Internshala form in your Chrome. You choose whether each run submits automatically or stops for your review.",
    bullets: [
      { icon: FileText, text: "One profile and resume reused everywhere" },
      { icon: Bot, text: "Answers grounded in your own facts" },
      { icon: CheckCircle2, text: "Autofill with validation; pauses on CAPTCHAs" },
    ],
    note: "Needs Chrome, the Companion extension and a paid plan. Works on Internshala today. You start each run. Sample data shown.",
    mockup: <PrepareAndApplyPreview />,
  },
  {
    id: 3,
    label: "Track",
    heading: "See where every application stands",
    body: "Every application you send through Applivo lands on one board with its status. Check what is pending, export your history, and see how your search is going.",
    bullets: [
      { icon: Layers, text: "Board and table of all applications" },
      { icon: Calendar, text: "Follow-ups and interviews (Pro and Premium)" },
      { icon: BarChart3, text: "Progress analytics and CSV export" },
    ],
    note: "Statuses come from runs you start and updates you record. The preview shows sample data.",
    mockup: <TrackProgressPreview />,
  },
];

/* ─── MAIN COMPONENT ─────────────────────────────────────────── */

export function HowItWorksSteps() {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const step = steps[active];

  useEffect(() => {
    if (isHovered) return;

    // Check prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % steps.length);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [active, isHovered]);

  return (
    <div className="relative w-full overflow-x-clip">
      <section
        className="relative w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* ── LEFT COLUMN ────────────────────────────────────────── */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Step pills */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--sx-bg-141416)] border border-white/[0.08] mb-6 w-fit shadow-sm">
              {steps.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-medium transition-all duration-200 ${
                    active === i
                      ? "bg-white text-black font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="opacity-60">{s.id}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Animated step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Heading: approximate desktop 28–32px */}
                <h3 className="text-2xl sm:text-[28px] lg:text-[30px] font-semibold text-white tracking-[-0.02em] leading-[1.25] mb-3">
                  {step.heading}
                </h3>

                {/* Body description: 15–16px, line-height 1.5–1.65 */}
                <p className="text-[13px] sm:text-[13.5px] text-zinc-400 leading-[1.6] mb-6 max-w-[420px]">
                  {step.body}
                </p>

                {/* Feature list: 14–15px labels with restrained icons */}
                <div className="flex flex-col gap-3">
                  {step.bullets.map((b, i) => {
                    const Icon = b.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 text-white font-medium text-[14px] sm:text-[14.5px]"
                      >
                        <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span>{b.text}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-5 max-w-[420px] text-[12.5px] leading-relaxed text-zinc-500">{step.note}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── RIGHT COLUMN: APPLIVO PRODUCT PREVIEW ──────────────── */}
          <div className="lg:col-span-7 w-full relative">
            <div
              className="mockup-fade w-full lg:w-[120%] lg:max-w-none rounded-2xl border border-white/[0.08] bg-[var(--sx-bg-0d0d10)] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)] flex flex-col h-[440px] sm:h-[490px] lg:h-[570px] relative lg:-mt-12 lg:translate-x-4 overflow-hidden select-none"
              style={{
                maskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 98%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 98%)",
              }}
            >
              {/* Clean top chrome with Applivo URL */}
              <div className="h-10 bg-[var(--sx-bg-121215)] border-b border-white/[0.08] px-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[var(--sx-bg-1b1b1f)] border border-white/[0.06] rounded-md px-2.5 py-1 text-[11px] text-zinc-400 min-w-[190px]">
                    <Lock className="w-3 h-3 text-zinc-500" />
                    <span>https://app.applivo.in</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/[0.10]" />
                  <div className="w-2 h-2 rounded-full bg-white/[0.10]" />
                  <div className="w-2 h-2 rounded-full bg-white/[0.10]" />
                </div>
              </div>

              {/* Inner product preview view */}
              <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="h-full w-full"
                  >
                    {step.mockup}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom dissolve overlay for rich gradual blend into page background */}
              <div
                className="mockup-dissolve pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--sx-bg-080808)] via-[color-mix(in_srgb,var(--sx-bg-080808)_75%,transparent)] to-transparent z-20"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}