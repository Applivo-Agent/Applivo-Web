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
  background: "linear-gradient(180deg, #202020 0%, #191919 48%, #121212 100%)",
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
      className="relative z-10 w-full py-12 sm:py-14 md:py-14 px-4 sm:px-6 md:px-8 bg-[#090909] overflow-hidden"
      aria-label="Customer Testimonials"
    >
      {/* ─── Centered Section Heading (Compact SaaS Two-Tone Typography) ─── */}
      <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-11">
        <span className="text-[10px] sm:text-[11px] font-medium text-[#71717A] uppercase tracking-[0.15em] block mb-2.5">
          TESTIMONIALS
        </span>
        <h2 className="text-[26px] sm:text-[30px] md:text-[34px] lg:text-[36px] xl:text-[38px] font-semibold tracking-tight leading-[1.12] max-w-[780px] mx-auto mb-2.5">
          <span className="text-[#A3A3A3] block">
            Trusted by job seekers building their next
          </span>
          <span className="text-[#F5F5F5] block">
            chapter
          </span>
        </h2>
        <p className="text-[13px] sm:text-[13.5px] text-[#A1A1AA] leading-[1.5] max-w-lg mx-auto">
          See how Applivo helps candidates organize applications, prepare smarter, and manage their job search.
        </p>
      </div>

      {/* ─── 3-Column Masonry Layout (Compact Kilo Proportions: Max Width 1180px) ─── */}
      <div className="w-full max-w-[1180px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {/* Left Column (2 compact cards stacked vertically) */}
          <div className="order-1 md:order-2 lg:order-1 md:col-span-1 flex flex-col gap-3.5 sm:gap-4 h-full">
            {leftTestimonials.map((t, idx) => (
              <div
                key={idx}
                style={CARD_GRADIENT_STYLE}
                className="rounded-[24px] border border-[#2A2A2A] p-[18px] hover:border-[#383838] transition-all duration-200 flex flex-col justify-between flex-1"
              >
                <p className="text-[#E4E4E4] text-[13px] leading-[1.5] font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto pt-3.5 sm:pt-4">
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-[#1E1E20] border border-[#2A2A2A] overflow-hidden flex items-center justify-center shrink-0">
                    {t.avatar ? (
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={88}
                        height={88}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <span className="text-[#F5F5F5] font-medium text-[12px] tracking-tight">
                        {t.initials}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[#F5F5F5] font-medium text-[13px] leading-[1.4] tracking-tight truncate">
                      {t.name}
                    </h3>
                    <p className="text-[#999999] text-[11px] leading-[1.4] truncate mt-0.5">
                      {t.role} <span className="text-[#52525B]">/</span> {t.context}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Center Column (Featured Card: Matches 2 side cards + gap, compact 17px quote) */}
          <div className="order-2 md:order-1 lg:order-2 md:col-span-2 lg:col-span-1 flex flex-col h-full">
            <div
              style={CARD_GRADIENT_STYLE}
              className="rounded-[24px] border border-[#2A2A2A] p-[22px] hover:border-[#383838] transition-all duration-200 flex flex-col justify-between h-full"
            >
              <p className="text-[#F5F5F5] text-[15px] sm:text-[16px] lg:text-[17px] font-[450] leading-[1.5]">
                &ldquo;{featuredTestimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3.5 mt-auto pt-5">
                <div className="w-[88px] h-[88px] rounded-[12px] bg-[#1E1E20] border border-[#2A2A2A] overflow-hidden flex items-center justify-center shrink-0">
                  {featuredTestimonial.avatar ? (
                    <Image
                      src={featuredTestimonial.avatar}
                      alt={featuredTestimonial.name}
                      width={176}
                      height={176}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <span className="text-[#F5F5F5] font-semibold text-[15px] tracking-tight">
                      {featuredTestimonial.initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[#F5F5F5] font-medium text-[14px] leading-[1.4] tracking-tight">
                    {featuredTestimonial.name}
                  </h3>
                  <p className="text-[#999999] text-[11px] leading-[1.4] mt-0.5">
                    {featuredTestimonial.role} <span className="text-[#52525B]">/</span> {featuredTestimonial.context}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (2 compact cards stacked vertically) */}
          <div className="order-3 md:order-3 lg:order-3 md:col-span-1 flex flex-col gap-3.5 sm:gap-4 h-full">
            {rightTestimonials.map((t, idx) => (
              <div
                key={idx}
                style={CARD_GRADIENT_STYLE}
                className="rounded-[24px] border border-[#2A2A2A] p-[18px] hover:border-[#383838] transition-all duration-200 flex flex-col justify-between flex-1"
              >
                <p className="text-[#E4E4E4] text-[13px] leading-[1.5] font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto pt-3.5 sm:pt-4">
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-[#1E1E20] border border-[#2A2A2A] overflow-hidden flex items-center justify-center shrink-0">
                    {t.avatar ? (
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={88}
                        height={88}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <span className="text-[#F5F5F5] font-medium text-[12px] tracking-tight">
                        {t.initials}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[#F5F5F5] font-medium text-[13px] leading-[1.4] tracking-tight truncate">
                      {t.name}
                    </h3>
                    <p className="text-[#999999] text-[11px] leading-[1.4] truncate mt-0.5">
                      {t.role} <span className="text-[#52525B]">/</span> {t.context}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Compact Metrics Row (20px padding, thin #252525 divider) ─── */}
        <div className="mt-8 sm:mt-10 pt-[20px] pb-1 border-t border-[#252525]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-0">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center text-center px-4 ${
                  idx > 0 ? "md:border-l md:border-[#252525]" : ""
                }`}
              >
                <div className="text-[23px] sm:text-[25px] font-semibold text-[#F5F5F5] tracking-tight">
                  {m.value}
                </div>
                <div className="text-[11px] sm:text-[11.5px] text-[#A1A1AA] mt-0.5 font-normal">
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
