"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumesApi } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, Plus, Download, Eye, Star, Trash2, Check, ChevronDown, Lock , Loader2} from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function ResumesPage() {
  const qc = useQueryClient();
  const { isPro, isPremium } = useSubscription();
  
  const downloadResume = async (id: string, filename: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/resumes/${id}/file`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || "resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download resume");
    }
  };

  const { data: resumes, isLoading } = useQuery({ queryKey: ["resumes"], queryFn: () => resumesApi.list().then(r => r.data) });
  const { data: templates } = useQuery({ queryKey: ["latex-templates"], queryFn: () => resumesApi.getLatexTemplates().then(r => r.data) });

  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] }, maxFiles: 1,
    onDrop: (f) => setFile(f[0]),
  });

  const uploadMut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("file", file!);
      fd.append("name", file!.name.replace(".pdf", ""));
      return resumesApi.upload(fd);
    },
    onSuccess: () => {
      toast.success("Resume uploaded");
      setFile(null);
      setUploadOpen(false);
      qc.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: () => toast.error("Failed to upload"),
    onSettled: () => setIsUploading(false),
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => resumesApi.setDefault(id),
    onSuccess: () => { toast.success("Default resume updated"); qc.invalidateQueries({ queryKey: ["resumes"] }); }
  });

  const selectTemplate = useMutation({
    mutationFn: (name: string) => resumesApi.selectLatexTemplate(name),
    onSuccess: () => { toast.success("LaTeX Template changed"); qc.invalidateQueries({ queryKey: ["latex-templates"] }); },
  });
  
  const deleteMut = useMutation({
    mutationFn: (id: string) => resumesApi.delete(id),
    onSuccess: () => { 
      toast.success("Resume deleted"); 
      qc.invalidateQueries({ queryKey: ["resumes"] }); 
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed to delete resume"),
  });

  const handleUpload = () => { if (file) { setIsUploading(true); uploadMut.mutate(); } };

  const resumeCount = resumes?.length || 0;
  const isAtLimit = resumeCount >= 3;

  return (
    <div className="dash-page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase", isAtLimit ? "bg-white/[0.06] text-zinc-300 border border-[var(--app-border-strong)]" : "bg-white/5 text-zinc-400 border border-[var(--app-border-strong)]")}>
            {resumeCount}/3 RESUMES
          </span>
        </div>
        <button 
          onClick={() => setUploadOpen(true)} 
          disabled={isAtLimit}
          className="h-8 px-3.5 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-zinc-200 transition-colors flex gap-2 items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
           <Plus className={cn("w-4 h-4", isAtLimit ? "text-zinc-500" : "text-black")} />
           <span>{isAtLimit ? "Limit Reached" : "Upload Baseline"}</span>
        </button>
      </div>

      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !isUploading && setUploadOpen(false)}>
           <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
             <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Upload Base Resume</h3>
              <div {...getRootProps()} className={cn(
                "border border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors relative overflow-hidden group",
                isDragActive 
                  ? "border-white bg-white/5" 
                  : "border-[var(--app-border-strong)] bg-[var(--app-nested)] hover:border-white/30"
              )}>
                <input {...getInputProps()} />
                <div className="w-10 h-10 rounded-lg bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-4 h-4 text-zinc-400" />
                </div>
                {file ? (
                  <p className="text-white font-medium text-[13px]">{file.name}</p>
                ) : (
                  <>
                    <p className="text-[13px] font-medium text-white mb-1">Baseline Document</p>
                    <p className="text-[12px] text-zinc-400">Drag PDF here or click to browse</p>
                  </>
                )}
              </div>
             <div className="flex justify-end gap-2.5 mt-5">
                <button onClick={() => setUploadOpen(false)} disabled={isUploading} className="h-8 px-3.5 bg-[#171717] hover:bg-[var(--app-card)] text-white border border-[var(--app-border-strong)] rounded-md text-[13px] font-medium transition-colors">Cancel</button>
                <button onClick={handleUpload} disabled={!file || isUploading} className="h-8 px-3.5 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                     {isUploading ? <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Upload Resume"}
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Resumes List */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3 border-b border-[var(--app-border-strong)] pb-3">
          <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight flex items-center gap-2.5">
             <FileText className="w-4 h-4 text-zinc-400" />
             Base Documents
          </h2>
        </div>
        
        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="skeleton h-32 rounded-lg" />)}</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {resumes?.map((res: any) => (
                <div key={res.id} className={cn("p-3 rounded-lg border transition-all flex flex-col group", res.is_default ? "bg-[var(--app-card)] border-white/30" : "bg-[var(--app-card)] border-[var(--app-border-strong)] hover:border-white/20")}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-md flex items-center justify-center shrink-0", res.is_default ? "bg-white text-black" : "bg-[var(--app-card)] border border-[var(--app-border-strong)] text-zinc-400")}>
                        <FileText className={cn("w-4 h-4", res.is_default ? "text-black" : "text-zinc-400")} />
                      </div>
                      <div>
                        <p className="font-semibold text-[14px] text-white truncate pr-2 max-w-[130px] tracking-tight">{res.name}</p>
                        <p className="text-[11px] font-medium text-zinc-400">{formatDate(res.created_at)}</p>
                      </div>
                    </div>
                    {res.is_default && <span className="bg-white text-black px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase">PRIMARY</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-auto pt-2.5 border-t border-[var(--app-border-strong)]">
                    {!res.is_default && (
                      <>
                        <button onClick={() => setDefault.mutate(res.id)} className="flex-1 h-8 px-3 bg-[#171717] border border-[var(--app-border-strong)] rounded-md text-[12px] font-medium text-white hover:bg-[var(--app-card)] transition-colors">
                          Set Primary
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this resume?")) {
                              deleteMut.mutate(res.id);
                            }
                          }}
                          className="h-8 w-8 flex items-center justify-center bg-[#171717] border border-[var(--app-border-strong)] rounded-md text-zinc-400 hover:text-red-400 hover:bg-[var(--app-card)] transition-colors"
                          title="Delete Resume"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button onClick={() => downloadResume(res.id, `${res.name || 'resume'}.pdf`)} className={cn("h-8 px-3 bg-[#171717] border border-[var(--app-border-strong)] rounded-md text-[12px] font-medium text-white hover:bg-[var(--app-card)] transition-colors flex items-center justify-center gap-1.5", res.is_default ? "flex-1" : "")}>
                      <Download className="w-3.5 h-3.5" /> <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
              {resumes?.length === 0 && (
                <div className="col-span-full text-center bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg transition-all flex flex-col items-center justify-center px-5 py-5">
                  <div className="w-10 h-10 rounded-lg bg-[var(--app-card)] border border-[var(--app-border-strong)] flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-4 h-4 text-zinc-400" />
                  </div>
                  <p className="text-[13px] font-medium text-white mb-1">No Resumes Uploaded</p>
                  <p className="text-[12px] text-zinc-400 max-w-[260px] mx-auto leading-relaxed">
                    Upload your baseline PDF to initialize the AI generation engine.
                  </p>
                </div>
              )}
            </div>
        )}
      </div>

      {/* Templates List */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-4">
        <div className="mb-3 border-b border-[var(--app-border-strong)] pb-3">
           <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight flex items-center gap-2.5">
             Presentation Themes
             <span className="px-2 py-0.5 bg-white/10 text-zinc-300 rounded text-[10px] font-medium tracking-wide uppercase border border-[var(--app-border-strong)]">AI Matrix</span>
           </h2>
           <p className="text-zinc-400 text-[13px] mt-1 max-w-xl">When the agent deploys an application, it dynamically builds an ATS-optimized profile using one of these structural themes.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {templates?.available?.map((tpl: any) => {
               const isSelected = templates.selected === tpl.name;
               const isLocked = tpl.tier !== "starter" && tpl.tier === "premium" && !isPremium || tpl.tier === "pro" && !isPro && !isPremium;

               return (
                  <motion.div 
                    key={tpl.name} 
                    whileHover={!isLocked ? { y: -2 } : {}}
                    className={cn(
                      "relative group rounded-lg overflow-hidden border transition-all cursor-pointer flex flex-col h-full bg-[var(--app-card)]", 
                      isSelected ? "border-white/40" : "border-[var(--app-border-strong)] hover:border-white/20"
                    )} 
                    onClick={() => !isLocked && selectTemplate.mutate(tpl.name)}
                  >
                    <div className="aspect-[1/1.1] bg-black/30 p-2 border-b border-[var(--app-border-strong)] overflow-hidden">
                        {tpl.preview_img_url ? (
                        <img src={tpl.preview_img_url} alt={tpl.name} className={cn("w-full h-full object-contain rounded-md opacity-90 group-hover:opacity-100 transition-opacity", isLocked ? "blur-[4px] opacity-40 grayscale" : "")} />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-12 h-12 text-zinc-500" />
                           </div>
                        )}
                     </div>
                     {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[2px] z-20">
                          <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] p-3 rounded-lg text-center">
                            <Lock className="w-4 h-4 text-white mx-auto mb-1" />
                            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">{tpl.tier} ACCESS</span>
                           </div>
                        </div>
                     )}
                     <div className="p-2.5 bg-[var(--app-nested)] flex flex-col gap-0.5 relative z-10 mt-auto">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[13px] text-white capitalize tracking-tight">{tpl.name.replace(/-/g, " ").replace(/_/g, " ")}</p>
                          {isSelected && <div className="w-4 h-4 bg-white text-black rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-black stroke-[3]" /></div>}
                        </div>
                        <p className="text-[11px] font-normal text-zinc-400 line-clamp-1">{tpl.description}</p>
                     </div>
                  </motion.div>
               );
            })}
        </div>
      </div>
    </div>
  );
}
