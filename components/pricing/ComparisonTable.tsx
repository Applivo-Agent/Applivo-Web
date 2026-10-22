"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  PRICING_PLANS,
  COMPARISON_SECTIONS,
  ComparisonCellValue,
} from "@/lib/pricing-data";

function ComparisonCell({
  value,
  isPro,
}: {
  value: ComparisonCellValue;
  isPro?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <div className="flex justify-center items-center">
        <Check className="w-3.5 h-3.5 text-[#E4E4E7]" strokeWidth={2.5} />
      </div>
    ) : (
      <div className="flex justify-center items-center">
        <span className="text-[#52525B] text-[13px] font-normal select-none leading-none">—</span>
      </div>
    );
  }

  return (
    <span
      className={`text-[13px] sm:text-[13.5px] text-center block ${
        isPro ? "text-[#F5F5F5] font-medium" : "text-[#A1A1AA] font-normal"
      }`}
    >
      {value}
    </span>
  );
}

export function ComparisonTable({ isLoggedIn }: { isLoggedIn: boolean }) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "35% 21.67% 21.67% 21.66%",
  };

  return (
    <div className="w-full max-w-[1060px] mx-auto relative z-10">
      {/* ─── Heading & Subtitle ─── */}
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-[24px] sm:text-[25px] md:text-[26px] font-medium text-[#F5F5F5] tracking-tight">
          Compare Plans
        </h2>
        <p className="text-[13.5px] sm:text-[14px] text-[#A1A1AA] mt-2 sm:mt-2.5 max-w-md mx-auto">
          Review every limit, quota, and intelligence feature side by side.
        </p>
      </div>

      {/* ─── Table Outer Surface ─── */}
      <div className="border border-[#262626] rounded-[16px] bg-[#0D0D0D] overflow-hidden shadow-sm">
        {/* Horizontal Scroll wrapper for responsive mobile reading */}
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[700px] sm:min-w-[760px] md:min-w-0">
            {/* ─── Table Header (Height: 76–84px) ─── */}
            <div
              className="sticky top-0 z-20 bg-[#111111] border-b border-[#242424]"
              style={gridStyle}
            >
              <div className="px-5 py-4 flex items-center min-h-[80px]">
                <span className="text-[11px] sm:text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                  Feature Breakdown
                </span>
              </div>

              {PRICING_PLANS.map((plan) => {
                const isPro = plan.isPopular;
                return (
                  <div
                    key={plan.id}
                    className={`px-4 py-4 border-l border-[#242424] text-center flex flex-col justify-center items-center min-h-[80px] ${
                      isPro ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <span className="text-[14px] sm:text-[15px] font-medium text-[#F5F5F5] tracking-tight">
                      {plan.name}
                    </span>
                    <span className="text-[12px] text-[#A1A1AA] mt-0.5 font-normal">
                      ₹{plan.monthlyPrice}
                      <span className="text-[#71717A]"> /month</span>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ─── Feature Sections & Rows ─── */}
            {COMPARISON_SECTIONS.map((section, sIndex) => (
              <div key={sIndex}>
                {/* Category Separator Row (Height: 42–46px, bg: #111111, text: #71717A) */}
                <div className="px-5 min-h-[44px] flex items-center bg-[#111111] border-t border-[#242424]">
                  <span className="text-[10px] sm:text-[11px] text-[#71717A] uppercase tracking-[0.15em] font-semibold">
                    {section.section}
                  </span>
                </div>

                {/* Standard Feature Rows (Height: 48–52px) */}
                {section.rows.map((row, rIndex) => (
                  <div
                    key={rIndex}
                    className="border-t border-[#202020] hover:bg-white/[0.012] transition-colors"
                    style={gridStyle}
                  >
                    {/* Feature Name */}
                    <div className="px-5 py-[13px] text-[#A1A1AA] text-[13px] sm:text-[13.5px] font-normal flex items-center leading-snug min-h-[50px]">
                      {row.label}
                    </div>

                    {/* Starter */}
                    <div className="px-4 py-[13px] flex items-center justify-center border-l border-[#222222] min-h-[50px]">
                      <ComparisonCell value={row.starter} />
                    </div>

                    {/* Pro (subtle column highlight) */}
                    <div className="px-4 py-[13px] flex items-center justify-center border-l border-[#222222] bg-white/[0.015] min-h-[50px]">
                      <ComparisonCell value={row.pro} isPro />
                    </div>

                    {/* Premium */}
                    <div className="px-4 py-[13px] flex items-center justify-center border-l border-[#222222] min-h-[50px]">
                      <ComparisonCell value={row.premium} />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* ─── Bottom CTA Row ─── */}
            <div
              className="border-t border-[#242424] bg-[#0E0E0E] min-h-[64px]"
              style={gridStyle}
            >
              <div className="px-5 py-3.5 flex items-center text-[12px] text-[#71717A]">
                Get started today. Cancel anytime.
              </div>

              {PRICING_PLANS.map((plan) => {
                const isPro = plan.isPopular;
                const targetHref = isLoggedIn ? "/subscription" : `/register?plan=${plan.id}`;
                const btnLabel = plan.hasTrial ? "Start trial" : "Select plan";

                return (
                  <div
                    key={plan.id}
                    className={`px-4 py-3 border-l border-[#242424] flex justify-center items-center ${
                      isPro ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <Link
                      href={targetHref}
                      className={`w-full max-w-[130px] text-center py-2 px-3 rounded-lg text-[12px] font-medium transition-all ${
                        isPro
                          ? "bg-[#F5F5F5] hover:bg-white text-[#0A0A0A] shadow-sm"
                          : "bg-[#161616] hover:bg-[#202020] text-[#F5F5F5] border border-[#2E2E2E] hover:border-[#3E3E3E]"
                      }`}
                    >
                      {btnLabel}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
