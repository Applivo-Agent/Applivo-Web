"use client";

import { motion } from "framer-motion";
import { Check, Zap, Star, Crown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const plans = [
  {
    tier: "starter",
    name: "Starter",
    icon: <Zap className="w-4 h-4" />,
    description: "Perfect for students & fresh job seekers",
    monthlyPrice: 199,
    yearlyPrice: 159,
    trialFree: true,
    highlight: false,
    badge: null,
    color: "slate",
    features: [
      "50 daily applications",
      "Analyze budget: 25k tokens/run",
      "Analyze budget: 120k tokens/month",
      "Internshala scraping",
      "Auto-apply bot",
      "Resume upload & management",
      "AI match scoring",
      "Basic analytics",
      "Email notifications",
      "Application tracking (Kanban)",
      "AI Chat assistant (50 messages/month)",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    icon: <Star className="w-4 h-4" />,
    description: "For serious job hunters who want every edge",
    monthlyPrice: 399,
    yearlyPrice: 319,
    trialFree: false,
    highlight: true,
    badge: "Popular",
    color: "white",
    features: [
      "100 daily applications",
      "Analyze budget: 60k tokens/run",
      "Analyze budget: 600k tokens/month",
      "Everything in Starter",
      "Advanced AI analysis",
      "Cover letter generator",
      "Telegram notifications",
      "Interview tracking & prep",
      "Email inbox monitoring (IMAP)",
      "7-day follow-up automation",
      "Priority queue processing",
      "Skill gap analysis",
      "AI Chat assistant (100 messages/month)",
    ],
  },
  {
    tier: "premium",
    name: "Premium",
    icon: <Crown className="w-4 h-4" />,
    description: "Maximum power for executives & professionals",
    monthlyPrice: 599,
    yearlyPrice: 479,
    trialFree: false,
    highlight: false,
    badge: null,
    color: "zinc",
    features: [
      "150 daily applications",
      "Analyze budget: Unlimited",
      "AI Chat assistant (150 messages/month)",
      "Everything in Pro",
      "Highest priority queue",
      "Advanced analytics",
      "Market insights & salary data",
      "Resume performance ranking",
      "Interview conversion funnel",
      "Dedicated support",
    ],
  },
];

type CellValue = boolean | string;

const compareRows: {
  section: string;
  rows: { label: string; starter: CellValue; pro: CellValue; premium: CellValue }[];
}[] = [
  {
    section: "Applications",
    rows: [
      { label: "Daily applications", starter: "50", pro: "100", premium: "150" },
      { label: "Internshala scraping", starter: true, pro: true, premium: true },
      { label: "Auto-apply bot", starter: true, pro: true, premium: true },
      { label: "Application tracking (Kanban)", starter: true, pro: true, premium: true },
      { label: "Priority queue processing", starter: false, pro: true, premium: true },
      { label: "Highest priority queue", starter: false, pro: false, premium: true },
    ],
  },
  {
    section: "AI & Analysis",
    rows: [
      { label: "AI analyze budget / run", starter: "25k tokens", pro: "60k tokens", premium: "120k tokens" },
      { label: "AI analyze budget / month", starter: "120k tokens", pro: "600k tokens", premium: "Unlimited" },
      { label: "AI match scoring", starter: true, pro: true, premium: true },
      { label: "Advanced AI analysis", starter: false, pro: true, premium: true },
      { label: "Skill gap analysis", starter: false, pro: true, premium: true },
      { label: "Market insights & salary data", starter: false, pro: false, premium: true },
    ],
  },
  {
    section: "Resume & Career",
    rows: [
      { label: "Resume upload & management", starter: true, pro: true, premium: true },
      { label: "Cover letter generator", starter: false, pro: true, premium: true },
      { label: "Interview tracking & prep", starter: false, pro: true, premium: true },
      { label: "Resume performance ranking", starter: false, pro: false, premium: true },
      { label: "Interview conversion funnel", starter: false, pro: false, premium: true },
    ],
  },
  {
    section: "Notifications & Automation",
    rows: [
      { label: "Email notifications", starter: true, pro: true, premium: true },
      { label: "Telegram notifications", starter: false, pro: true, premium: true },
      { label: "Email inbox monitoring (IMAP)", starter: false, pro: true, premium: true },
      { label: "7-day follow-up automation", starter: false, pro: true, premium: true },
    ],
  },
  {
    section: "Analytics",
    rows: [
      { label: "Basic analytics", starter: true, pro: true, premium: true },
      { label: "Advanced analytics dashboard", starter: false, pro: true, premium: true },
      { label: "Market insights & salary data", starter: false, pro: false, premium: true },
    ],
  },
  {
    section: "AI Chat Assistant",
    rows: [
      { label: "Messages per month", starter: "50", pro: "100", premium: "150" },
    ],
  },
  {
    section: "Support",
    rows: [
      { label: "Email support", starter: "Basic", pro: "Priority", premium: "Priority" },
      { label: "Dedicated support", starter: false, pro: false, premium: true },
    ],
  },
];

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <div className="flex justify-center">
        <Check
          className={`w-[18px] h-[18px] ${highlight ? "text-white" : "text-zinc-400"}`}
          strokeWidth={2.5}
        />
      </div>
    ) : (
      <div className="flex justify-center">
        <span className="text-[#2a2a2a] text-[length:var(--fs-heading)] leading-none font-light">—</span>
      </div>
    );
  }
  return (
    <span className={`text-[length:var(--fs-base)] text-center block font-medium ${highlight ? "text-white" : "text-zinc-400"}`}>
      {value}
    </span>
  );
}

