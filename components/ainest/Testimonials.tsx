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

/* Example scenarios, NOT customer reviews. The previous quotes could not be verified as genuine, owner-approved testimonials and were
   withheld (see docs/marketing/applivo_content_matrix.md). Each card describes behaviour that exists in the product. */
const leftTestimonials: Testimonial[] = [
  {
    quote:
      "You are applying to many internships between classes and keep typing the same details into each form. Upload your resume once; Applivo drafts answers from it and fills the Internshala forms in your Chrome when you start a run.",
    name: "Applying between classes",
    role: "Example scenario",
    context: "Freshers",
    initials: "01",
  },
  {
    quote:
      "You are not sure which listings are worth the effort. Each listing gets a match score with the skills you already have and the ones missing, so you can apply to the strongest fits first.",
    name: "Choosing where to apply",
    role: "Example scenario",
    context: "Match scores",
    initials: "02",
  },
];

const featuredTestimonial: Testimonial = {
  quote:
    "A screening question asks for experience you do not have. Applivo drafts the answer from your own profile only, and if you lack the requirement the draft says so instead of making something up. Numbers, choices and length limits are checked before the form is filled, and a CAPTCHA pauses the run for you.",
  name: "Answering screening questions honestly",
  role: "Example scenario",
  context: "Grounded answers",
  initials: "03",
};

const rightTestimonials: Testimonial[] = [
  {
    quote:
      "Applications are scattered across tabs and spreadsheets. They land on one board with their status, and Pro and Premium add follow-up reminders and interview tracking.",
    name: "Keeping track",
    role: "Example scenario",
    context: "Tracker",
    initials: "04",
  },
  {
    quote:
      "You are applying on LinkedIn or Indeed. Applivo does not submit there, but it can analyse a job description against your resume and draft answers you paste yourself.",
    name: "Applying on other job boards",
    role: "Example scenario",
    context: "Assisted",
    initials: "05",
  },
];

const metrics = [
  { value: "50 / 100 / 150", label: "Daily application limit by plan" },
  { value: "7 days", label: "Free trial on Starter" },
  { value: "1", label: "Source with automated applying: Internshala" },
  { value: "Your call", label: "Each run submits or waits for your review" },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative z-10 w-full py-12 sm:py-14 md:py-14 px-4 sm:px-6 md:px-8 bg-[var(--sx-bg-090909)] overflow-hidden"
      aria-label="Example scenarios"
    >
      {/* ─── Centered Section Heading (Compact SaaS Two-Tone Typography) ─── */}
      <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-11">
        <span className="text-[10px] sm:text-[11px] font-medium text-[var(--sx-tx-71717a)] uppercase tracking-[0.15em] block mb-2.5">
          HOW PEOPLE USE IT
        </span>
        <h2 className="text-[26px] sm:text-[30px] md:text-[34px] lg:text-[36px] xl:text-[38px] font-semibold tracking-tight leading-[1.12] max-w-[780px] mx-auto mb-2.5">
          <span className="text-[var(--sx-tx-a1a1a1)] block">
            Where Applivo saves
          </span>
          <span className="text-white font-semibold block">
            the most time
          </span>
        </h2>
        <p className="text-[13px] sm:text-[13.5px] text-[var(--sx-tx-a1a1aa)] leading-[1.5] max-w-lg mx-auto">
          Five example situations and what Applivo does in each. These are scenarios, not customer reviews.
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
