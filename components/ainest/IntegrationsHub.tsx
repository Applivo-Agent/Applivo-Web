"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  X, 
  Sparkles, 
  Send, 
  Loader2, 
  ArrowRight,
  AlertCircle,
  Puzzle
} from "lucide-react";
import { platformApi } from "@/lib/api";
import { toast } from "sonner";
import { 
  INTEGRATION_REGISTRY, 
  INTEGRATION_CATEGORIES, 
  type IntegrationCategory 
} from "@/lib/integrations/registry";

export function IntegrationsHub() {
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Filtered catalog based on category, search query, and showAll
  const filteredIntegrations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return INTEGRATION_REGISTRY.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q);

      // On "All" with no search, show only the 8 featured items until "Browse all" is clicked
      if (activeCategory === "All" && !q && !showAll) {
        return item.featured && matchesSearch;
      }

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, showAll]);

  // Body scroll lock on request modal open
  useEffect(() => {
    if (showRequestModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showRequestModal]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowRequestModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Request form state
  const [reqService, setReqService] = useState("");
  const [reqUrl, setReqUrl] = useState("");
  const [reqCategory, setReqCategory] = useState("Job Sources");
  const [reqUseCase, setReqUseCase] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqService.trim()) {
      toast.error("Please enter the service name");
      return;
    }
    setIsSubmitting(true);
    try {
      await platformApi.requestIntegration({
        service_name: reqService.trim(),
        service_url: reqUrl.trim() || undefined,
        category: reqCategory,
        use_case: reqUseCase.trim() || undefined,
        requester_email: reqEmail.trim() || undefined,
      });
      setSubmitSuccess(true);
      toast.success("Integration request received. Our team will review API support.");
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowRequestModal(false);
        setReqService("");
        setReqUrl("");
        setReqUseCase("");
        setReqEmail("");
      }, 1500);
    } catch {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[var(--sx-bg-0a0a0a)] text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative z-10 selection:bg-white/20">
      <div className="max-w-[1200px] mx-auto">

        {/* ─── SECTION INTRODUCTION (MATCHING LANDING PAGE TYPOGRAPHY) ─── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-white/[0.06]">
          {/* Left-Aligned Header Block */}
          <div className="max-w-2xl">
            {/* Main Section Heading */}
            <h2 className="k-h2 text-[26px] sm:text-[28px] md:text-[32px] font-semibold tracking-tight leading-[1.2]">
              <span className="text-[var(--sx-tx-a1a1a1)] block">Works with your</span>
              <span className="text-white font-semibold block">Entire Career Stack</span>
            </h2>

            {/* Supporting Paragraph */}
            <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-zinc-400 font-normal leading-relaxed max-w-xl">
              Applivo integrates natively with verified job sources, interview calendars, and communication tools — powering discovery, application tracking, and automated scheduling.
            </p>
          </div>

          {/* Right-Aligned Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            {/* Request Integration Button */}
            <button
              onClick={() => {
                setReqService("");
                setShowRequestModal(true);
              }}
              className="inline-flex items-center justify-center h-[30px] px-3.5 rounded-full text-[12px] font-medium text-white bg-[var(--sx-bg-18181b)] hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all duration-200 active:scale-95 shadow-sm"
            >
              Request integration
            </button>

            {/* Browse Catalog Button */}
            <button
              onClick={() => {
                setActiveCategory("All");
                setShowAll((prev) => !prev);
                const el = document.getElementById("integration-grid-anchor");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center justify-center gap-1.5 h-[30px] px-3.5 rounded-full text-[12px] font-medium text-black bg-white hover:bg-zinc-200 transition-all duration-200 active:scale-95 shadow-sm"
            >
              {showAll && activeCategory === "All" ? (
                <>Show featured (8)</>
              ) : (
                <>
                  Browse all {INTEGRATION_REGISTRY.length}
                  <ArrowRight className="w-3 h-3 text-black" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── CATALOG CONTROLS (CATEGORY TABS & SEARCH) ─── */}
        <div id="integration-grid-anchor" className="pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {INTEGRATION_CATEGORIES.map((cat) => {
                const count =
                  cat === "All"
                    ? INTEGRATION_REGISTRY.length
                    : INTEGRATION_REGISTRY.filter((c) => c.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      if (cat === "All") {
                        setShowAll(true);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive 
                        ? "bg-white text-black font-semibold shadow-sm" 
                        : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.05]"
                    }`}
                  >
                    {cat} <span className={isActive ? "text-zinc-600 [html.light_&]:text-black ml-1 text-[11px]" : "text-zinc-500 ml-1 text-[11px]"}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Search Input */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search integrations…"
                className="w-full bg-[var(--sx-bg-121212)] border border-white/[0.08] focus:border-white/30 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ─── EXACT 4-COLUMN RESPONSIVE CARD GRID ─── */}
        {filteredIntegrations.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 sm:gap-5 lg:gap-6 mt-3 sm:mt-4">
              {filteredIntegrations.map((item, index) => {
                const docTarget = `/docs/${item.docSlug || item.id}`;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02, ease: "easeOut" }}
                  >
                    <Link
                      href={docTarget}
                      className="group relative h-full rounded-[16px] sm:rounded-[18px] bg-[var(--sx-bg-121212)] hover:bg-[var(--sx-bg-151515)] border border-white/[0.08] hover:border-white/[0.2] p-5 sm:p-5.5 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.55)] cursor-pointer block hover:-translate-y-0.5"
                    >
                      {/* Card Content: Official Logo, Link Badge, Title & Description */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          {/* Logo Container (Compact & Borderless - 28px) */}
                          <div className="w-7 h-7 sm:w-[28px] sm:h-[28px] rounded-[6px] overflow-hidden flex items-center justify-center shrink-0">
                            <Image
                              src={item.logo}
                              alt={item.logoAlt}
                              width={28}
                              height={28}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-[11.5px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors flex items-center gap-1">
                            Docs <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>

                        {/* Service Name */}
                        <h3 className="text-[15px] sm:text-[15.5px] font-semibold text-white tracking-tight mb-1.5 group-hover:text-white transition-colors">
                          {item.name}
                        </h3>

                        {/* Short Description */}
                        <p className="text-[12.5px] sm:text-[13px] text-zinc-400 leading-relaxed font-normal line-clamp-2 min-h-[36px] sm:min-h-[38px]">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty Search State */
          <div className="rounded-[20px] bg-[var(--sx-bg-121212)] border border-white/[0.08] p-10 text-center my-6">
            <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto mb-2.5" />
            <h3 className="text-base font-semibold text-white mb-1">No integrations found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-5">
              No results matching &ldquo;{searchQuery}&rdquo;. Request this integration and our team will prioritize its API connector.
            </p>
            <button
              onClick={() => {
                setReqService(searchQuery);
                setShowRequestModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition"
            >
              <Puzzle className="w-3.5 h-3.5" strokeWidth={2} />
              Request &ldquo;{searchQuery}&rdquo; integration
            </button>
          </div>
        )}

      </div>

      {/* ─── REQUEST INTEGRATION MODAL DIALOG ─── */}
      <AnimatePresence>
        {showRequestModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg my-auto rounded-[22px] bg-[var(--sx-bg-141414)] border border-white/[0.12] p-5 sm:p-6 text-white shadow-2xl max-h-[90vh] flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="request-modal-title"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition z-10"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4 shrink-0 pr-8">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10.5px] font-medium text-zinc-300 mb-1.5">
                  <Puzzle className="w-3 h-3 text-zinc-300" strokeWidth={2} />
                  Integration Request
                </div>
                <h3 id="request-modal-title" className="text-lg font-bold text-white tracking-tight">
                  Request an integration
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tell us which job board, calendar, email provider, or AI tool you’d like Applivo to connect with.
                </p>
              </div>

              {submitSuccess ? (
                <div className="py-6 text-center space-y-2.5">
                  <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 text-white flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5 text-zinc-200" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Request Received</h4>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    Thank you! Our engineering team logs every integration request and analyzes platform API availability.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-3 overflow-y-auto pr-1 -mr-1">
                  {/* Row 1: Service Name & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Service Name <span className="text-zinc-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={reqService}
                        onChange={(e) => setReqService(e.target.value)}
                        placeholder="e.g. Workable, USAJOBS"
                        className="w-full bg-[var(--sx-bg-1c1c1f)] border border-white/10 focus:border-white/30 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                      <select
                        value={reqCategory}
                        onChange={(e) => setReqCategory(e.target.value)}
                        className="w-full bg-[var(--sx-bg-1c1c1f)] border border-white/10 focus:border-white/30 rounded-xl px-3 py-2 text-xs text-white outline-none transition cursor-pointer"
                      >
                        <option value="Job Sources">Job Source (Job Board / ATS)</option>
                        <option value="Connected Services">Connected Service (Calendar / Mail / App)</option>
                        <option value="Built-in Capabilities">AI Model / System Feature</option>
                        <option value="Other">Other Connection</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Website / Docs URL & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Service Website / Docs <span className="text-zinc-500 font-normal">(optional)</span>
                      </label>
                      <input
                        type="url"
                        value={reqUrl}
                        onChange={(e) => setReqUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-[var(--sx-bg-1c1c1f)] border border-white/10 focus:border-white/30 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Your Email <span className="text-zinc-500 font-normal">(for launch updates)</span>
                      </label>
                      <input
                        type="email"
                        value={reqEmail}
                        onChange={(e) => setReqEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full bg-[var(--sx-bg-1c1c1f)] border border-white/10 focus:border-white/30 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Row 3: Desired Workflow or Use Case */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Desired Workflow or Use Case <span className="text-zinc-500 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={reqUseCase}
                      onChange={(e) => setReqUseCase(e.target.value)}
                      placeholder="What should Applivo do with this integration? (e.g. sync interview rounds, import portfolio)"
                      className="w-full bg-[var(--sx-bg-1c1c1f)] border border-white/10 focus:border-white/30 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 outline-none transition resize-none"
                    />
                  </div>

                  {/* Submit and Cancel buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06] mt-3">
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-black bg-white hover:bg-zinc-200 transition disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Submit Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
