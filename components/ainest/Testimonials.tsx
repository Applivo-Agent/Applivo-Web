"use client";

import React from "react";
import Image from "next/image";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  context: string;
  avatar?: string;
  initials: string;
}

const CARD_GRADIENT_STYLE = {
  background: "var(--testimonial-card-bg)",
};

const leftTestimonials: Testimonial[] = [
  {
    quote:
      "We went from spending 4+ hours every day copying resumes and filling portal forms to automated submissions. Setup was seamless.",
    name: "Ananya Rao",
    role: "UI/UX Designer",
    context: "Active Search",
    initials: "AR",
  },
  {
    quote:
      "I tracked over 80 applications across Internshala and LinkedIn in my first two weeks. The Kanban tracker and status sync keep my search completely organized.",
    name: "Shree Harish V",
    role: "Quant Developer",
    context: "Finflock Systems Pvt Ltd",
    avatar: "/testimonials/shree-harish-portrait.png",
    initials: "SH",
  },
];

const featuredTestimonial: Testimonial = {
  quote:
    "Applivo auto-resolves tedious application questions with accurate resume context. I was able to automate targeted applications with high precision, and my interview pipeline finally breathes.",
  name: "Sudharsan",
  role: "AI Engineer",
  context: "Times Media, Malaysia",
  avatar: "/testimonials/sudharsan-formal.png",
  initials: "S",
};

const rightTestimonials: Testimonial[] = [
  {
    quote:
      "As someone switching careers, I was able to tailor match scores to real job descriptions in minutes. The AI suggestions are thoughtful and saved me so much guesswork.",
    name: "Rohit Verma",
    role: "QA Engineer",
    context: "Interview Prep",
    initials: "RV",
  },
  {
    quote:
      "In week one, Applivo streamlined my resume matching and daily application quota. The background runner works reliably while I prepare for technical rounds.",
    name: "M Sriram",
    role: "DevOps Engineer",
    context: "UOB Singapore",
    avatar: "/testimonials/sriram-portrait.png",
    initials: "MS",
  },
];

