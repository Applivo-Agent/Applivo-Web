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
        <Check className="w-3 h-3 text-[#F5F5F5]" strokeWidth={2.5} />
      </div>
    ) : (
      <div className="flex justify-center items-center">
        <span className="text-[#52525B] text-xs font-light select-none">—</span>
      </div>
    );
  }

  return (
    <span
      className={`text-[11px] sm:text-[11.5px] text-center block font-medium ${
        isPro ? "text-[#F5F5F5]" : "text-[#A1A1AA]"
      }`}
    >
      {value}
    </span>
  );
}

export function ComparisonTable({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="w-full max-w-[1040px] relative z-10">
      <div className="text-center mb-5">
        <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#F5F5F5] tracking-tight mb-1">
          Compare plan capabilities
        </h2>
        <p className="text-[12px] sm:text-[12.5px] text-[#A1A1AA] max-w-md mx-auto">
          Review every limit, quota, and intelligence feature side by side.
        </p>
      </div>

      <div className="border border-[#292929] rounded-2xl bg-[#141414] overflow-hidden shadow-sm">
        {/* Horizontal Scroll wrapper for responsive mobile reading */}
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[640px]">
            {/* Table Header (Plans Columns) */}
            <div
              className="sticky top-0 z-20 bg-[#171717] border-b border-[#292929]"
              style={{ display: "grid", gridTemplateColumns: "37% 21% 21% 21%" }}
            >
              <div className="p-3 sm:p-3.5 flex items-center">
                <span className="text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                  Feature Breakdown
                </span>
              </div>

              {PRICING_PLANS.map((plan) => {
                const isPro = plan.isPopular;
                return (
                  <div
                    key={plan.id}
                    className={`p-3 sm:p-3.5 border-l border-[#292929] text-center flex flex-col justify-center ${
                      isPro ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span className="text-[#F5F5F5] font-semibold text-[12.5px] sm:text-[13px] tracking-tight">
                        {plan.name}
                      </span>
                    </div>
                    <span className="text-[#A1A1AA] text-[11px] font-medium">
                      ₹{plan.monthlyPrice}
                      <span className="text-[#71717A] font-normal">/mo</span>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Feature Sections & Rows */}
            {COMPARISON_SECTIONS.map((section, sIndex) => (
              <div key={sIndex}>
                {/* Section Label Header */}
                <div className="px-3.5 sm:px-4 py-1.5 bg-[#1a1a1a] border-t border-[#292929]">
                  <span className="text-[9.5px] sm:text-[10px] text-[#A1A1AA] uppercase tracking-[0.14em] font-semibold">
                    {section.section}
                  </span>
                </div>

                {/* Section Feature Rows */}
                {section.rows.map((row, rIndex) => (
                  <div
                    key={rIndex}
                    className="border-t border-[#242424] hover:bg-white/[0.012] transition-colors"
                    style={{ display: "grid", gridTemplateColumns: "37% 21% 21% 21%" }}
                  >
                    <div className="px-3.5 sm:px-4 py-2 text-[#A1A1AA] text-[11.5px] sm:text-[12px] flex items-center font-normal">
                      {row.label}
                    </div>

                    {/* Starter */}
                    <div className="px-3 py-2 flex items-center justify-center border-l border-[#242424]">
                      <ComparisonCell value={row.starter} />
                    </div>

                    {/* Pro (subtle column highlight) */}
                    <div className="px-3 py-2 flex items-center justify-center border-l border-[#242424] bg-white/[0.015]">
                      <ComparisonCell value={row.pro} isPro />
                    </div>

                    {/* Premium */}
                    <div className="px-3 py-2 flex items-center justify-center border-l border-[#242424]">
                      <ComparisonCell value={row.premium} />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Bottom CTA Row inside comparison table */}
            <div
              className="border-t border-[#292929] bg-[#171717]"
              style={{ display: "grid", gridTemplateColumns: "37% 21% 21% 21%" }}
            >
              <div className="p-3 sm:p-3.5 flex items-center text-[11px] text-[#71717A]">
                Get started today. Cancel anytime.
              </div>

              {PRICING_PLANS.map((plan) => {
                const isPro = plan.isPopular;
                const targetHref = isLoggedIn ? "/subscription" : `/register?plan=${plan.id}`;
                const btnLabel = plan.hasTrial ? "Start trial" : "Select plan";

                return (
                  <div
                    key={plan.id}
                    className={`p-2.5 sm:p-3 border-l border-[#292929] flex justify-center items-center ${
                      isPro ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <Link
                      href={targetHref}
                      className={`w-full text-center py-1.5 px-2.5 rounded-lg text-[11.5px] font-medium sm:font-semibold transition-all ${
                        isPro
                          ? "bg-[#F5F5F5] hover:bg-white text-[#0A0A0A]"
                          : "bg-[#202020] hover:bg-[#282828] text-[#F5F5F5] border border-[#333333]"
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
