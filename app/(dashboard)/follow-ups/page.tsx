"use client";
import React from "react";
import { Bell, Mail, Clock, Send, CheckCircle2, AlertCircle, Sparkles , Loader2} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const followups = [
  { id: 1, company: "Amazon", role: "SDE II", status: "Scheduled", time: "in 2 hours", type: "Email" },
  { id: 2, company: "Microsoft", role: "Specialist", status: "Sent", time: "Yesterday", type: "LinkedIn" },
  { id: 3, company: "Meta", role: "Product Manager", status: "Delayed", time: "Pending", type: "Email" },
];

export default function FollowUpsPage() {
  return (
      <div className="dash-page max-w-6xl space-y-6">
        <div>
          <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">Follow-ups</h1>
          <p className="dash-subtitle mt-1">Smart reminders and automated check-ins for pending applications.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[var(--app-border-strong)] bg-[var(--app-card)] flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-white tracking-tight flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  Pending Interactions
                </h3>
                <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                  <span>Auto-pilot:</span>
                  <span className="text-white font-semibold">Enabled</span>
                </div>
              </div>
              <div className="divide-y divide-[var(--app-border-strong)]">
                {followups.map((f) => (
                  <div key={f.id} className="p-4 hover:bg-[var(--app-nested)] transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--app-nested)] text-zinc-300 border border-[var(--app-border-strong)] shrink-0">
                        {f.type === 'Email' ? <Mail className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-[13px] sm:text-[14px] font-medium text-white">{f.company}</h4>
                        <p className="text-[12px] text-zinc-400">{f.role} • {f.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300">
                        {f.status}
                      </span>
                      <button className="text-[12px] font-medium text-zinc-400 hover:text-white transition-colors">
                        Pause
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
              <h3 className="text-[15px] font-semibold text-white tracking-tight mb-4">Smart Sequence</h3>
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center text-[11px] font-medium text-zinc-300 shrink-0">1</div>
                  <p className="text-[13px] text-zinc-300"><span className="text-white font-medium">Day 3:</span> Soft check-in on application status.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center text-[11px] font-medium text-zinc-300 shrink-0">2</div>
                  <p className="text-[13px] text-zinc-300"><span className="text-white font-medium">Day 7:</span> Ask about interview timelines.</p>
                </div>
                <div className="flex items-start gap-3 opacity-40">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center text-[11px] font-medium text-zinc-400 shrink-0">3</div>
                  <p className="text-[13px] text-zinc-400"><span className="text-zinc-300 font-medium">Day 14:</span> Final follow-up and value add.</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <h3 className="text-[15px] font-semibold text-white tracking-tight">Ghosting Rate</h3>
              </div>
              <div className="text-[24px] leading-8 font-semibold tracking-tight text-white mb-1">12%</div>
              <p className="text-[12px] text-zinc-400 leading-relaxed mb-4">Your current ghosting rate is below the industry average (45%).</p>
              <div className="w-full h-1.5 bg-[var(--app-nested)] rounded-full overflow-hidden border border-[var(--app-border-strong)]">
                <div className="h-full bg-white rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
