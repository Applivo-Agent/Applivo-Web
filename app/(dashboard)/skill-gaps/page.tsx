"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { Target, BookOpen, ExternalLink, Zap, Lock, Sparkles, TrendingUp , Loader2} from "lucide-react";
import { motion } from "framer-motion";

export default function SkillGapsPage() {
  const { data: skillGaps, isLoading } = useQuery({
    queryKey: ["skill-gaps"],
    queryFn: () => analyticsApi.skillGaps().then(r => r.data),
  });
  
  const skills: Array<{ name: string; gap: string; priority: string }> = (skillGaps || []) as any;
  return (
    <div className="dash-page space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">Skill Gap Analysis</h1>
          <p className="text-[14px] text-zinc-400 mt-1">AI comparison between your profile and target job roles.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight">Target Role: Senior Platform Engineer</h3>
              <div className="px-2.5 py-0.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300 rounded-full text-[11px] font-medium">
                Overall Match: 76.5%
              </div>
            </div>
            
            <div className="space-y-3">
              {skills.map((s) => (
                <div key={s.name} className="p-3.5 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] group hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-[var(--app-card)] border border-[var(--app-border-strong)] text-zinc-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[14px] text-white">{s.name}</h4>
                        <p className="text-[11px] text-zinc-400">{s.gap} Gap — {s.priority}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 h-7 px-2.5 rounded-md bg-white text-black text-[11px] font-semibold hover:bg-zinc-200 transition-colors">
                      Learn <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
            <h3 className="text-[15px] sm:text-[16px] font-semibold mb-4 flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              AI Career Roadmap
            </h3>
            <div className="space-y-4">
              <div className="relative pl-5 pb-4 border-l border-[var(--app-border-strong)]">
                <div className="absolute top-0 left-[-4.5px] w-2 h-2 rounded-full bg-white" />
                <p className="text-[13px] font-medium text-white">Certification: CKA</p>
                <p className="text-[11px] text-zinc-500">Est: 3 Weeks</p>
              </div>
              <div className="relative pl-5 pb-1 border-l border-[var(--app-border-strong)]">
                <div className="absolute top-0 left-[-4.5px] w-2 h-2 rounded-full bg-zinc-500" />
                <p className="text-[13px] font-medium text-white">Portfolio: IaC AWS</p>
                <p className="text-[11px] text-zinc-500">Est: 2 Weeks</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-[var(--app-border-strong)] border-t-white mx-auto mb-3 flex items-center justify-center">
              <span className="text-[18px] font-semibold text-white">76%</span>
            </div>
            <p className="text-[13px] font-medium text-white mb-0.5">Career Velocity</p>
            <p className="text-[11px] text-zinc-400 font-normal">Top 5% of Applicants</p>
          </div>
        </div>
      </div>
    </div>
  );
}
