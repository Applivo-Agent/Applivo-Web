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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
          filter: "blur(28px)",
        }}
      />

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-5 sm:p-7 md:p-8">
        {/* Floating Toolbar positioned directly above the text */}
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-4 sm:mb-5 flex items-center gap-1 sm:gap-1.5 bg-[#161618] border border-white/[0.12] rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.85)] z-20"
        >
          <button
            type="button"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Bold"
          >
            <Bold className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            type="button"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Italic"
          >
            <Italic className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            type="button"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Underline"
          >
            <Underline className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            type="button"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Link"
          >
            <Link2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            type="button"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Code"
          >
            <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-zinc-700/60 mx-1 shrink-0" />
          <button
            type="button"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-zinc-700/60 mx-1 shrink-0" />
          <button
            type="button"
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-sky-400 hover:text-sky-300 font-medium text-[11px] sm:text-xs transition-colors shrink-0"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 shrink-0" />
            Ask
          </button>
        </motion.div>

        {/* Prompt Editor Text with Styled Inline Emphasis & Blinking Cursor */}
        <div className="text-[14px] sm:text-[15px] md:text-[15.5px] leading-[1.65] font-normal text-zinc-300 relative z-10 max-w-[450px] text-left">
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
            <span className="text-sky-300 bg-sky-500/10 border border-sky-400/20 px-1.5 py-0.5 rounded font-medium text-[13.5px]">
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
      <div className="absolute inset-0 p-5 overflow-hidden pointer-events-none opacity-[0.14] select-none">
        <pre className="text-[10px] text-zinc-400 font-mono leading-[1.7] whitespace-pre-wrap">
          {workflowCodeBg}
        </pre>
      </div>

      {/* Workflow Visual Canvas with Proportional Scale */}
      <div className="flex-1 relative w-full h-full min-h-[360px] pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="relative w-[520px] h-[440px] scale-[0.80] sm:scale-[0.86] md:scale-[0.90] origin-center shrink-0">
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
            <circle cx="135" cy="248" r="8" fill="#18181B" stroke="#3F3F46" strokeWidth="1.5" />
            <path d="M 131 248 h 8 M 135 244 v 8" stroke="#A1A1AA" strokeWidth="1.2" strokeLinecap="round" />

            {/* Curve 4: Horizontal link between Node 3 and Node 4 */}
            <path
              d="M 205 325 C 260 325, 290 280, 360 265"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
          </svg>

          {/* ── Node 1: Internshala Sync (Top Center) ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute left-[38%] sm:left-[40%] top-[45px] w-[190px] sm:w-[200px] flex items-center gap-3 bg-[#18181B] border border-white/[0.14] rounded-2xl px-3.5 py-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.85)] z-20"
          >
            {/* Status Badge: Active Green Dot */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#121212] shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-black stroke-[3]" />
            </div>

            {/* Icon Box */}
            <div className="w-8 h-8 rounded-lg bg-[#008BDC] flex items-center justify-center shrink-0 font-bold text-white text-[11px] shadow-sm tracking-tight">
              IS
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white text-xs sm:text-[12.5px] font-semibold truncate leading-tight">Internshala Sync</p>
              <p className="text-zinc-400 text-[10.5px] truncate leading-tight mt-0.5">New jobs indexed</p>
            </div>
          </motion.div>

          {/* ── Node 2: AI Matcher (Mid Left) ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute left-[8%] sm:left-[10%] top-[160px] w-[185px] sm:w-[195px] flex items-center gap-3 bg-[#18181B] border border-white/[0.14] rounded-2xl px-3.5 py-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.85)] z-20"
          >
            {/* Status Badge: Active Green */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#121212] shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-black stroke-[3]" />
            </div>

            {/* Icon Box */}
            <div className="w-8 h-8 rounded-lg bg-[#27272A] border border-white/10 flex items-center justify-center shrink-0 text-amber-400 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white text-xs sm:text-[12.5px] font-semibold truncate leading-tight">AI Matcher</p>
              <p className="text-zinc-400 text-[10.5px] truncate leading-tight mt-0.5">Fit score &gt; 85%</p>
            </div>
          </motion.div>

          {/* ── Node 3: Agent Action (Bottom Left) ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute left-[8%] sm:left-[10%] top-[300px] w-[185px] sm:w-[195px] flex items-center gap-3 bg-[#18181B] border border-white/[0.14] rounded-2xl px-3.5 py-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.85)] z-20"
          >
            {/* Status Badge: Orange Key */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#f97316] rounded-full flex items-center justify-center border-2 border-[#121212] shadow-sm">
              <Wrench className="w-2.5 h-2.5 text-black stroke-[2.5]" />
            </div>

            {/* Icon Box */}
            <div className="w-8 h-8 rounded-lg bg-[#27272A] border border-white/10 flex items-center justify-center shrink-0 text-zinc-300 shadow-sm">
              <svg className="w-4 h-4 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="12" x="3" y="6" rx="2" />
                <path d="M12 2v4" />
                <path d="M2 12h1" />
                <path d="M21 12h1" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white text-xs sm:text-[12.5px] font-semibold truncate leading-tight">Agent Action</p>
              <p className="text-zinc-400 text-[10.5px] truncate leading-tight mt-0.5">Single background tab submit</p>
            </div>
          </motion.div>

          {/* ── Node 4: Application Answers (Mid Right, Tilted with Hand Cursor) ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: [0, -3, 0] }}
            transition={{
              opacity: { duration: 0.5, delay: 0.5 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute left-[48%] sm:left-[50%] md:left-[52%] top-[205px] w-[205px] sm:w-[215px] flex items-center gap-3 bg-[#18181B] border border-white/[0.16] rounded-2xl px-3.5 py-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.85)] z-30 rotate-[-2deg]"
          >
            {/* Status Badge: Amber Wrench */}
            <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[#d97706] border border-black/40 rounded-full flex items-center justify-center shadow-md">
              <Wrench className="w-2.5 h-2.5 text-white" />
            </div>

            {/* Icon Box */}
            <div className="w-8 h-8 rounded-lg bg-[#27272A] border border-white/10 flex items-center justify-center shrink-0 text-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.15)]">
              <Search className="w-3.5 h-3.5 text-sky-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white text-xs sm:text-[12.5px] font-semibold truncate leading-tight">Application Answers</p>
              <p className="text-zinc-400 text-[10.5px] truncate leading-tight mt-0.5">Screening Q&amp;A prepared</p>
            </div>

            {/* Simulated Hand Dragging Cursor */}
            <motion.div
              className="absolute -top-3 left-12 w-4.5 h-4.5 text-white pointer-events-none drop-shadow-md z-40"
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
    </div>
  );
}

/* ─── MAIN EXPORTED COMPONENT ────────────────────────────────────── */
export function WorkflowBento() {
  return (
    <div className="max-w-[1060px] mx-auto px-4 sm:px-6 relative z-10">
      {/* Two-card bento grid with refined, natural proportions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_1fr] gap-4 md:gap-5 h-auto lg:h-[430px] items-stretch">
        {/* LEFT CARD — Application Editor */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
          className="rounded-[20px] bg-[#121212] border border-white/[0.08] overflow-hidden flex flex-col h-full shadow-[0_0_80px_rgba(0,0,0,0.5)] hover:border-white/[0.16] transition-colors duration-300"
        >
          {/* Header Row */}
          <div className="flex items-center gap-2.5 px-5 py-3 sm:px-6 sm:py-3.5 border-b border-white/[0.08]">
            <Command className="w-4 h-4 text-zinc-400" strokeWidth={1.8} />
            <span className="text-[#e5e5e5] font-semibold text-[14px] sm:text-[14.5px] tracking-tight">
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
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
          className="rounded-[20px] bg-[#121212] border border-white/[0.08] overflow-hidden flex flex-col h-full shadow-[0_0_80px_rgba(0,0,0,0.5)] hover:border-white/[0.16] transition-colors duration-300"
        >
          {/* Header Row */}
          <div className="flex items-center gap-2.5 px-5 py-3 sm:px-6 sm:py-3.5 border-b border-white/[0.08]">
            <Network className="w-4 h-4 text-zinc-400" strokeWidth={1.8} />
            <span className="text-[#e5e5e5] font-semibold text-[14px] sm:text-[14.5px] tracking-tight">
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