const metrics = [
  { value: "50–150", label: "Daily application quota" },
  { value: "120k+", label: "Token analysis budget" },
  { value: "100%", label: "Real-time status tracking" },
  { value: "Zero-tab", label: "Background extension runner" },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative z-10 w-full py-12 sm:py-14 md:py-14 px-4 sm:px-6 md:px-8 bg-[var(--sx-bg-090909)] overflow-hidden"
      aria-label="Customer Testimonials"
    >
      {/* ─── Centered Section Heading (Compact SaaS Two-Tone Typography) ─── */}
      <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-11">
        <span className="text-[10px] sm:text-[11px] font-medium text-[var(--sx-tx-71717a)] uppercase tracking-[0.15em] block mb-2.5">
          TESTIMONIALS
        </span>
        <h2 className="text-[26px] sm:text-[30px] md:text-[34px] lg:text-[36px] xl:text-[38px] font-semibold tracking-tight leading-[1.12] max-w-[780px] mx-auto mb-2.5">
          <span className="text-[var(--sx-tx-a1a1a1)] block">
            Trusted by job seekers building their next
          </span>
          <span className="text-white font-semibold block">
            chapter
          </span>
        </h2>
        <p className="text-[13px] sm:text-[13.5px] text-[var(--sx-tx-a1a1aa)] leading-[1.5] max-w-lg mx-auto">
          See how Applivo helps candidates organize applications, prepare smarter, and manage their job search.
        </p>
      </div>

      {/* ─── 3-Column Masonry Layout (Moderately Larger Cards: Max Width 1220px) ─── */}
      <div className="w-full max-w-[1220px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-5 items-stretch">
          {/* Left Column (2 cards stacked vertically) */}
          <div className="order-1 md:order-2 lg:order-1 md:col-span-1 flex flex-col gap-4 sm:gap-5 lg:gap-5 h-full">
            {leftTestimonials.map((t, idx) => (
              <div
                key={idx}
                style={CARD_GRADIENT_STYLE}
                className="rounded-[24px] border border-[var(--sx-bd-292929)] p-6 sm:p-[26px] lg:p-[26px] hover:border-[var(--sx-bd-383838)] transition-all duration-200 flex flex-col justify-between flex-1 min-h-[185px] sm:min-h-[195px] lg:min-h-[200px]"
              >
                <p className="text-[var(--sx-tx-e4e4e4)] text-[12px] leading-[1.55] font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto pt-6 sm:pt-7">
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-[var(--sx-bg-1e1e20)] border border-[var(--sx-bd-2a2a2a)] overflow-hidden flex items-center justify-center shrink-0">
                    {t.avatar ? (
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <span className="text-[var(--sx-tx-f5f5f5)] font-medium text-[11px] tracking-tight">
                        {t.initials}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[var(--sx-tx-f5f5f5)] font-medium text-[12px] leading-[1.4] tracking-tight truncate">
                      {t.name}
                    </h3>
                    <p className="text-[var(--sx-tx-999999)] text-[10px] leading-[1.4] mt-0.5 line-clamp-1">
                      {t.role} <span className="text-[var(--sx-tx-52525b)]">/</span> {t.context}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Center Column (Featured Card: Matches 2 side cards + gap, taller center card) */}
          <div className="order-2 md:order-1 lg:order-2 md:col-span-2 lg:col-span-1 flex flex-col h-full">
            <div
              style={CARD_GRADIENT_STYLE}
              className="rounded-[24px] border border-[var(--sx-bd-292929)] p-7 sm:p-8 lg:p-[32px] hover:border-[var(--sx-bd-383838)] transition-all duration-200 flex flex-col justify-between h-full min-h-[380px] sm:min-h-[410px] lg:min-h-[420px]"
            >
              <p className="text-[var(--sx-tx-f5f5f5)] text-[15px] font-normal leading-[1.55]">
                &ldquo;{featuredTestimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3.5 mt-auto pt-8 sm:pt-10">
                <div className="w-[72px] h-[72px] rounded-[12px] bg-[var(--sx-bg-1e1e20)] border border-[var(--sx-bd-2a2a2a)] overflow-hidden flex items-center justify-center shrink-0">
                  {featuredTestimonial.avatar ? (
                    <Image
                      src={featuredTestimonial.avatar}
                      alt={featuredTestimonial.name}
                      width={144}
                      height={144}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <span className="text-[var(--sx-tx-f5f5f5)] font-semibold text-[13px] tracking-tight">
                      {featuredTestimonial.initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[var(--sx-tx-f5f5f5)] font-medium text-[12px] sm:text-[13px] leading-[1.4] tracking-tight">
                    {featuredTestimonial.name}
                  </h3>
                  <p className="text-[var(--sx-tx-999999)] text-[10px] leading-[1.4] mt-0.5 line-clamp-1">
                    {featuredTestimonial.role} <span className="text-[var(--sx-tx-52525b)]">/</span> {featuredTestimonial.context}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (2 cards stacked vertically) */}
          <div className="order-3 md:order-3 lg:order-3 md:col-span-1 flex flex-col gap-4 sm:gap-5 lg:gap-5 h-full">
            {rightTestimonials.map((t, idx) => (
              <div
                key={idx}
                style={CARD_GRADIENT_STYLE}
                className="rounded-[24px] border border-[var(--sx-bd-292929)] p-6 sm:p-[26px] lg:p-[26px] hover:border-[var(--sx-bd-383838)] transition-all duration-200 flex flex-col justify-between flex-1 min-h-[185px] sm:min-h-[195px] lg:min-h-[200px]"
              >
                <p className="text-[var(--sx-tx-e4e4e4)] text-[12px] leading-[1.55] font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto pt-6 sm:pt-7">
                  <div className="w-[40px] h-[40px] rounded-[10px] bg-[var(--sx-bg-1e1e20)] border border-[var(--sx-bd-2a2a2a)] overflow-hidden flex items-center justify-center shrink-0">
                    {t.avatar ? (
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <span className="text-[var(--sx-tx-f5f5f5)] font-medium text-[11px] tracking-tight">
                        {t.initials}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[var(--sx-tx-f5f5f5)] font-medium text-[12px] leading-[1.4] tracking-tight truncate">
                      {t.name}
                    </h3>
                    <p className="text-[var(--sx-tx-999999)] text-[10px] leading-[1.4] mt-0.5 line-clamp-1">
                      {t.role} <span className="text-[var(--sx-tx-52525b)]">/</span> {t.context}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Compact Metrics Row (20px padding, thin #252525 divider) ─── */}
        <div className="mt-8 sm:mt-10 pt-[20px] pb-1 border-t border-[var(--sx-bd-252525)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-0">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center text-center px-4 ${
                  idx > 0 ? "md:border-l md:border-[var(--sx-bd-252525)]" : ""
                }`}
              >
                <div className="text-[23px] sm:text-[25px] font-semibold text-[var(--sx-tx-f5f5f5)] tracking-tight">
                  {m.value}
                </div>
                <div className="text-[11px] sm:text-[11.5px] text-[var(--sx-tx-a1a1aa)] mt-0.5 font-normal">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
