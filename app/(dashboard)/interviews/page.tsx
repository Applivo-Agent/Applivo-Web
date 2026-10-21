"use client";
import React from "react";
import { Star, Video, Play, Calendar, User, Zap, Sparkles, CheckCircle2 , Loader2} from "lucide-react";
import { motion } from "framer-motion";

export default function InterviewsPage() {
  return (
    <div className="dash-page space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg">
          <Star className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">Interview Preparation</h1>
          <p className="text-[14px] text-zinc-400 mt-1">Simulated AI interviews and real-time prep for your upcoming rounds.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <Sparkles className="w-6 h-6 text-zinc-400 mb-3" />
          <h2 className="text-[15px] sm:text-[16px] font-semibold mb-1 text-white tracking-tight">AI Mock Interview</h2>
          <p className="text-zinc-400 mb-5 text-[13px] leading-relaxed max-w-sm">
            Our AI agent roleplays as a hiring manager. Practice technical or behavioral questions in a low-pressure environment.
          </p>
          <div className="flex items-center gap-2.5">
            <button className="h-8 px-3.5 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-2">
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Start Mock Session</span>
            </button>
            <button className="h-8 px-3.5 bg-[#171717] border border-[var(--app-border-strong)] text-white rounded-md text-[13px] font-medium hover:bg-[var(--app-card)] transition-colors">
              Configure Agent
            </button>
          </div>
        </div>

        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <Calendar className="w-6 h-6 text-zinc-400 mb-3" />
          <h2 className="text-[15px] sm:text-[16px] font-semibold mb-1 text-white tracking-tight">Upcoming Rounds</h2>
          <p className="text-zinc-400 mb-5 text-[13px] leading-relaxed max-w-sm">
            Track your scheduled interviews and get automated prep sheets for each company.
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-[12px]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center text-white font-semibold text-[12px]">R1</div>
                <div>
                  <p className="font-semibold text-white text-[13px]">Google — ML System Design</p>
                  <p className="text-zinc-400 text-[11px]">Tomorrow, 10:00 AM</p>
                </div>
              </div>
              <button className="text-white hover:underline font-semibold text-[12px]">Prep Pack</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h3 className="text-[15px] sm:text-[16px] font-semibold mb-4 flex items-center gap-2 text-white">
          <Zap className="w-4 h-4 text-zinc-400" />
          AI Performance Insights
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)]">
            <p className="text-[12px] font-medium text-zinc-400 mb-1">Clarity Score</p>
            <div className="text-[24px] leading-8 font-semibold tracking-tight text-white">84/100</div>
            <div className="w-full h-1.5 bg-black/40 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '84%' }} />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)]">
            <p className="text-[12px] font-medium text-zinc-400 mb-1">Technical Accuracy</p>
            <div className="text-[24px] leading-8 font-semibold tracking-tight text-white">92/100</div>
            <div className="w-full h-1.5 bg-black/40 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)]">
            <p className="text-[12px] font-medium text-zinc-400 mb-1">Confidence Rating</p>
            <div className="text-[24px] leading-8 font-semibold tracking-tight text-white">76/100</div>
            <div className="w-full h-1.5 bg-black/40 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '76%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
