"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coverLettersApi, jobsApi } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Sparkles, FileText, Send, Wand2, ArrowRight, Clock, Crown, Download, Eye, Trash2, Plus, X , Loader2} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CoverLetter {
  id: string;
  job_id: string;
  job_title?: string;
  company_name?: string;
  tone: string;
  content: string;
  status: string;
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  company_name: string;
}

export default function CoverLettersPage() {
  const { canAccess } = useSubscription();
  const qc = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");

  const { data: letters, isLoading } = useQuery({
    queryKey: ["cover-letters"],
    queryFn: () => coverLettersApi.list().then((r) => r.data),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs-select"],
    queryFn: () => jobsApi.list({ page: 1, page_size: 50 }).then((r) => r.data.items || []),
    enabled: canAccess("cover_letters"),
  });

  const generateMutation = useMutation({
    mutationFn: (data: { job_id: string; tone: string }) => coverLettersApi.generate(data),
    onSuccess: () => {
      toast.success("Cover letter generation started");
      setShowGenerate(false);
      qc.invalidateQueries({ queryKey: ["cover-letters"] });
    },
    onError: () => {
      toast.error("Failed to start generation");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coverLettersApi.delete(id),
    onSuccess: () => {
      toast.success("Cover letter deleted");
      qc.invalidateQueries({ queryKey: ["cover-letters"] });
    },
  });

  const handleGenerate = () => {
    if (!selectedJob) {
      toast.error("Please select a job");
      return;
    }
    generateMutation.mutate({ job_id: selectedJob, tone: selectedTone });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const tones = [
    { value: "professional", label: "Professional", desc: "Formal & corporate" },
    { value: "casual", label: "Casual", desc: "Friendly & relaxed" },
    { value: "founder", label: "Founder-focused", desc: "Entrepreneurial & bold" },
    { value: "enthusiastic", label: "Enthusiastic", desc: "Energetic & positive" },
  ];

  return (
    <div className="dash-page">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div />
        </div>
        {canAccess("cover_letters") && (
          <button 
            onClick={() => setShowGenerate(true)}
            className="h-8 px-3.5 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate New Letter</span>
          </button>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] p-6 w-full max-w-md rounded-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[16px] text-white">Generate Cover Letter</h3>
              <button onClick={() => setShowGenerate(false)} className="h-8 w-8 flex items-center justify-center rounded-md bg-[#171717] border border-[var(--app-border-strong)] text-zinc-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5 block">Select Job</label>
                <select 
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full h-9 px-3 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg text-white text-[13px] outline-none focus:border-white/30 transition-colors"
                >
                  <option value="">Choose a job...</option>
                  {jobs?.map((job: Job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} at {job.company_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5 block">Tone</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {tones.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => setSelectedTone(tone.value)}
                      className={cn(
                        "p-3 rounded-lg border text-left text-[13px] transition-colors",
                        selectedTone === tone.value 
                          ? "bg-white border-white text-black" 
                          : "bg-[var(--app-nested)] border-[var(--app-border-strong)] text-zinc-400 hover:text-white hover:border-white/30"
                      )}
                    >
                      <div className="font-medium text-[13px]">{tone.label}</div>
                      <div className={cn("text-[11px] mt-0.5", selectedTone === tone.value ? "text-zinc-700" : "text-zinc-500")}>{tone.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !selectedJob}
                className="w-full h-9 mt-2 bg-white text-black rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors text-[13px]"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                <span>Generate Letter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[var(--app-border-strong)] bg-[var(--app-card)] flex items-center justify-between">
              <h3 className="text-[15px] sm:text-[16px] font-semibold flex items-center gap-2 text-white">
                <Clock className="w-4 h-4 text-zinc-400" />
                Your Cover Letters
              </h3>
              <span className="text-[12px] text-zinc-400 font-medium">{letters?.length || 0} letters</span>
            </div>
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
              </div>
            ) : letters && letters.length > 0 ? (
              <div className="divide-y divide-[var(--app-border-strong)]/40">
                {letters.map((letter: CoverLetter) => (
                  <div key={letter.id} className="p-4 hover:bg-[var(--app-nested)]/50 transition-colors group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[15px] text-white">{letter.job_title || "Job Application"}</h4>
                          <p className="text-[12px] text-zinc-400 font-normal">{letter.company_name || "Company"} • {formatDate(letter.created_at)}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border",
                        letter.status === "completed" ? "bg-white/[0.06] text-zinc-300 border-[var(--app-border-strong)]" : "bg-white/[0.06] text-zinc-400 border-[var(--app-border-strong)]"
                      )}>
                        {letter.status === "completed" ? "Ready" : "Generating..."}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {letter.status === "completed" ? (
                        <>
                          <button className="text-[12px] font-semibold text-white hover:underline flex items-center gap-1">
                            View Letter <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button className="h-7 px-2.5 bg-[#171717] hover:bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-md text-[11px] font-medium text-white flex items-center gap-1 transition-colors">
                            <Download className="w-3 h-3" /> PDF
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-zinc-500 font-medium">Generating...</span>
                      )}
                      <button 
                        onClick={() => deleteMutation.mutate(letter.id)}
                        className="h-7 w-7 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-[var(--app-card)] rounded-md ml-auto opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete letter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                <p className="text-[14px] font-medium text-white mb-1">No cover letters yet</p>
                <p className="text-[12px] text-zinc-400">Generate your first cover letter to start</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 rounded-md bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-[15px] sm:text-[16px] font-semibold text-white">AI Tone Tuning</h3>
            </div>
            <p className="text-[13px] text-zinc-400 mb-4 leading-relaxed">
              Our AI analyzes your selected resume and target job description to match company culture.
            </p>
            <div className="space-y-2">
              {tones.map(t => (
                <div key={t.value} className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors border", selectedTone === t.value ? "bg-[var(--app-nested)] border-white/40 text-white" : "bg-[var(--app-nested)] border-[var(--app-border-strong)] text-zinc-400") }>
                   <div className={cn("w-1.5 h-1.5 rounded-full", selectedTone === t.value ? "bg-white" : "bg-zinc-600")} />
                   <span>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {!canAccess("cover_letters") && (
            <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4">
                  <Crown className="w-4 h-4 text-zinc-400" />
               </div>
               <h4 className="text-[14px] font-semibold mb-1 text-white">Upgrade to Pro</h4>
               <p className="text-[12px] text-zinc-400 mb-4 leading-relaxed">Get unlimited cover letters and advanced AI tuning options.</p>
               <button className="w-full h-8 px-3.5 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-zinc-200 transition-colors">
                 View Plans
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
