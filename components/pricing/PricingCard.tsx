"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PricingPlan } from "@/lib/pricing-data";

interface PricingCardProps {
  plan: PricingPlan;
  isLoggedIn: boolean;
}

export interface PricingCardShellProps {
  name: string;
  description: string;
  price: number;                    // INR per month
  billingPeriod: string;
  note?: string;
  badge?: string;                   // small neutral label next to the name ("Most popular", "Current")
  features: string[];               // always visible
  moreFeatures?: string[];          // revealed by "Show all features"
  moreIntro?: string;               // muted line above the revealed list (e.g. "Includes everything in Starter")
  compact?: boolean;                // no reserved price-block height (descriptions still reserve two lines so prices align)
  footer: React.ReactNode;          // the action, pinned to the bottom of the card
}

/** The landing-page pricing card as a presentational component, shared with /subscription. */
export function PricingCardShell({ name, description, price, billingPeriod, note, badge, features, moreFeatures = [], moreIntro, compact, footer }: PricingCardShellProps) {
  const [open, setOpen] = useState(false);
  const list = open ? [...features, ...moreFeatures] : features;
  return (
    <div className="relative rounded-[4px] bg-[#131313] border border-[#262626] hover:border-[#333333] p-4 sm:p-[17px] flex flex-col justify-between transition-colors duration-150 h-full w-full">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 min-h-[24px] mb-1.5">
          <h3 className="text-[16.5px] font-medium text-[#F5F5F5] tracking-tight">{name}</h3>
          {badge && (
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-[3px] border border-[#333333] text-[#A1A1AA] bg-[#1C1C1C]">
              {badge}
            </span>
          )}
        </div>

        <p className="text-[12px] text-[#A1A1AA] leading-[1.4] min-h-[34px] mb-3.5">{description}</p>

        <div className={`mb-3.5 flex flex-col justify-end ${compact ? "" : "min-h-[50px]"}`}>
          <div className="flex items-baseline gap-1">
            <span data-plan-price className="text-[28px] sm:text-[29px] font-medium text-[#F5F5F5] tracking-tight leading-none">₹{price}</span>
            <span className="text-[11.5px] text-[#71717A] font-normal">{billingPeriod}</span>
          </div>
          {note && <p className="text-[11px] text-[#71717A] mt-1 font-normal leading-snug">{note}</p>}
        </div>

        <div className="w-full border-t border-[#262626] mb-3.5" />

        {open && moreIntro && <p className="text-[11px] text-[#71717A] mb-2">{moreIntro}</p>}
        <ul className="space-y-2 mb-3">
          {list.map((feat, fi) => (
            <li key={fi} className="flex items-start gap-2">
              <Check className="mt-[3px] w-3 h-3 shrink-0 text-[#71717A]" strokeWidth={2} />
              <span className="text-[#A1A1AA] text-[12px] leading-[1.45] font-normal">{feat}</span>
            </li>
          ))}
        </ul>
        {moreFeatures.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="self-start mb-3 text-[11.5px] text-[#71717A] hover:text-[#F5F5F5] transition-colors"
          >
            {open ? "Show fewer features" : `Show all features (+${moreFeatures.length})`}
          </button>
        )}
      </div>

      <div className="mt-auto pt-2">{footer}</div>
    </div>
  );
}

export function PricingCard({ plan, isLoggedIn }: PricingCardProps) {
  const isPro = plan.isPopular;
  const targetHref = isLoggedIn ? "/subscription" : `/register?plan=${plan.id}`;
  const ctaText = plan.hasTrial ? "Start trial now" : "Get started";

  return (
    <PricingCardShell
      name={plan.name}
      description={plan.description}
      price={plan.monthlyPrice}
      billingPeriod={plan.billingPeriod}
      note={plan.hasTrial ? "Free for 7 days · then ₹199/month" : "Billed monthly · Cancel anytime"}
      badge={isPro ? "Most popular" : undefined}
      features={plan.features}
      footer={
        <Link
          href={targetHref}
          className={`w-full h-[36px] flex items-center justify-center rounded-[4px] text-[12px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
            isPro
              ? "bg-[#F5F5F5] hover:bg-white text-[#0A0A0A] shadow-sm"
              : "bg-[#1A1A1A] hover:bg-[#222222] text-[#F5F5F5] border border-[#2D2D2D] hover:border-[#3A3A3A]"
          }`}
        >
          {ctaText}
        </Link>
      }
    />
  );
}
