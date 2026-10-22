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
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] selection:bg-white/20 flex flex-col justify-between">
      <NavBar />

      <main className="pt-16 sm:pt-20 md:pt-24 pb-14 px-4 sm:px-6 relative z-10 flex flex-col items-center flex-1">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02),transparent_70%)]"
          aria-hidden="true"
        />

        {/* ─── 1. PAGE HEADER (COMPACT TYPOGRAPHY & REFINED SPACING) ─── */}
        <div className="text-center mb-7 sm:mb-8 relative z-10 max-w-xl mx-auto">
          <h1 className="text-[28px] sm:text-[31px] md:text-[32px] font-semibold tracking-tight text-[#F5F5F5] mb-2 leading-[1.2]">
            Choose your plan
          </h1>
          <p className="text-[13px] sm:text-[13.5px] text-[#A1A1AA] leading-[1.6] max-w-md mx-auto">
            Tailored for every stage of your career search. All plans include automated scraping, AI answering, and real-time tracking.
          </p>
        </div>

        {/* ─── 2. THREE COMPACT MONOCHROME PRICING CARDS (1,040px Container) ─── */}
        <div className="w-full max-w-[1040px] grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-[18px] relative z-10 mb-12 sm:mb-14">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} isLoggedIn={isLoggedIn} />
          ))}
        </div>

        {/* ─── 3. FULL COMPARE PLANS TABLE (DENSE & COMPACT) ─── */}
        <div className="w-full flex justify-center mb-14 sm:mb-16">
          <ComparisonTable isLoggedIn={isLoggedIn} />
        </div>

        {/* ─── 4. FREQUENTLY ASKED QUESTIONS (COMPACT ACCORDION) ─── */}
        <div className="w-full max-w-[760px] relative z-10 mb-6">
          <div className="text-center mb-5">
            <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#F5F5F5] tracking-tight mb-1">
              Frequently asked questions
            </h2>
            <p className="text-[12px] sm:text-[12.5px] text-[#A1A1AA]">
              Common questions about trial periods, limits, and billing.
            </p>
          </div>

          <div className="space-y-2">
            {PRICING_FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-[#141414] border border-[#292929] overflow-hidden transition-colors hover:border-[#383838]"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between gap-3.5"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[12.5px] sm:text-[13px] font-medium text-[#F5F5F5]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#A1A1AA] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#F5F5F5]" : ""
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
                        <div className="px-4 pb-3 pt-0 text-[11.5px] sm:text-[12px] text-[#A1A1AA] leading-relaxed border-t border-[#242424]">
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
