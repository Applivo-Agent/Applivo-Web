"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  Link as LinkIcon,
  Send,
  Compass,
  Award,
} from "lucide-react";
import { toast } from "sonner";

function getShareUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && !configured.includes("localhost") && !configured.includes("127.0.0.1")) {
    return configured.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "https://applivo.com";
    }
    return window.location.origin;
  }
  return "https://applivo.com";
}

export default function ReferPage() {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("https://applivo.com");
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    setShareUrl(getShareUrl());
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setHasNativeShare(true);
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Applivo — AI Career Automation",
          text: "Accelerate your job search and applications with Applivo AI.",
          url: shareUrl,
        });
      } catch {
        // User dismissed native share sheet
      }
    } else {
      await handleCopy();
    }
  };

  return (
    <div className="dash-page max-w-5xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">Refer &amp; Earn</h1>
        <p className="dash-subtitle mt-1">
          Share Applivo with friends who are building their next career move.
        </p>
      </div>

      {/* Compact Invitation Hero */}
      <div className="rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] p-6">
        <div className="grid md:grid-cols-12 gap-6 items-center">
          {/* Left Hero Details */}
          <div className="md:col-span-7 space-y-4">
            <div className="w-9 h-9 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center text-zinc-300">
              <Users className="w-4 h-4" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[17px] sm:text-[18px] font-semibold text-white tracking-tight">
                Good opportunities are better shared.
              </h2>
              <p className="text-[13px] text-zinc-400 leading-relaxed max-w-lg">
                Invite friends, colleagues, and peers to Applivo. Friends get AI-powered resume tailoring,
                verified job feeds, and smart application tracking to accelerate their search.
              </p>
            </div>

            {/* Invitation Link & Sharing Controls */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] px-3">
                  <LinkIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <input
                    readOnly
                    value={shareUrl}
                    aria-label="Share URL"
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-zinc-300 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="h-9 px-3.5 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-[13px] font-semibold text-black hover:bg-zinc-200 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy link"}</span>
                </button>
                {hasNativeShare && (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="h-9 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] hover:bg-white/[0.04] text-[13px] font-medium text-zinc-300 hover:text-white transition-colors shrink-0"
                    title="Share via device options"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Referral tracking and bonus credits are not active yet. Sharing provides a direct invitation link to Applivo.
              </p>
            </div>
          </div>

          {/* Right Hero Abstract Graphic Treatment */}
          <div className="md:col-span-5">
            <div className="rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[var(--app-card)] border border-[var(--app-border-strong)]">
                <Sparkles className="w-6 h-6 text-zinc-300" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-400" />
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="text-[13px] font-semibold text-white tracking-tight">Applivo Community Invite</p>
                <p className="text-[11px] text-zinc-400">Direct link to modern AI job search tools</p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 bg-[var(--app-card)] border border-[var(--app-border-strong)] px-2.5 py-1 rounded">
                <span>Direct Public Link</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works (Compact 3-Step) */}
      <div className="space-y-3">
        <h3 className="text-[15px] font-semibold text-white tracking-tight">How it works</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-zinc-400 bg-[var(--app-nested)] border border-[var(--app-border-strong)] px-2 py-0.5 rounded">
                01
              </span>
              <Send className="w-4 h-4 text-zinc-400" />
            </div>
            <h4 className="text-[14px] font-semibold text-white">Share Applivo</h4>
            <p className="text-[12px] text-zinc-400 leading-relaxed">
              Send your invite link to friends, peers, and colleagues looking for their next job or internship.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-zinc-400 bg-[var(--app-nested)] border border-[var(--app-border-strong)] px-2 py-0.5 rounded">
                02
              </span>
              <Compass className="w-4 h-4 text-zinc-400" />
            </div>
            <h4 className="text-[14px] font-semibold text-white">Get started</h4>
            <p className="text-[12px] text-zinc-400 leading-relaxed">
              Your friends explore the platform, analyze their resumes, and match against active job opportunities.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-zinc-400 bg-[var(--app-nested)] border border-[var(--app-border-strong)] px-2 py-0.5 rounded">
                03
              </span>
              <Award className="w-4 h-4 text-zinc-400" />
            </div>
            <h4 className="text-[14px] font-semibold text-white">Referral rewards</h4>
            <p className="text-[12px] text-zinc-400 leading-relaxed">
              Referral tracking and rewards are in development. Sharing helps friends discover opportunities today.
            </p>
          </div>
        </div>
      </div>

      {/* Referral Activity (Polished Truthful Section) */}
      <div className="space-y-3">
        <h3 className="text-[15px] font-semibold text-white tracking-tight">Referral Activity</h3>
        <div className="rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] p-8 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center text-zinc-400">
            <Users className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-md">
            <h4 className="text-[14px] font-semibold text-white">Referral tracking is in development</h4>
            <p className="text-[12px] text-zinc-400 leading-relaxed">
              Applivo does not currently track referral attributions or reward balances. When referral program features launch, your active invitations and history will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