export function SimplePricing() {
  const [yearly, setYearly] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("applivo_token")));
  }, []);

  return (
    <section className="bg-[#0a0a0a] py-32 px-6 relative z-10 flex flex-col items-center">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1] }}
        className="text-center mb-12"
      >
        <p className="text-zinc-400 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.1em] mb-2.5">Pricing</p>
        <h2 className="k-h2 text-[26px] sm:text-[28px] md:text-[32px] font-semibold tracking-tight text-white mb-3 leading-[1.2]">
          Simple, transparent plans
        </h2>
        <p className="k-body text-[14.5px] sm:text-[15.5px] text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Tailored for every stage of your career journey. No hidden fees, cancel anytime.
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <div className="w-full max-w-[1160px] grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan, i) => {
          const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isHighlight = plan.highlight;

          return (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-[24px] bg-[#121212] border overflow-hidden flex flex-col transition-all duration-300 ${
                isHighlight
                  ? "border-white/20 shadow-[0_0_60px_-10px_rgba(255,255,255,0.1)] scale-[1.02]"
                  : "border-white/[0.08] hover:border-white/[0.08]"
              }`}
            >
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/15">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="relative z-10 p-7 flex flex-col flex-1">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-white font-semibold text-[17px] sm:text-[18px] tracking-tight">{plan.name}</span>
                </div>
                <p className="text-zinc-400 text-[13.5px] sm:text-[14px] mb-6 leading-relaxed">{plan.description}</p>

                {plan.trialFree ? (
                  <div className="mb-6">
                    <div className="flex items-end gap-2">
                      <span className="text-[28px] sm:text-[32px] font-semibold text-white leading-none tracking-tight">Free</span>
                      <span className="text-[#555] line-through text-[14px] mb-1.5">₹{price}/mo</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1.5">7-day free trial · then ₹{price}/mo</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-[14px] text-zinc-400 mb-2">₹</span>
                      <span className="text-[28px] sm:text-[32px] font-semibold text-white leading-none tracking-tight">{price}</span>
                      <span className="text-zinc-500 text-[13px] mb-1.5">/mo</span>
                    </div>
                    {yearly && <p className="text-[11px] text-zinc-500 mt-1.5">Billed ₹{price * 12}/year</p>}
                  </div>
                )}

                <div className="h-px bg-white/[0.06] mb-5" />

                <div className="space-y-3 flex-1">
                  {plan.features.map((feat, fi) => (
                    <div key={fi} className="flex items-start gap-3">
                      <Check className={`mt-0.5 w-3.5 h-3.5 shrink-0 ${isHighlight ? "text-white" : "text-zinc-500"}`} strokeWidth={3} />
                      <span className="text-zinc-300 text-[13.5px] sm:text-[14px] leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>

                {plan.trialFree ? (
                  <div className="mt-8 flex flex-col items-center gap-1.5">
                    <Link
                      href={isLoggedIn ? "/subscription" : "/register"}
                      className="block w-full text-center py-3 rounded-xl text-[length:var(--fs-base)] font-semibold transition-all bg-white text-black hover:bg-zinc-100"
                    >
                      Start 7-Day Free Trial
                    </Link>
                    <p className="text-[11px] text-[#444]">No charge for 7 days · ₹{price}/mo after</p>
                  </div>
                ) : (
                  <Link
                    href={isLoggedIn ? "/subscription" : "/register"}
                    className={`mt-8 block w-full text-center py-3 rounded-xl text-[length:var(--fs-base)] font-semibold transition-all ${
                      isHighlight
                        ? "bg-white text-black hover:bg-zinc-100"
                        : "bg-[#121212] text-white border border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    Get started
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 mt-10 mb-20"
      >
        <span className={`text-[length:var(--fs-base)] font-medium transition-colors ${!yearly ? "text-white" : "text-[#555]"}`}>Monthly</span>
        <button
          onClick={() => setYearly((v) => !v)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${yearly ? "bg-white" : "bg-[#2a2a2a]"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200 ${
              yearly ? "translate-x-5 bg-black" : "translate-x-0 bg-[#666]"
            }`}
          />
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-[length:var(--fs-base)] font-medium transition-colors ${yearly ? "text-white" : "text-[#555]"}`}>Yearly</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            SAVE 20%
          </span>
        </div>
      </motion.div>

      {/* Compare Plans Table */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1] }}
        className="w-full max-w-[1136px]"
      >
        <h3 className="text-[22px] sm:text-[24px] font-semibold text-white text-center mb-2 tracking-tight">Compare Plans</h3>
        <p className="text-zinc-400 text-[14px] sm:text-[14.5px] text-center mb-10">
          Everything you need to automate your job search, compared side by side.
        </p>

        <div className="border border-white/[0.08] rounded-2xl overflow-hidden">

          {/* Sticky plan header */}
          <div className="sticky top-0 z-20 bg-[#121212] border-b border-white/[0.08]" style={{ display: "grid", gridTemplateColumns: "35% 1fr 1fr 1fr" }}>

            {/* Toggle cell */}
            <div className="p-6 flex flex-col justify-center gap-2">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setYearly((v) => !v)}
                  className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0 ${yearly ? "bg-white" : "bg-[#2a2a2a]"}`}
                >
                  <span
                    className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full transition-transform duration-200 ${
                      yearly ? "translate-x-[18px] bg-black" : "translate-x-0 bg-[#666]"
                    }`}
                  />
                </button>
                <span className={`text-[13px] font-medium ${yearly ? "text-white" : "text-zinc-400"}`}>Yearly</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  SAVE 20%
                </span>
              </div>
            </div>

            {plans.map((p) => {
              const price = yearly ? p.yearlyPrice : p.monthlyPrice;
              return (
                <div
                  key={p.tier}
                  className={`p-6 border-l border-white/[0.08] ${p.highlight ? "bg-white/[0.025]" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-[16px] sm:text-[17px] tracking-tight">{p.name}</span>
                    {p.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  {p.trialFree ? (
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-white font-bold text-[length:var(--fs-title)]">Free</span>
                      <span className="text-[#3a3a3a] line-through text-[length:var(--fs-base)]">₹{price}/mo</span>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="text-white font-bold text-[length:var(--fs-title)]">₹{price}</span>
                      <span className="text-[#555] text-[length:var(--fs-base)]"> /month</span>
                    </div>
                  )}
                  <Link
                    href={isLoggedIn ? "/subscription" : "/register"}
                    className={`block w-full text-center py-2.5 rounded-lg text-[length:var(--fs-base)] font-semibold transition-all ${
                      p.highlight
                        ? "bg-white text-black hover:bg-zinc-100"
                        : "bg-[#121212] text-white border border-white/[0.08] hover:border-white/25"
                    }`}
                  >
                    {p.trialFree ? "Start free trial" : "Get started"}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Feature sections */}
          {compareRows.map((section, si) => (
            <div key={si}>
              {/* Section label */}
              <div className="px-6 py-3 bg-[#0a0a0a] border-t border-white/[0.08]">
                <span className="text-[11px] text-[#3a3a3a] uppercase tracking-[0.18em] font-semibold">
                  {section.section}
                </span>
              </div>

              {/* Feature rows */}
              {section.rows.map((row, ri) => (
                <div
                  key={ri}
                  className="border-t border-white/[0.08] hover:bg-white/[0.012] transition-colors"
                  style={{ display: "grid", gridTemplateColumns: "35% 1fr 1fr 1fr" }}
                >
                  <div className="px-6 py-4 text-[#a1a1a1] text-[length:var(--fs-base)] flex items-center">{row.label}</div>
                  {([row.starter, row.pro, row.premium] as CellValue[]).map((val, ci) => (
                    <div
                      key={ci}
                      className={`px-6 py-4 flex items-center justify-center border-l border-white/[0.08] ${
                        plans[ci].highlight ? "bg-white/[0.015]" : ""
                      }`}
                    >
                      <Cell value={val} highlight={plans[ci].highlight} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* Bottom CTA row */}
          <div
            className="border-t border-white/[0.08] bg-[#0a0a0a]"
            style={{ display: "grid", gridTemplateColumns: "35% 1fr 1fr 1fr" }}
          >
            <div className="p-6" />
            {plans.map((p) => (
              <div
                key={p.tier}
                className={`p-6 border-l border-white/[0.08] flex justify-center ${p.highlight ? "bg-white/[0.02]" : ""}`}
              >
                <Link
                  href={isLoggedIn ? "/subscription" : "/register"}
                  className={`px-8 py-2.5 rounded-xl text-[length:var(--fs-base)] font-semibold transition-all ${
                    p.highlight
                      ? "bg-white text-black hover:bg-zinc-100"
                      : "bg-[#121212] text-white border border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  {p.trialFree ? "Start free trial" : "Get started"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </section>
  );
}
