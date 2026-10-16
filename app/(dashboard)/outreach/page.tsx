"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, Circle, X, Send,
  ChevronRight, Mail, Building2, BarChart2,
  Edit2, Check, XCircle, SendHorizonal, Play,
  Brain, Search, Users, PenLine, Sparkle,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

type PipelineStep = {
  step: string;
  message: string;
  status: "running" | "complete" | "failed";
  ts: string;
};

type Session = {
  id: string;
  status: string;
  autopilot: boolean;
  pipeline_log: PipelineStep[];
  career_profile: any;
  stats: Record<string, number>;
  error_msg?: string;
  preferences: any;
  created_at: string;
};

type Draft = {
  id: string;
  subject: string;
  body: string;
  quality_score: number;
  status: string;
  job_lead: {
    company_name: string;
    job_title: string;
    location: string;
    is_remote: boolean;
    match_score: number;
    tech_stack: string[];
    company_intel: { what_they_do?: string };
    why_match: string;
    job_url?: string;
  };
  recruiter: {
    name?: string;
    email: string;
    title?: string;
    rank: string;
  };
};

// ── Pipeline step config ───────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { key: "BUILDING_INTELLIGENCE", label: "Building Career Intelligence", sub: "Reading profile, GitHub & resumes",    icon: Brain   },
  { key: "DISCOVERING_JOBS",      label: "Discovering Opportunities",    sub: "Finding companies that match you",     icon: Search  },
  { key: "FINDING_RECRUITERS",    label: "Finding Recruiters",           sub: "Locating hiring managers & contacts",  icon: Users   },
  { key: "WRITING_EMAILS",        label: "Writing Personalized Emails",  sub: "Crafting unique emails per recruiter", icon: PenLine },
  { key: "AWAITING_APPROVAL",     label: "Ready for Review",             sub: "All emails queued for your approval",  icon: Sparkle },
];

const RUNNING_STATUSES = new Set([
  "PENDING", "BUILDING_INTELLIGENCE", "DISCOVERING_JOBS",
  "RESEARCHING_COMPANIES", "FINDING_RECRUITERS", "WRITING_EMAILS",
]);

// ── Hooks ─────────────────────────────────────────────────────────────────

function useSessions() {
  return useQuery({
    queryKey: ["agent-sessions"],
    queryFn: async () => {
      const res = await api.get("/agent-outreach/sessions");
      return res.data as Session[];
    },
    staleTime: 5_000,
  });
}

function useSession(id: string | null) {
  return useQuery({
    queryKey: ["agent-session", id],
    queryFn: async () => {
      const res = await api.get(`/agent-outreach/sessions/${id}`);
      return res.data as Session;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data as Session | undefined;
      return data && RUNNING_STATUSES.has(data.status) ? 2000 : false;
    },
  });
}

function useAgentStats() {
  return useQuery({
    queryKey: ["agent-stats"],
    queryFn: async () => {
      const res = await api.get("/agent-outreach/stats");
      return res.data as Record<string, number>;
    },
    staleTime: 30_000,
  });
}

// ── Job Preferences Form ──────────────────────────────────────────────────

