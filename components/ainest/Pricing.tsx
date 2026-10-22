"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRICING_PLANS } from "@/lib/pricing-data";
import { PricingCard } from "@/components/pricing/PricingCard";

export function SimplePricing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("applivo_token")));
  }, []);

  return (
    <section className="bg-[#0A0A0A] py-14 sm:py-16 md:py-20 px-4 sm:px-6 relative z-10 flex flex-col items-center overflow-hidden">
      {/* Subtle ambient light */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02),transparent_70%)]"
        aria-hidden="true"
      />

      {/* Header (Heading 30-34px, Body 13-14px) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-7 sm:mb-8 relative z-10 max-w-xl mx-auto"
      >
        <h2 className="text-[28px] sm:text-[31px] md:text-[32px] font-semibold tracking-tight text-[#F5F5F5] mb-2 leading-[1.2]">
          Simple plans. Serious progress.
        </h2>
        <p className="text-[13px] sm:text-[13.5px] text-[#A1A1AA] leading-[1.6] max-w-md mx-auto">
          Tailored for every stage of your career search. Real-time scraping, intelligent AI answers, and automated job submissions.
        </p>
      </motion.div>

      {/* Three Compact Cards Grid (Total Width: ~1,040px, Gaps: 16-18px) */}
      <div className="w-full max-w-[1040px] grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-[18px] relative z-10">
        {PRICING_PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="h-full flex flex-col"
          >
            <PricingCard plan={plan} isLoggedIn={isLoggedIn} />
          </motion.div>
        ))}
      </div>

      {/* Compare All Link */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-8 text-center"
      >
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#71717A] hover:text-[#F5F5F5] transition-colors"
        >
          Compare all plans and features
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>
    </section>
  );
}
