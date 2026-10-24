"use client";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { motion, useScroll, useTransform, AnimatePresence, MotionConfig } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  Zap, Brain, ChevronRight, Check,
  Bot, Search, FileText, Send, Bell, BarChart2,
  ArrowRight, Globe, Sparkles, Shield, Target,
  MessageSquare, Star, TrendingUp, Loader2,
  ChevronDown, Activity, ShieldCheck, Book,
  Mail, ExternalLink, Paperclip, Database,
} from "lucide-react";
import { PLAN_FEATURES, PLAN_PRICES } from "@/lib/subscription";
import dynamic from "next/dynamic";

const KiloagentBackground = dynamic(() => import("@/components/KiloagentBackground").then(m => ({ default: m.KiloagentBackground })), { ssr: false });
import { MiddleHero } from "@/components/ainest/MiddleHero";
import { WorkflowBento } from "@/components/ainest/WorkflowBento";
import { SecondaryBento } from "@/components/ainest/SecondaryBento";
import { IntegrationsHub } from "@/components/ainest/IntegrationsHub";
import { HowItWorksSteps } from "@/components/ainest/HowItWorksSteps";
import { SimplePricing as Pricing } from "@/components/ainest/Pricing";
import { Testimonials } from "@/components/ainest/Testimonials";
import { FAQ } from "@/components/ainest/FAQ";
import { Insights } from "@/components/ainest/Insights";
import { Footer } from "@/components/Footer";
import { MiniDashboardPreview } from "@/components/landing/MiniDashboardPreview";




/* ─── HERO MOCKUP ─────────────────────────────────────────── */

