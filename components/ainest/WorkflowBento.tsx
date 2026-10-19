"use client";

import { motion } from "framer-motion";
import {
  Bold,
  Italic,
  Underline,
  Link2,
  Code2,
  AlignLeft,
  Sparkles,
  Command,
  Network,
  CheckCircle2,
  Wrench,
  Search,
  Sparkle
} from "lucide-react";

/* ─── TECHNICAL JSON BACKGROUND TEXTURE ──────────────────────────── */
const workflowCodeBg = `{ "workflow_id": "wf_internshala_stream",
  "status": "active", "created_at": "2026-10-18T14:32:00Z",
  "source": { "platform": "internshala", "type": "job_feed" },
  "filters": { "auto_apply": true, "min_fit_score": 85 },
  "models": { "parser": "gpt-4o-mini", "ats_tailor": "active" },
  "metrics": { "scanned": 1420, "queued": 55, "applied": 21 } }
{ "agent_id": "agent_matcher_01", "role": "ats_evaluator",
  "resume_profile": "Applivo_Resume.pdf", "screening_ai": "active",
  "runtime": "single_background_tab" }
{ "verification": { "budget_cap_usd": 5.0, "status": "authorized",
  "answer_gate": "complete_or_review" } }`;

/* ─── LEFT CARD: Application Editor ──────────────────────────────── */
function ApplicationEditorCard() {
  return (
    <div className="flex flex-col h-full bg-[#121212] relative w-full overflow-hidden select-none">
      {/* Subtle ambient radial glow in the center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[220px] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
          filter: "blur(28px)"
        }}
      />

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6 sm:p-10 md:p-12">
        {/* Floating Toolbar positioned directly above the text */}
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 flex items-center gap-1 sm:gap-1.5 bg-[#161618] border border-white/[0.12] rounded-full px-3.5 py-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.85)] z-20"
        >
          <button
            type="button"
            className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Link"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Code"
          >
            <Code2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-zinc-700/60 mx-1 shrink-0" />
          <button
            type="button"
            className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-zinc-700/60 mx-1 shrink-0" />
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 text-sky-400 hover:text-sky-300 font-medium text-xs transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            Ask
          </button>
        </motion.div>

        {/* Prompt Editor Text with Styled Inline Emphasis & Blinking Cursor (4 clean lines) */}
        <div className="text-[17px] sm:text-[18px] md:text-[19px] leading-[1.7] font-normal text-zinc-300 relative z-10 max-w-[500px] text-left">
          <p>
            Find matching internships from <span className="text-white font-medium">Internshala</span>. Score
            them based on profile potential, and automatically
            route{" "}
            <span className="relative inline-block text-white bg-[#1e3a5f] border border-sky-400/50 rounded px-1.5 py-0.5 mx-0.5 font-medium shadow-sm">
              high-match opportunities
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                className="inline-block w-[2px] h-[75%] bg-white align-middle ml-1"
              />
            </span>{" "}
            to my{" "}
            <span className="text-sky-300 bg-sky-500/10 border border-sky-400/20 px-1.5 py-0.5 rounded font-medium text-[16px]">
              @dashboard
            </span>{" "}
            while auto-applying for remote roles.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── RIGHT CARD: Workflow Visual ────────────────────────────────── */
function WorkflowVisualCard() {
  return (
    <div className="flex flex-col h-full bg-[#121212] relative w-full overflow-hidden select-none">
      {/* Background Code Faint Texture */}
      <div className="absolute inset-0 p-6 overflow-hidden pointer-events-none opacity-[0.16] select-none">
        <pre className="text-[11px] text-zinc-400 font-mono leading-[1.8] whitespace-pre-wrap">
          {workflowCodeBg}
        </pre>
      </div>

      {/* Workflow Visual Canvas */}
      <div className="flex-1 relative w-full h-full min-h-[440px] pointer-events-none">
        {/* SVG Connector Curves, Vertical Line, and Junction Ports */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 520 440"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Curve 1: Node 1 (Internshala) -> Node 2 (AI Matcher) */}
          <path
            d="M 240 78 C 240 120, 135 110, 135 155"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx="185" cy="118" r="8" fill="#18181B" stroke="#3F3F46" strokeWidth="1.5" />
          <path d="M 181 118 h 8 M 185 114 v 8" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />

          {/* Curve 2: Node 1 (Internshala) -> Node 4 (Application Answers) */}
          <path
            d="M 280 78 C 280 145, 370 145, 370 215"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx="330" cy="142" r="8" fill="#18181B" stroke="#3F3F46" strokeWidth="1.5" />
          <path d="M 326 142 h 8 M 330 138 v 8" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />

          {/* Line 3: Vertical connector between Node 2 (AI Matcher) and Node 3 (Agent Action) */}
          <path
            d="M 135 205 L 135 295"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx="135" cy="250" r="8" fill="#18181B" stroke="#3F3F46" strokeWidth="1.5" />
          <path d="M 131 250 h 8 M 135 246 v 8" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />

          {/* Curve 4: Node 4 (Application Answers) -> Node 3 (Agent Action) */}
          <path
            d="M 260 250 C 240 270, 210 270, 210 295"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx="232" cy="268" r="8" fill="#18181B" stroke="#3F3F46" strokeWidth="1.5" />
          <path d="M 228 268 h 8 M 232 264 v 8" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />
        </svg>

        {/* ── Node 1: Internshala Sync (Top Center) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute left-[26%] sm:left-[28%] md:left-[30%] top-[26px] w-[215px] sm:w-[225px] flex items-center gap-3 bg-[#18181B] border border-white/[0.12] rounded-2xl px-3.5 py-3 shadow-[0_14px_36px_rgba(0,0,0,0.7)] z-20"
        >
          {/* Status Badge: Green Checkmark */}
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#059669] border border-black/40 rounded-full flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Icon Box: Internshala */}
          <div className="w-9 h-9 rounded-xl bg-[#00a5ec] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(0,165,236,0.25)]">
            <span className="text-white text-xs font-black tracking-tight">IS</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-xs sm:text-[13px] font-semibold truncate leading-tight">Internshala Sync</p>
            <p className="text-zinc-400 text-[11px] truncate leading-tight mt-0.5">New jobs indexed</p>
          </div>
        </motion.div>

        {/* ── Node 2: AI Matcher (Mid Left) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute left-[4%] sm:left-[6%] top-[155px] w-[205px] sm:w-[215px] flex items-center gap-3 bg-[#18181B] border border-white/[0.12] rounded-2xl px-3.5 py-3 shadow-[0_14px_36px_rgba(0,0,0,0.7)] z-20"
        >
          {/* Status Badge: Green Checkmark */}
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#059669] border border-black/40 rounded-full flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Icon Box: AI Matcher */}
          <div className="w-9 h-9 rounded-xl bg-[#27272A] border border-white/10 flex items-center justify-center shrink-0 text-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.15)]">
            <Sparkle className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-xs sm:text-[13px] font-semibold truncate leading-tight">AI Matcher</p>
            <p className="text-zinc-400 text-[11px] truncate leading-tight mt-0.5">Fit score &gt; 85%</p>
          </div>
        </motion.div>

        {/* ── Node 3: Agent Action (Bottom Left, directly below Node 2) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute left-[4%] sm:left-[6%] top-[295px] w-[205px] sm:w-[215px] flex items-center gap-3 bg-[#18181B] border border-white/[0.12] rounded-2xl px-3.5 py-3 shadow-[0_14px_36px_rgba(0,0,0,0.7)] z-20"
        >
          {/* Status Badge: Amber Wrench */}
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#d97706] border border-black/40 rounded-full flex items-center justify-center shadow-md">
            <Wrench className="w-2.5 h-2.5 text-white" />
          </div>

          {/* Icon Box: Robot / Bot Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(255,255,255,0.06)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-200">
              <rect width="18" height="12" x="3" y="6" rx="2" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <path d="M12 2v4" />
              <path d="M2 12h1" />
              <path d="M21 12h1" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-xs sm:text-[13px] font-semibold truncate leading-tight">Agent Action</p>
            <p className="text-zinc-400 text-[11px] truncate leading-tight mt-0.5">Single background tab submit</p>
          </div>
        </motion.div>

        {/* ── Node 4: Application Answers (Mid Right, Tilted with Hand Cursor) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: [0, -4, 0] }}
          transition={{
            opacity: { duration: 0.5, delay: 0.5 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute left-[48%] sm:left-[50%] md:left-[52%] top-[215px] w-[215px] sm:w-[225px] flex items-center gap-3 bg-[#18181B] border border-white/[0.16] rounded-2xl px-3.5 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.85)] z-30 rotate-[-2.5deg]"
        >
          {/* Status Badge: Amber Wrench */}
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#d97706] border border-black/40 rounded-full flex items-center justify-center shadow-md">
            <Wrench className="w-2.5 h-2.5 text-white" />
          </div>

          {/* Icon Box */}
          <div className="w-9 h-9 rounded-xl bg-[#27272A] border border-white/10 flex items-center justify-center shrink-0 text-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.15)]">
            <Search className="w-4 h-4 text-sky-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-xs sm:text-[13px] font-semibold truncate leading-tight">Application Answers</p>
            <p className="text-zinc-400 text-[11px] truncate leading-tight mt-0.5">Screening Q&amp;A prepared</p>
          </div>

          {/* Simulated Hand Dragging Cursor from Reference positioned at top-left edge */}
          <motion.div
            className="absolute -top-3.5 left-12 w-5 h-5 text-white pointer-events-none drop-shadow-md z-40"
            animate={{ y: [0, -2, 0], x: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 11H20V6c0-1.1-.9-2-2-2s-2 .9-2 2v2h-1V4c0-1.1-.9-2-2-2s-2 .9-2 2v4h-1V2c0-1.1-.9-2-2-2s-2 .9-2 2v9.31l-3.32-1.39c-.58-.24-1.25-.13-1.74.31-.83.74-.91 2.03-.17 2.86l5.77 6.4c1.19 1.33 2.89 2.1 4.69 2.1H18c2.76 0 5-2.24 5-5v-6c0-1.1-.9-2-2-2z" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── MAIN EXPORTED COMPONENT ────────────────────────────────────── */
export function WorkflowBento() {
  return (
    <div className="max-w-[1160px] mx-auto px-4 sm:px-6 relative z-10">
      {/* Two-card bento grid with asymmetric proportions matching Kilo reference */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_1fr] gap-4 md:gap-5 h-auto lg:h-[520px] items-stretch">
        {/* LEFT CARD — Application Editor */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          className="rounded-[24px] bg-[#121212] border border-white/[0.08] overflow-hidden flex flex-col h-full shadow-[0_0_80px_rgba(0,0,0,0.5)] hover:border-white/[0.16] transition-colors duration-300"
        >
          {/* Header Row */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.08]">
            <Command className="w-[18px] h-[18px] text-zinc-400" strokeWidth={1.8} />
            <span className="text-[#e5e5e5] font-semibold text-[16px] sm:text-[17px] tracking-tight">
              Automation Handle Applications
            </span>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-hidden relative">
            <ApplicationEditorCard />
          </div>
        </motion.div>

        {/* RIGHT CARD — Workflow Visual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
          className="rounded-[24px] bg-[#121212] border border-white/[0.08] overflow-hidden flex flex-col h-full shadow-[0_0_80px_rgba(0,0,0,0.5)] hover:border-white/[0.16] transition-colors duration-300"
        >
          {/* Header Row */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.08]">
            <Network className="w-[18px] h-[18px] text-zinc-400" strokeWidth={1.8} />
            <span className="text-[#e5e5e5] font-semibold text-[16px] sm:text-[17px] tracking-tight">
              Intelligent Job Automation
            </span>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-hidden relative">
            <WorkflowVisualCard />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
