"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { PRICING_PLANS, PRICING_FAQS } from "@/lib/pricing-data";
import { PricingCard } from "@/components/pricing/PricingCard";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";

export default function PricingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("applivo_token")));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--sx-bg-0a0a0a)] text-[var(--sx-tx-f5f5f5)] selection:bg-white/20 flex flex-col justify-between">
      <NavBar />

      <main className="pt-16 sm:pt-20 md:pt-24 pb-14 px-4 sm:px-6 relative z-10 flex flex-col items-center flex-1">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02),transparent_70%)]"
          aria-hidden="true"
        />

        {/* ─── 1. PAGE HEADER (RECORD-INSPIRED CENTERED LAYOUT) ─── */}
        <div className="text-center mb-10 sm:mb-12 md:mb-14 relative z-10 max-w-2xl mx-auto px-4">
          <span className="text-[11px] sm:text-[11.5px] font-medium text-[var(--sx-tx-71717a)] uppercase tracking-[0.15em] block mb-3">
            PRICING
          </span>
          <h1 className="text-[32px] sm:text-[36px] md:text-[38px] font-semibold tracking-tight mb-3 leading-[1.2]">
            <span className="text-[var(--sx-tx-a1a1a1)] block">Pick a plan by how many</span>
            <span className="text-white font-semibold block">applications you send a day.</span>
          </h1>
          <p className="text-[12.5px] sm:text-[13px] text-[var(--sx-tx-a1a1aa)] leading-[1.6] max-w-lg mx-auto">
            Starter includes a 7-day free trial. Higher plans raise your daily limit and add cover letters, interview prep and follow-ups.
          </p>
        </div>

        {/* ─── 2. THREE COMPACT PLAN CARDS (980px Container, Single Row on Desktop) ─── */}
        <div className="w-full max-w-[980px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-3.5 lg:gap-4 relative z-10 mb-14 sm:mb-16 items-stretch">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} isLoggedIn={isLoggedIn} />
          ))}
        </div>

        {/* ─── 3. FULL COMPARE PLANS TABLE ─── */}
        <div className="w-full max-w-[1100px] mx-auto flex justify-center mb-16 sm:mb-20">
          <ComparisonTable isLoggedIn={isLoggedIn} />
        </div>

        {/* ─── 4. FREQUENTLY ASKED QUESTIONS (COMPACT ACCORDION) ─── */}
        <div className="w-full max-w-[760px] relative z-10 mb-6">
          <div className="text-center mb-5">
            <h2 className="text-[18px] sm:text-[20px] font-semibold text-[var(--sx-tx-f5f5f5)] tracking-tight mb-1">
              Frequently asked questions
            </h2>
            <p className="text-[12px] sm:text-[12.5px] text-[var(--sx-tx-a1a1aa)]">
              Common questions about trial periods, limits, and billing.
            </p>
          </div>

          <div className="space-y-2">
            {PRICING_FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-[var(--sx-bg-141414)] border border-[var(--sx-bd-292929)] overflow-hidden transition-colors hover:border-[var(--sx-bd-383838)]"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between gap-3.5"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[12.5px] sm:text-[13px] font-medium text-[var(--sx-tx-f5f5f5)]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[var(--sx-tx-a1a1aa)] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[var(--sx-tx-f5f5f5)]" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16 }}
                      >
                        <div className="px-4 pb-3 pt-0 text-[11.5px] sm:text-[12px] text-[var(--sx-tx-a1a1aa)] leading-relaxed border-t border-[var(--sx-bd-242424)]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer showCta={false} />
    </div>
  );
}