function HeroMockup() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const messages = [
    "Find AI developer jobs in San Francisco...",
    "Apply for 10 high-match jobs automatically...",
    "Analyze my resume for Google's SWE role...",
    "Answer customer questions from our help docs..."
  ];

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % messages.length;
      const fullText = messages[i];

      setText(isDeleting
        ? fullText.substring(0, text.length - 1)
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 40 : 80);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full"
    >
      {/* Floating Chat Input (Kilo Style: tightly proportioned to Kilo ~450px width & 122px height) */}
      <div className="absolute z-30 left-1/2 -translate-x-1/2 -top-6 sm:-top-8 md:-top-9 w-[88%] sm:w-[410px] md:w-[450px] max-w-[450px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <div className="rounded-[18px] sm:rounded-[20px] bg-[color-mix(in_srgb,var(--sx-bg-121214)_95%,transparent)] backdrop-blur-2xl border border-[var(--sx-bd-27272a)] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.06)] px-3.5 py-3 sm:px-4 sm:py-3.5 md:px-4.5 md:py-3.5 flex flex-col justify-between min-h-[112px] sm:min-h-[118px] md:min-h-[122px]">
            {/* Top text area with ~14.5px font and cyan cursor */}
            <div className="w-full text-left min-h-[38px] sm:min-h-[42px]">
              <p className="text-zinc-200 text-[13.5px] sm:text-[14px] md:text-[14.5px] font-normal leading-relaxed tracking-normal select-none">
                {text}
                <span className="inline-block w-[2px] h-[15px] sm:h-[16px] bg-[#38bdf8] ml-1.5 align-middle animate-[pulse_0.8s_infinite]" />
              </p>
            </div>

            {/* Bottom actions row */}
            <div className="flex items-center justify-between mt-2 pt-0.5">
              <div className="flex items-center gap-0.5 bg-[var(--sx-bg-19191d)] border border-white/[0.08] rounded-[9px] px-1.5 py-0.5 shadow-inner">
                <button
                  type="button"
                  aria-label="Attach file"
                  title="Attach file"
                  className="p-1 rounded-[6px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  aria-label="Knowledge context"
                  title="Knowledge context"
                  className="p-1 rounded-[6px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <Database className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
              </div>

              <button
                type="button"
                aria-label="Send prompt"
                title="Run agent prompt"
                className="w-[36px] h-[28px] sm:w-[38px] sm:h-[30px] rounded-[9px] sm:rounded-[10px] bg-[var(--sx-bg-f4f4f5)] hover:bg-white active:scale-95 flex items-center justify-center transition-all shadow-md group"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-zinc-900 transition-transform group-hover:scale-105"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Browser Chrome Mockup: 1,040px Max Width matching Kilo */}
      <div className="mockup-fade relative w-full rounded-t-[18px] sm:rounded-t-[24px] overflow-hidden border border-white/[0.08] bg-[var(--sx-bg-0a0a0a)] shadow-[0_32px_100px_-20px_rgba(0,0,0,0.95)] z-10 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
        {/* Title bar tightly matched to Kilo */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 bg-[var(--sx-bg-121214)] border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[var(--sx-bg-17171a)] border border-white/[0.08] rounded-full pl-3 pr-2.5 py-1 min-w-[190px] sm:min-w-[220px]">
              <Globe className="w-3 h-3 text-zinc-500 shrink-0" />
              <div className="text-zinc-400 text-xs sm:text-[12.5px] font-sans tracking-normal truncate">
                https://app.applivo.in/
              </div>
              <div className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mr-1">
            <div className="w-2 h-2 rounded-full bg-zinc-700/60" />
            <div className="w-2 h-2 rounded-full bg-zinc-700/60" />
            <div className="w-2 h-2 rounded-full bg-zinc-700/60" />
          </div>
        </div>

        {/* Dashboard preview correctly seated */}
        <div className="bg-[var(--sx-bg-0a0a0a)] relative overflow-hidden">
          <MiniDashboardPreview />
          <div className="mockup-dissolve absolute inset-x-0 bottom-0 h-[120px] sm:h-[170px] bg-gradient-to-t from-[var(--sx-bg-0a0a0a)] via-[color-mix(in_srgb,var(--sx-bg-0a0a0a)_85%,transparent)] to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────────────────── */
export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("applivo_token")));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="landing-typography min-h-screen bg-[var(--sx-bg-0a0a0a)] text-white selection:bg-white/20">
        <NavBar />

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-[96px] pb-16 px-4 sm:px-6 md:px-8 overflow-hidden bg-[var(--sx-bg-0a0a0a)]">
          {/* Matrix ASCII Rain Background */}
          <KiloagentBackground />

          {/* Text Header Container */}
          <div className="relative z-20 w-full max-w-4xl mx-auto text-center mt-6 sm:mt-8">
            {/* Spacer where the "New" badge used to be: keeps the headline exactly where it was. */}
            <div aria-hidden="true" className="h-[30px]" />
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="k-h1 mt-6 text-center flex flex-col items-center max-w-2xl mx-auto"
            >
              <span className="text-[var(--sx-tx-a1a1a1)] block">Land Your Dream Job</span>
              <span className="text-white font-semibold">With AI Agents</span>
            </motion.h1>

            {/* Subtitle - Kiloagent Style */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="k-body max-w-xl mx-auto mt-6 text-center"
            >
              Applivo automates the job application process by matching opportunities, generating applications, and submitting them automatically.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center items-center gap-3 mt-8"
            >
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="k-btn k-btn-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
              >
                Deploy Agent
              </Link>
              <Link
                href="/#features"
                className="k-btn k-btn-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
              >
                Learn more
              </Link>
            </motion.div>
          </div>

          {/* Dashboard mockup (Kiloagent overlay style with ~1,040px width) */}
          <div className="relative z-20 w-full max-w-[1040px] mx-auto mt-16 sm:mt-20 md:mt-22">
            <HeroMockup />
          </div>
        </section>

        <MiddleHero />

        <div id="workflow" className="relative z-10 pt-20 md:pt-28 pb-16 md:pb-24">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10">
            <h2 className="k-h2 mb-3.5 text-[26px] sm:text-[28px] md:text-[32px] font-semibold tracking-tight leading-[1.2] max-w-2xl mx-auto">
              <span className="text-[var(--sx-tx-a1a1a1)] block">Automate Your Job Search —</span>
              <span className="text-white font-semibold block">End to End.</span>
            </h2>
            <p className="k-body max-w-xl mx-auto text-[14.5px] sm:text-[15.5px] text-zinc-400 leading-relaxed">
              Connect your accounts, discover matching roles, and let AI apply to opportunities automatically — saving hours of manual effort every day.
            </p>
            <div className="mt-5 mb-8 md:mb-10 flex justify-center">
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm transition-all duration-200 shadow-[0_2px_14px_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Learn more
              </Link>
            </div>
          </div>
          <WorkflowBento />

          {/* Kiloagent UI Flow restored */}
          <div className="mt-16 md:mt-24">
            <HowItWorksSteps />
          </div>
        </div>

        <div id="features" className="py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 mb-12 md:mb-14 relative z-10">
            <h2 className="k-h2 mb-3.5 text-[26px] sm:text-[28px] md:text-[32px] font-semibold tracking-tight leading-[1.2] max-w-2xl mx-auto">
              <span className="text-[var(--sx-tx-a1a1a1)] block">Everything you need</span>
              <span className="text-white font-semibold block">to scale.</span>
            </h2>
            <p className="k-body max-w-2xl mx-auto text-[14.5px] sm:text-[15.5px] text-zinc-400 leading-relaxed">
              A massively scalable ecosystem that natively handles deployment, tracking, synchronization, and security.
            </p>
          </div>
          <SecondaryBento />

        </div>

        <div id="integrations" className="relative">
          <IntegrationsHub />
        </div>

        <div id="pricing">
          <Pricing />
        </div>

        <Testimonials />

        <FAQ />

        {/* ── APPLIVO INSIGHTS (EDITORIAL BLOG SECTION) ── */}
        <Insights />

        {/* ── FOUR-COLUMN FOOTER ────────────────────────────── */}
        <Footer />
      </div>
    </MotionConfig>
  );
}
