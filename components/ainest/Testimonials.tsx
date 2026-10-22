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
      className="relative z-10 w-full py-20 md:py-28 px-4 sm:px-6 md:px-8 bg-[#0A0A0A] overflow-hidden"
      aria-label="Customer Testimonials"
    >
      {/* ─── Centered Section Heading ─── */}
      <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
        <span className="text-[11px] sm:text-[12px] font-medium text-[#71717A] uppercase tracking-[0.15em] block mb-3.5">
          TESTIMONIALS
        </span>
        <h2 className="text-[28px] sm:text-[34px] md:text-[38px] font-semibold text-[#F5F5F5] tracking-tight leading-[1.18] max-w-[620px] mx-auto mb-3.5">
          Trusted by job seekers building their next chapter
        </h2>
        <p className="text-[15px] sm:text-[15.5px] text-[#A1A1AA] leading-[1.6] max-w-xl mx-auto">
          See how Applivo helps candidates organize applications, prepare smarter, and manage their job search.
        </p>
      </div>

      {/* ─── 3-Column Masonry-Inspired Grid (1,180–1,220px Max Width) ─── */}
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-[16px] items-start">
          {/* Left Column (2 cards) */}
          <div className="flex flex-col gap-4">
            {leftTestimonials.map((t, idx) => (
              <div
                key={idx}
                className="rounded-[24px] bg-[#161616] border border-[#242424] p-5 sm:p-6 hover:border-[#333333] hover:bg-[#181818] transition-all duration-200 flex flex-col justify-between"
              >
                <p className="text-[#E5E5E5] text-[14px] sm:text-[14.5px] leading-[1.6] font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3.5 mt-6">
                  <div className="w-[44px] h-[44px] rounded-[12px] bg-[#202022] border border-[#2D2D30] flex items-center justify-center shrink-0">
                    <span className="text-[#F5F5F5] font-semibold text-[13.5px] tracking-tight">
                      {t.initials}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[#F5F5F5] font-medium text-[14px] sm:text-[14.5px] tracking-tight truncate">
                      {t.name}
                    </h3>
                    <p className="text-[#A1A1AA] text-[12px] sm:text-[12.5px] truncate mt-0.5">
                      {t.role} <span className="text-[#52525B]">/</span> {t.context}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Center Column (Featured Tall Card) */}
          <div className="flex flex-col">
            <div className="rounded-[24px] bg-[#161616] border border-[#242424] p-6 sm:p-7 hover:border-[#333333] hover:bg-[#181818] transition-all duration-200 flex flex-col justify-between min-h-[420px] md:min-h-[460px]">
              <p className="text-[#F5F5F5] text-[17px] sm:text-[18.5px] md:text-[19.5px] font-medium leading-[1.5]">
                &ldquo;{featuredTestimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4 mt-8 sm:mt-10">
                <div className="w-[72px] h-[72px] sm:w-[78px] sm:h-[78px] rounded-[16px] bg-[#202022] border border-[#2D2D30] flex items-center justify-center shrink-0">
                  <span className="text-[#F5F5F5] font-semibold text-[20px] sm:text-[22px] tracking-tight">
                    {featuredTestimonial.initials}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[#F5F5F5] font-medium text-[15px] sm:text-[16px] tracking-tight truncate">
                    {featuredTestimonial.name}
                  </h3>
                  <p className="text-[#A1A1AA] text-[12.5px] sm:text-[13px] truncate mt-0.5">
                    {featuredTestimonial.role} <span className="text-[#52525B]">/</span> {featuredTestimonial.context}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (2 cards) */}
          <div className="flex flex-col gap-4">
            {rightTestimonials.map((t, idx) => (
              <div
                key={idx}
                className="rounded-[24px] bg-[#161616] border border-[#242424] p-5 sm:p-6 hover:border-[#333333] hover:bg-[#181818] transition-all duration-200 flex flex-col justify-between"
              >
                <p className="text-[#E5E5E5] text-[14px] sm:text-[14.5px] leading-[1.6] font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3.5 mt-6">
                  <div className="w-[44px] h-[44px] rounded-[12px] bg-[#202022] border border-[#2D2D30] flex items-center justify-center shrink-0">
                    <span className="text-[#F5F5F5] font-semibold text-[13.5px] tracking-tight">
                      {t.initials}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[#F5F5F5] font-medium text-[14px] sm:text-[14.5px] tracking-tight truncate">
                      {t.name}
                    </h3>
                    <p className="text-[#A1A1AA] text-[12px] sm:text-[12.5px] truncate mt-0.5">
                      {t.role} <span className="text-[#52525B]">/</span> {t.context}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Compact Metrics Row Beneath Testimonials ─── */}
        <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-[#242424]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center text-center px-4 ${
                  idx > 0 ? "md:border-l md:border-[#242424]" : ""
                }`}
              >
                <div className="text-[25px] sm:text-[28px] md:text-[30px] font-semibold text-[#F5F5F5] tracking-tight">
                  {m.value}
                </div>
                <div className="text-[12px] sm:text-[13px] text-[#A1A1AA] mt-1 font-normal">
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
