"use client";

import React from "react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  context: string;
  initials: string;
}

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
    name: "Arjun Mehta",
    role: "Software Engineer",
    context: "Scale Applications",
    initials: "AM",
  },
];

const featuredTestimonial: Testimonial = {
  quote:
    "Applivo auto-resolves tedious application questions with accurate resume context. Candidates get consistent submissions without burnout, and my interview pipeline finally breathes.",
  name: "Priya Sharma",
  role: "Frontend Engineer",
  context: "Career Transition",
  initials: "PS",
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
    name: "Nisha Kapoor",
    role: "DevOps Analyst",
    context: "Automated Discovery",
    initials: "NK",
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
      className="relative z-10 w-full py-14 sm:py-16 md:py-16 px-4 sm:px-6 md:px-8 bg-[#0A0A0A] overflow-hidden"
      aria-label="Customer Testimonials"
    >
      {/* ─── Centered Section Heading (Compact SaaS Typography) ─── */}
      <div className="max-w-2xl mx-auto text-center mb-9 sm:mb-10">
        <span className="text-[10px] sm:text-[11px] font-medium text-[#71717A] uppercase tracking-[0.15em] block mb-3">
          TESTIMONIALS
        </span>
        <h2 className="text-[26px] sm:text-[30px] md:text-[32px] font-semibold text-[#F5F5F5] tracking-tight leading-[1.2] max-w-[650px] mx-auto mb-3">
          Trusted by job seekers building their next chapter
        </h2>
        <p className="text-[13px] sm:text-[13.5px] text-[#A1A1AA] leading-[1.5] max-w-lg mx-auto">
          See how Applivo helps candidates organize applications, prepare smarter, and manage their job search.
        </p>
      </div>

      {/* ─── 3-Column Masonry Layout (Max Width: 1,180px) ─── */}
      <div className="w-full max-w-[1180px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px] md:gap-[16px] items-start">
          {/* Left Column (2 cards) */}
          <div className="flex flex-col gap-[14px]">
            {leftTestimonials.map((t, idx) => (
              <div
                key={idx}
                className="rounded-[18px] sm:rounded-[20px] bg-[#151515] border border-[#252525] p-4 sm:p-[18px] hover:border-[#333333] hover:bg-[#181818] transition-all duration-200 flex flex-col justify-between"
              >
                <p className="text-[#E5E5E5] text-[13px] sm:text-[13.5px] leading-[1.55] font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2.5 sm:gap-3 mt-4 sm:mt-[18px]">
                  <div className="w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#202022] border border-[#2D2D30] flex items-center justify-center shrink-0">
                    <span className="text-[#F5F5F5] font-semibold text-[12px] sm:text-[12.5px] tracking-tight">
                      {t.initials}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[#F5F5F5] font-medium text-[13px] tracking-tight truncate">
                      {t.name}
                    </h3>
                    <p className="text-[#A1A1AA] text-[11.5px] sm:text-[12px] truncate mt-0.5">
                      {t.role} <span className="text-[#52525B]">/</span> {t.context}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Center Column (Featured Card: ~350–390px tall) */}
          <div className="flex flex-col">
            <div className="rounded-[18px] sm:rounded-[20px] bg-[#151515] border border-[#252525] p-5 sm:p-[20px] hover:border-[#333333] hover:bg-[#181818] transition-all duration-200 flex flex-col justify-between min-h-[350px] md:min-h-[370px]">
              <p className="text-[#F5F5F5] text-[15px] sm:text-[16px] font-medium leading-[1.55]">
                &ldquo;{featuredTestimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3.5 sm:gap-4 mt-6 sm:mt-8">
                <div className="w-[54px] h-[54px] sm:w-[58px] sm:h-[58px] rounded-[12px] bg-[#202022] border border-[#2D2D30] flex items-center justify-center shrink-0">
                  <span className="text-[#F5F5F5] font-semibold text-[15px] sm:text-[16px] tracking-tight">
                    {featuredTestimonial.initials}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[#F5F5F5] font-medium text-[13.5px] sm:text-[14px] tracking-tight truncate">
                    {featuredTestimonial.name}
                  </h3>
                  <p className="text-[#A1A1AA] text-[11.5px] sm:text-[12px] truncate mt-0.5">
                    {featuredTestimonial.role} <span className="text-[#52525B]">/</span> {featuredTestimonial.context}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (2 cards) */}
          <div className="flex flex-col gap-[14px]">
            {rightTestimonials.map((t, idx) => (
              <div
                key={idx}
                className="rounded-[18px] sm:rounded-[20px] bg-[#151515] border border-[#252525] p-4 sm:p-[18px] hover:border-[#333333] hover:bg-[#181818] transition-all duration-200 flex flex-col justify-between"
              >
                <p className="text-[#E5E5E5] text-[13px] sm:text-[13.5px] leading-[1.55] font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2.5 sm:gap-3 mt-4 sm:mt-[18px]">
                  <div className="w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-[10px] bg-[#202022] border border-[#2D2D30] flex items-center justify-center shrink-0">
                    <span className="text-[#F5F5F5] font-semibold text-[12px] sm:text-[12.5px] tracking-tight">
                      {t.initials}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[#F5F5F5] font-medium text-[13px] tracking-tight truncate">
                      {t.name}
                    </h3>
                    <p className="text-[#A1A1AA] text-[11.5px] sm:text-[12px] truncate mt-0.5">
                      {t.role} <span className="text-[#52525B]">/</span> {t.context}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Compact Metrics Row (20px padding, thin #252525 divider) ─── */}
        <div className="mt-9 sm:mt-10 pt-[20px] pb-1 border-t border-[#252525]">
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
