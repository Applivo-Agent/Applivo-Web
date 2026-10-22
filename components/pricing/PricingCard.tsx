"use client";

import React from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { PricingPlan } from "@/lib/pricing-data";

interface PricingCardProps {
  plan: PricingPlan;
  isLoggedIn: boolean;
}

interface TierVisualTheme {
  panelGradient: string;
  ambientGlow: string;
  indicatorGradient: string;
  indicatorShadow: string;
  indicatorBorder: string;
  cardBorder: string;
}

const THEMES: Record<string, TierVisualTheme> = {
  starter: {
    panelGradient: "bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),#202020_65%)]",
    ambientGlow: "bg-white/[0.08]",
    indicatorGradient: "bg-[radial-gradient(circle_at_center,#FFFFFF_15%,#E4E4E7_55%,#71717A_100%)]",
    indicatorShadow: "shadow-[0_0_8px_rgba(255,255,255,0.55)]",
    indicatorBorder: "border-white/50",
    cardBorder: "border-[#292929] hover:border-[#333333]",
  },
  pro: {
    panelGradient: "bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.15),#202020_65%)]",
    ambientGlow: "bg-orange-500/[0.22]",
    indicatorGradient: "bg-[radial-gradient(circle_at_center,#FED7AA_15%,#FB923C_55%,#EA580C_100%)]",
    indicatorShadow: "shadow-[0_0_10px_rgba(249,115,22,0.75)]",
    indicatorBorder: "border-orange-400/60",
    cardBorder: "border-[#3a3530] hover:border-[#4a423a]",
  },
  premium: {
    panelGradient: "bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.15),#202020_65%)]",
    ambientGlow: "bg-indigo-500/[0.22]",
    indicatorGradient: "bg-[radial-gradient(circle_at_center,#E0E7FF_15%,#818CF8_55%,#4F46E5_100%)]",
    indicatorShadow: "shadow-[0_0_10px_rgba(99,102,241,0.75)]",
    indicatorBorder: "border-indigo-400/60",
    cardBorder: "border-[#292929] hover:border-[#333333]",
  },
};

export function PricingCard({ plan, isLoggedIn }: PricingCardProps) {
  const isPro = plan.isPopular;
  const theme = THEMES[plan.id] || THEMES.starter;
  const targetHref = isLoggedIn ? "/subscription" : `/register?plan=${plan.id}`;
  const ctaText = plan.hasTrial ? "Start 7-Day Free Trial" : "Get Started";

  return (
    <div
      className={`relative rounded-2xl bg-[#141414] border p-4 sm:p-[18px] flex flex-col justify-between transition-colors duration-200 h-full ${theme.cardBorder}`}
    >
      <div>
        {/* ─── 1. Inner Charcoal Header Panel with Reference Glowing Ambient Corner & Indicator ─── */}
        <div
          className={`relative rounded-[13px] border border-[#2D2D2D] p-3.5 sm:p-4 mb-3.5 overflow-hidden h-[110px] flex flex-col justify-between ${theme.panelGradient}`}
        >
          {/* Top-Left Ambient Corner Light Glow */}
          <div
            className={`pointer-events-none absolute -top-5 -left-5 w-24 h-24 rounded-full blur-xl ${theme.ambientGlow}`}
            aria-hidden="true"
          />

          {/* Subtle Geometric 3x3 Square Tiles (Right side, behind text) */}
          <div
            className="pointer-events-none absolute right-2.5 top-2.5 bottom-2.5 w-18 grid grid-cols-3 gap-1.5 opacity-40 overflow-hidden"
            aria-hidden="true"
          >
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-white/[0.04]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-white/[0.08]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-white/[0.03]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-white/[0.07]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-white/[0.03]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-white/[0.10]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-white/[0.03]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-white/[0.08]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-white/[0.05]" />
          </div>

          {/* Top Row: Glowing Indicator + Plan Name + Optional Badge */}
          <div className="flex items-center justify-between gap-2 relative z-10 min-h-[20px]">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-[3px] border shrink-0 ${theme.indicatorGradient} ${theme.indicatorShadow} ${theme.indicatorBorder}`}
              />
              <span className="text-[12px] sm:text-[12.5px] font-semibold tracking-wider text-[#F5F5F5] uppercase">
                {plan.name}
              </span>
            </div>
            {plan.badge && (
              <span className="text-[9px] sm:text-[9.5px] font-medium px-2 py-0.5 rounded-full bg-[#262626] text-[#A1A1AA] border border-[#333333]">
                {plan.badge}
              </span>
            )}
          </div>

          {/* Price (29-32px) & Billing Interval (11-12px) & Note (10-11px) */}
          <div className="relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-[13px] font-semibold text-[#A1A1AA]">₹</span>
              <span className="text-[29px] sm:text-[30px] font-semibold text-[#F5F5F5] tracking-tight leading-none">
                {plan.monthlyPrice}
              </span>
              <span className="text-[#71717A] text-[11px] sm:text-[11.5px] font-normal">{plan.billingPeriod}</span>
            </div>
            <p className="text-[10px] sm:text-[10.5px] text-[#71717A] mt-1 font-normal">
              {plan.billingNote}
            </p>
          </div>
        </div>

        {/* ─── 2. Below Header Panel: Description & CTA ─── */}
        <p className="text-[12px] sm:text-[12.5px] text-[#A1A1AA] leading-relaxed mb-3.5 min-h-[36px] flex items-center">
          {plan.description}
        </p>

        {/* Primary CTA Button */}
        <Link
          href={targetHref}
          className={`w-full h-10 flex items-center justify-center rounded-xl text-[12px] font-medium sm:font-semibold transition-all duration-150 active:scale-[0.99] ${
            isPro
              ? "bg-[#F5F5F5] hover:bg-white text-[#0A0A0A] shadow-sm"
              : "bg-[#202020] hover:bg-[#282828] text-[#F5F5F5] border border-[#333333]"
          }`}
        >
          {ctaText}
        </Link>

        {/* ─── 3. Compact Features List ─── */}
        <div className="space-y-2 mt-4">
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#71717A]">
            INCLUDED FEATURES
          </p>
          <ul className="space-y-2">
            {plan.features.map((feat, fi) => (
              <li key={fi} className="flex items-start gap-2">
                <Check
                  className="mt-0.5 w-3 h-3 shrink-0 text-[#F5F5F5]"
                  strokeWidth={2.5}
                />
                <span className="text-[#A1A1AA] text-[11.5px] leading-snug font-normal">
                  {feat}
                </span>
              </li>
            ))}
          </ul>

          {/* Not Included Features (Starter Only) */}
          {plan.notIncluded && plan.notIncluded.length > 0 && (
            <div className="pt-1.5">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#52525B] mb-1.5">
                NOT INCLUDED
              </p>
              <ul className="space-y-2">
                {plan.notIncluded.map((item, ni) => (
                  <li key={ni} className="flex items-start gap-2">
                    <X className="mt-0.5 w-3 h-3 shrink-0 text-[#52525B]" strokeWidth={2} />
                    <span className="text-[#71717A] text-[11.5px] leading-snug font-normal">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
