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

      {/* Header (Record-Inspired Eyebrow, Heading, and Subtitle) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10 sm:mb-12 relative z-10 max-w-2xl mx-auto px-4"
      >
        <span className="text-[11px] sm:text-[11.5px] font-medium text-[#71717A] uppercase tracking-[0.15em] block mb-3">
          PRICING
        </span>
        <h2 className="text-[30px] sm:text-[34px] md:text-[36px] font-semibold tracking-tight mb-3 leading-[1.2]">
          <span className="text-[#a1a1a1] block">Simple plans.</span>
          <span className="text-white font-semibold block">Serious progress.</span>
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-[#A1A1AA] leading-[1.6] max-w-lg mx-auto">
          Choose the right plan for your job search and unlock the tools you need to move forward.
        </p>
      </motion.div>

      {/* Three Compact Cards Grid (Total Width: ~980px, Gaps: 14-16px) */}
      <div className="w-full max-w-[980px] grid grid-cols-1 md:grid-cols-3 gap-3.5 lg:gap-4 relative z-10 items-stretch">
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