function OutreachForm({ onStarted }: { onStarted: (id: string) => void }) {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("India");
  const [experience, setExperience] = useState("0-2 years");
  const [employmentType, setEmploymentType] = useState("full-time");
  const [autopilot, setAutopilot] = useState(false);

  const startMut = useMutation({
    mutationFn: async () => {
      const res = await api.post("/agent-outreach/sessions", {
        query,
        location,
        experience,
        employment_type: employmentType,
        autopilot,
      });
      return res.data as Session;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["agent-sessions"] });
      qc.invalidateQueries({ queryKey: ["agent-stats"] });
      onStarted(data.id);
    },
  });

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">New Outreach</h1>
        <p className="text-sm text-zinc-500 mt-1.5">
          Describe the role you want. The agent finds companies, discovers recruiters, and writes personalized emails.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl overflow-hidden">

        {/* Query section */}
        <div className="px-6 py-6 border-b border-zinc-800">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 block">
            Target Role / Opportunity
          </label>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={"e.g. AI Engineer internship at AI startups in India\nor Backend SWE role at Series A companies\nor ML Engineer at product companies in Bangalore"}
            rows={4}
            className="w-full bg-transparent text-base text-white placeholder-zinc-700 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Preferences row */}
        <div className="grid grid-cols-3 divide-x divide-zinc-800 border-b border-zinc-800">
          <div className="px-5 py-5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2 block">Location</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="India, Remote..."
              className="w-full bg-transparent text-sm text-white placeholder-zinc-700 focus:outline-none"
            />
          </div>
          <div className="px-5 py-5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2 block">Experience</label>
            <select
              value={experience}
              onChange={e => setExperience(e.target.value)}
              className="w-full bg-transparent text-sm text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="intern" className="bg-[#1c1c1e]">Internship</option>
              <option value="0-2 years" className="bg-[#1c1c1e]">0–2 Years (Fresher)</option>
              <option value="2-5 years" className="bg-[#1c1c1e]">2–5 Years (Mid)</option>
              <option value="5+ years" className="bg-[#1c1c1e]">5+ Years (Senior)</option>
            </select>
          </div>
          <div className="px-5 py-5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2 block">Type</label>
            <div className="flex gap-2">
              {[["full-time", "Full Time"], ["internship", "Intern"], ["contract", "Contract"]].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setEmploymentType(v)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                    employmentType === v
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: autopilot + button */}
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <button
            onClick={() => setAutopilot(v => !v)}
            className="flex items-center gap-3 group"
          >
            <div className={cn(
              "w-8 h-4 rounded-full border transition-all relative flex-shrink-0",
              autopilot ? "bg-amber-500 border-amber-400" : "bg-zinc-800 border-zinc-700"
            )}>
              <div className={cn(
                "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                autopilot ? "left-4" : "left-0.5"
              )} />
            </div>
            <div className="text-left">
              <span className={cn("text-[11px] font-bold", autopilot ? "text-amber-400" : "text-zinc-500")}>
                {autopilot ? "Autopilot ON" : "Autopilot OFF"}
              </span>
              <span className="text-[10px] text-zinc-600 ml-2">
                {autopilot ? "auto-approve all emails" : "review before sending"}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {startMut.isError && (
              <p className="text-xs text-red-400">
                {(startMut.error as any)?.response?.data?.detail || "Failed. Check connections."}
              </p>
            )}
            <button
              onClick={() => startMut.mutate()}
              disabled={!query.trim() || startMut.isPending}
              className="flex items-center gap-2.5 px-7 py-3 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold uppercase tracking-widest transition-all"
            >
              {startMut.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin text-black" /> Starting...</>
              ) : (
                <><Play className="w-4 h-4" /> Start Outreach</>
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-zinc-600">
        Agent reads your GitHub and resume automatically. —{" "}
        <a href="/outreach/settings" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          Manage connections →
        </a>
      </p>
    </div>
  );
}

// ── Pipeline Progress ─────────────────────────────────────────────────────

