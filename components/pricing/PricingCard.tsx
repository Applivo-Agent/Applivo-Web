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
    <div className="relative rounded-[4px] [html.light_&]:rounded-xl bg-[var(--sx-bg-131313)] border border-[var(--sx-bd-262626)] hover:border-[var(--sx-bd-333333)] p-4 sm:p-[17px] flex flex-col justify-between transition-colors duration-150 h-full w-full">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 min-h-[24px] mb-1.5">
          <h3 className="text-[16.5px] font-medium text-[var(--sx-tx-f5f5f5)] tracking-tight">{name}</h3>
          {badge && (
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-[3px] border border-[var(--sx-bd-333333)] text-[var(--sx-tx-a1a1aa)] bg-[var(--sx-bg-1c1c1c)]">
              {badge}
            </span>
          )}
        </div>

        <p className="text-[12px] text-[var(--sx-tx-a1a1aa)] leading-[1.4] min-h-[34px] mb-3.5">{description}</p>

        <div className={`mb-3.5 flex flex-col justify-end ${compact ? "" : "min-h-[50px]"}`}>
          <div className="flex items-baseline gap-1">
            <span data-plan-price className="text-[28px] sm:text-[29px] font-medium text-[var(--sx-tx-f5f5f5)] tracking-tight leading-none">₹{price}</span>
            <span className="text-[11.5px] text-[var(--sx-tx-71717a)] font-normal">{billingPeriod}</span>
          </div>
          {note && <p className="text-[11px] text-[var(--sx-tx-71717a)] mt-1 font-normal leading-snug">{note}</p>}
        </div>

        <div className="w-full border-t border-[var(--sx-bd-262626)] mb-3.5" />

        {open && moreIntro && <p className="text-[11px] text-[var(--sx-tx-71717a)] mb-2">{moreIntro}</p>}
        <ul className="space-y-2 mb-3">
          {list.map((feat, fi) => (
            <li key={fi} className="flex items-start gap-2">
              <Check className="mt-[3px] w-3 h-3 shrink-0 text-[var(--sx-tx-71717a)]" strokeWidth={2} />
              <span className="text-[var(--sx-tx-a1a1aa)] text-[12px] leading-[1.45] font-normal">{feat}</span>
            </li>
          ))}
        </ul>
        {moreFeatures.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="self-start mb-3 text-[11.5px] text-[var(--sx-tx-71717a)] hover:text-[var(--sx-tx-f5f5f5)] transition-colors"
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
              ? "bg-[var(--sx-bg-f5f5f5)] hover:bg-white text-[var(--sx-tx-0a0a0a)] shadow-sm"
              : "bg-[var(--sx-bg-1a1a1a)] hover:bg-[var(--sx-bg-222222)] text-[var(--sx-tx-f5f5f5)] border border-[var(--sx-bd-2d2d2d)] hover:border-[var(--sx-bd-3a3a3a)]"
          }`}
        >
          {ctaText}
        </Link>
      }
    />
  );
}