function StepIcon({ icon: Icon, isActive, isComplete }: { icon: any; isActive: boolean; isComplete: boolean }) {
  if (isComplete) {
    return (
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center"
      >
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      </motion.div>
    );
  }
  if (isActive) {
    return (
      <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center relative">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-xl bg-white/[0.04]"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Icon className="w-5 h-5 text-white relative z-10" />
        </motion.div>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
      <Icon className="w-5 h-5 text-zinc-700" />
    </div>
  );
}

function PipelineView({ session }: { session: Session }) {
  const log = session.pipeline_log || [];
  const logMap = Object.fromEntries(log.map(l => [l.step, l]));
  const isRunning = RUNNING_STATUSES.has(session.status);
  const isFailed = session.status === "FAILED";
  const isDone = session.status === "AWAITING_APPROVAL";

  const activeStep = PIPELINE_STEPS.find(s => session.status === s.key);

  return (
    <div className="space-y-5">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {isFailed ? "Pipeline Failed" : isDone ? "Ready for Review" : "Agent Running"}
          </h2>
          <p className={cn(
            "text-sm mt-0.5",
            isFailed ? "text-red-400" : isDone ? "text-emerald-400" : "text-zinc-500"
          )}>
            {isFailed
              ? session.error_msg
              : isDone
              ? "All emails written and ready for your approval"
              : activeStep
              ? activeStep.sub
              : "Initializing pipeline..."}
          </p>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]">
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white"
            />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Live</span>
          </div>
        )}
      </div>

      {/* Step grid */}
      <div className="grid grid-cols-1 gap-3">
        {PIPELINE_STEPS.map((step, idx) => {
          const entry = logMap[step.key];
          const isComplete = entry?.status === "complete";
          const isActive = session.status === step.key && entry?.status === "running";
          const isPending = !isComplete && !isActive;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, ease: "easeOut" }}
              className={cn(
                "relative flex items-center gap-5 px-6 py-5 rounded-2xl border transition-all overflow-hidden",
                isComplete
                  ? "bg-[#1a1f1a] border-emerald-500/20"
                  : isActive
                  ? "bg-[#1c1c1e] border-white/15"
                  : "bg-[#161616] border-zinc-800/50"
              )}
            >
              {/* Active glow strip */}
              {isActive && (
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-white rounded-full"
                />
              )}
              {isComplete && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400/60 rounded-full" />
              )}

              <StepIcon icon={step.icon} isActive={isActive} isComplete={isComplete} />

              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-bold",
                  isComplete ? "text-emerald-300" : isActive ? "text-white" : "text-zinc-600"
                )}>
                  {step.label}
                </p>
                <p className={cn(
                  "text-xs mt-0.5 truncate",
                  isComplete ? "text-emerald-600/80"
                    : isActive && entry?.message ? "text-zinc-400"
                    : "text-zinc-700"
                )}>
                  {isActive && entry?.message ? entry.message : step.sub}
                </p>
              </div>

              <div className="flex-shrink-0">
                {isComplete && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Done</span>
                )}
                {isActive && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Active</span>
                )}
                {isPending && (
                  <Circle className="w-3.5 h-3.5 text-zinc-800" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {isDone && (
        <div className="grid grid-cols-3 gap-4 pt-1">
          {[
            { label: "Jobs Discovered",   value: session.stats?.jobs_found ?? 0       },
            { label: "Recruiters Found",  value: session.stats?.recruiters_found ?? 0 },
            { label: "Emails Written",    value: session.stats?.emails_drafted ?? 0   },
          ].map(s => (
            <div key={s.label} className="p-5 rounded-2xl bg-[#1c1c1e] border border-zinc-800">
              <p className={cn(
                "text-3xl font-bold tabular-nums tracking-tight",
                s.value > 0 ? "text-white" : "text-zinc-800"
              )}>
                {s.value}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Email Draft Card ───────────────────────────────────────────────────────

function DraftCard({ draft, onApprove, onReject, onSend, onEdit }: {
  draft: Draft;
  onApprove: () => void;
  onReject: () => void;
  onSend: () => void;
  onEdit: (d: Draft) => void;
}) {
  const lead = draft.job_lead;
  const recruiter = draft.recruiter;
  const qColor = draft.quality_score >= 80 ? "#10b981" : draft.quality_score >= 65 ? "#f59e0b" : "#ef4444";
  const isSent = ["SENT", "OPENED", "REPLIED"].includes(draft.status);
  const isApproved = draft.status === "APPROVED";
  const isRejected = draft.status === "REJECTED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-[#1c1c1e] border rounded-2xl overflow-hidden transition-all",
        isSent ? "border-emerald-500/20"
          : isRejected ? "border-zinc-800/50 opacity-50"
          : isApproved ? "border-blue-500/25"
          : "border-zinc-800 hover:border-white/20"
      )}
    >
      {/* Company header */}
      <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#222] border border-zinc-800 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white truncate">{lead?.company_name}</p>
            <p className="text-[11px] text-zinc-500 truncate">
              {lead?.job_title}{lead?.location ? ` · ${lead.location}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {lead?.match_score != null && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              {Math.round(lead.match_score)}% match
            </span>
          )}
          {isSent && <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">✓ Sent</span>}
          {isRejected && <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Skipped</span>}
          {isApproved && <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Approved</span>}
        </div>
      </div>

      {/* Email content */}
      <div className="px-5 py-4 space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">To</p>
          <p className="text-[12px] text-zinc-300">
            {recruiter?.name ? `${recruiter.name} · ` : ""}{recruiter?.email}
            {recruiter?.title && <span className="text-zinc-600 ml-1">({recruiter.title})</span>}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Subject</p>
          <p className="text-[13px] font-semibold text-white">{draft.subject}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Email</p>
          <p className="text-[12px] text-zinc-300 leading-relaxed whitespace-pre-wrap line-clamp-5">{draft.body}</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${draft.quality_score ?? 0}%`, background: qColor }}
              />
            </div>
            <span className="text-[10px] font-bold" style={{ color: qColor }}>
              {(draft.quality_score ?? 0).toFixed(0)}/100
            </span>
          </div>
          {(lead?.tech_stack?.length ?? 0) > 0 && (
            <div className="flex gap-1">
              {lead.tech_stack.slice(0, 3).map((t: string) => (
                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#1d1d1d] border border-zinc-800 text-zinc-500">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isSent && !isRejected && (
        <div className="px-5 pb-4 flex gap-2">
          {draft.status === "DRAFT" && (
            <>
              <button
                onClick={onReject}
                className="py-2 px-3 rounded-xl border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all"
              >
                Skip
              </button>
              <button
                onClick={() => onEdit(draft)}
                className="py-2 px-3 rounded-xl border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={onApprove}
                className="flex-1 py-2 rounded-xl bg-[#1d1d1d] hover:bg-[#222] border border-white/[0.08] hover:border-emerald-500/40 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-emerald-400 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Approve
              </button>
            </>
          )}
          {isApproved && (
            <button
              onClick={onSend}
              className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" /> Send via Gmail
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────

function EditModal({ draft, onClose, onSaved }: {
  draft: Draft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [subject, setSubject] = useState(draft.subject || "");
  const [body, setBody] = useState(draft.body || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/agent-outreach/drafts/${draft.id}`, { subject, body });
      qc.invalidateQueries({ queryKey: ["agent-session-drafts"] });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-[#1c1c1e] border border-zinc-800 rounded-2xl flex flex-col max-h-[90vh] shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-white">
            Edit Email — {draft.job_lead?.company_name}
          </h2>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-white/[0.05]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
              Subject
            </label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#1d1d1d] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
              Email Body
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={14}
              className="w-full px-3 py-2.5 bg-[#1d1d1d] border border-white/[0.08] rounded-xl text-sm text-white leading-relaxed focus:outline-none focus:border-white/25 transition-colors resize-none"
            />
            <p className="text-[10px] text-zinc-600 mt-1">
              {body.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !subject.trim() || !body.trim()}
            className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-sm font-bold uppercase tracking-widest text-black transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Check className="w-4 h-4" />}
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Approval Queue ────────────────────────────────────────────────────────

function ApprovalQueue({ session }: { session: Session }) {
  const qc = useQueryClient();
  const [editTarget, setEditTarget] = useState<Draft | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  const { data: drafts = [], refetch } = useQuery({
    queryKey: ["agent-session-drafts", session.id],
    queryFn: async () => {
      const res = await api.get(`/agent-outreach/sessions/${session.id}/drafts`);
      return res.data as Draft[];
    },
    staleTime: 5_000,
  });

  const approveMut = useMutation({
    mutationFn: async (id: string) => api.post(`/agent-outreach/drafts/${id}/approve`),
    onSuccess: () => refetch(),
  });

  const rejectMut = useMutation({
    mutationFn: async (id: string) => api.post(`/agent-outreach/drafts/${id}/reject`),
    onSuccess: () => refetch(),
  });

  const sendMut = useMutation({
    mutationFn: async (id: string) => api.post(`/agent-outreach/drafts/${id}/send`),
    onSuccess: () => refetch(),
  });

  const [approvingAll, setApprovingAll] = useState(false);

  const approveAll = async () => {
    setApprovingAll(true);
    try {
      await api.post(`/agent-outreach/sessions/${session.id}/approve-all`);
      refetch();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Approve all failed");
    } finally {
      setApprovingAll(false);
    }
  };

  const sendAll = async () => {
    setSendingAll(true);
    try {
      const res = await api.post(`/agent-outreach/sessions/${session.id}/send-all`);
      setSendResult(res.data);
      refetch();
      qc.invalidateQueries({ queryKey: ["agent-stats"] });
      qc.invalidateQueries({ queryKey: ["agent-session", session.id] });
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Send failed");
    } finally {
      setSendingAll(false);
    }
  };

  const pending = drafts.filter(d => d.status === "DRAFT");
  const approved = drafts.filter(d => d.status === "APPROVED");
  const sent = drafts.filter(d => ["SENT", "OPENED", "REPLIED"].includes(d.status));

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">Review Emails</h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {pending.length} pending · {approved.length} approved · {sent.length} sent
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <button
              onClick={approveAll}
              disabled={approvingAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.12] disabled:opacity-50 text-emerald-400 text-sm font-bold uppercase tracking-widest transition-colors"
            >
              {approvingAll
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Check className="w-4 h-4" />}
              Approve All ({pending.length})
            </button>
          )}
          {approved.length > 0 && (
            <button
              onClick={sendAll}
              disabled={sendingAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-sm font-bold uppercase tracking-widest transition-colors"
            >
              {sendingAll
                ? <Loader2 className="w-4 h-4 animate-spin text-black" />
                : <SendHorizonal className="w-4 h-4" />}
              Send All ({approved.length})
            </button>
          )}
        </div>
      </div>

      {/* Send result banner */}
      {sendResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-emerald-300 font-bold">
              {sendResult.sent} email{sendResult.sent !== 1 ? "s" : ""} sent successfully
              {sendResult.failed > 0 && ` · ${sendResult.failed} failed`}
            </p>
          </div>
          <button onClick={() => setSendResult(null)} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {drafts.length === 0 ? (
        <div className="text-center py-16 bg-[#1c1c1e] border border-zinc-800 rounded-2xl">
          <Loader2 className="w-8 h-8 text-zinc-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-500">Loading emails...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onApprove={() => approveMut.mutate(draft.id)}
              onReject={() => rejectMut.mutate(draft.id)}
              onSend={() => sendMut.mutate(draft.id)}
              onEdit={d => setEditTarget(d)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {editTarget && (
          <EditModal
            key={editTarget.id}
            draft={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={() => refetch()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Stats Dashboard ────────────────────────────────────────────────────────

function StatsDashboard() {
  const { data: stats } = useAgentStats();
  const { data: sessions = [] } = useSessions();

  const cards = [
    { label: "Jobs Found",     value: stats?.jobs_found ?? 0           },
    { label: "Companies",      value: stats?.companies_researched ?? 0 },
    { label: "Recruiters",     value: stats?.recruiters_found ?? 0     },
    { label: "Emails Sent",    value: stats?.emails_sent ?? 0          },
    { label: "Opened",         value: stats?.emails_opened ?? 0        },
    { label: "Replies",        value: stats?.replies ?? 0              },
    { label: "Pending Review", value: stats?.pending_approval ?? 0     },
    { label: "Interviews",     value: stats?.interviews ?? 0           },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl p-6"
          >
            <p className={cn(
              "text-4xl font-bold tabular-nums tracking-tight",
              c.value > 0 ? "text-white" : "text-zinc-800"
            )}>
              {c.value}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mt-2">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {sessions.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-4">
            Recent Sessions
          </p>
          <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
            {sessions.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-5 px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  s.status === "AWAITING_APPROVAL" ? "bg-emerald-400"
                    : s.status === "COMPLETE" ? "bg-zinc-700"
                    : s.status === "FAILED" ? "bg-red-500"
                    : "bg-white animate-pulse"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 truncate font-medium">
                    {s.preferences?.query || "Outreach run"}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-xs text-zinc-500 flex-shrink-0">
                  <div>
                    <span className={cn("font-bold", (s.stats?.jobs_found ?? 0) > 0 ? "text-zinc-300" : "text-zinc-700")}>
                      {s.stats?.jobs_found ?? 0}
                    </span>
                    <span className="text-zinc-700 ml-1">jobs</span>
                  </div>
                  <div>
                    <span className={cn("font-bold", (s.stats?.recruiters_found ?? 0) > 0 ? "text-zinc-300" : "text-zinc-700")}>
                      {s.stats?.recruiters_found ?? 0}
                    </span>
                    <span className="text-zinc-700 ml-1">recruiters</span>
                  </div>
                  <div>
                    <span className={cn("font-bold", (s.stats?.emails_sent ?? 0) > 0 ? "text-white" : "text-zinc-700")}>
                      {s.stats?.emails_sent ?? 0}
                    </span>
                    <span className="text-zinc-700 ml-1">sent</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    s.status === "AWAITING_APPROVAL" ? "text-emerald-500"
                      : s.status === "FAILED" ? "text-red-500"
                      : RUNNING_STATUSES.has(s.status) ? "text-zinc-400"
                      : "text-zinc-700"
                  )}>
                    {s.status === "AWAITING_APPROVAL" ? "Review" : s.status === "FAILED" ? "Failed" : RUNNING_STATUSES.has(s.status) ? "Running" : "Done"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

type View = "form" | "pipeline" | "approval" | "stats";

export default function OutreachPage() {
  const qc = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [view, setView] = useState<View>("form");

  const { data: session } = useSession(activeSessionId);
  const { data: sessions = [] } = useSessions();

  // Auto-switch view as session progresses
  useEffect(() => {
    if (!session) return;
    if (RUNNING_STATUSES.has(session.status)) {
      setView("pipeline");
    } else if (session.status === "AWAITING_APPROVAL") {
      setView("approval");
    } else if (session.status === "FAILED") {
      setView("pipeline");
    }
  }, [session?.status]);

  // On first load, resume the most recent active session
  useEffect(() => {
    if (activeSessionId || sessions.length === 0) return;
    const active = sessions.find(
      s => RUNNING_STATUSES.has(s.status) || s.status === "AWAITING_APPROVAL"
    );
    if (active) {
      setActiveSessionId(active.id);
      setView(RUNNING_STATUSES.has(active.status) ? "pipeline" : "approval");
    }
  }, [sessions, activeSessionId]);

  const handleStarted = (id: string) => {
    setActiveSessionId(id);
    setView("pipeline");
    qc.invalidateQueries({ queryKey: ["agent-sessions"] });
  };

  const isRunning = session && RUNNING_STATUSES.has(session.status);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 min-h-[90vh]">
      {/* Nav tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-zinc-800 pb-0">
        {[
          { key: "form",     label: "New Outreach", icon: Play      },
          { key: "approval", label: "Review",        icon: Mail      },
          { key: "stats",    label: "Sessions",      icon: BarChart2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key as View)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider transition-all relative border-b-2 -mb-px",
              view === key
                ? "border-white text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}

        {isRunning && (
          <button
            onClick={() => setView("pipeline")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider transition-all relative border-b-2 -mb-px",
              view === "pipeline" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Running
          </button>
        )}
      </div>

      {/* Views */}
      <AnimatePresence mode="wait">
        {view === "form" && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OutreachForm onStarted={handleStarted} />
          </motion.div>
        )}

        {view === "pipeline" && activeSessionId && session && (
          <motion.div key="pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PipelineView session={session} />
            {session.status === "AWAITING_APPROVAL" && (
              <div className="mt-6 max-w-lg">
                <button
                  onClick={() => setView("approval")}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  Review Emails <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {session.status === "FAILED" && (
              <div className="mt-6 max-w-lg">
                <button
                  onClick={() => { setView("form"); setActiveSessionId(null); }}
                  className="px-6 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}

        {view === "pipeline" && (!activeSessionId || !session) && (
          <motion.div key="pipeline-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="py-12 max-w-2xl">
              <p className="text-sm text-zinc-500 mb-4">No active pipeline.</p>
              <button
                onClick={() => setView("form")}
                className="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Start Outreach
              </button>
            </div>
          </motion.div>
        )}

        {view === "approval" && activeSessionId && session && (
          <motion.div key="approval" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ApprovalQueue session={session} />
          </motion.div>
        )}

        {view === "approval" && (!activeSessionId || !session) && (
          <motion.div key="approval-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="py-12 max-w-2xl">
              <p className="text-sm text-zinc-500 mb-4">No emails to review. Start an outreach session first.</p>
              <button
                onClick={() => setView("form")}
                className="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Start Outreach
              </button>
            </div>
          </motion.div>
        )}

        {view === "stats" && (
          <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StatsDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
