"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Who is Applivo for, and what do I need to start?",
    answer:
      "Applivo is built for students and freshers applying for internships and entry-level jobs on Internshala, and works as a tracker and application assistant for other job searches. You need an account, a PDF resume and, for automated applying, an Internshala account, Google Chrome and the Applivo Companion extension.",
  },
  {
    question: "Which job platforms does it support?",
    answer:
      "Automated applying works on Internshala only. For LinkedIn and Indeed, Applivo helps with job analysis, draft answers and tracking, and you submit the application yourself. Other sources listed in the integrations section are assisted or still being set up; each card shows its status.",
  },
  {
    question: "Does it apply without asking me?",
    answer:
      "Only if you allow it. You start each run from the Applivo website and choose whether it may submit automatically; otherwise it fills the form and leaves it ready for your review. It works in an inactive tab of your own Chrome window. If a portal asks for a CAPTCHA, an assessment or a form Applivo cannot read, that application stops and is flagged for you.",
  },
  {
    question: "How are the answers to screening questions written?",
    answer:
      "Answers are drafted from the facts in your profile and resume only. If you do not have a required skill or experience, the draft says so instead of inventing it. Numbers, choices and character limits are checked before anything is filled in.",
  },
  {
    question: "What happens to my resume and personal details?",
    answer:
      "Your resume is parsed into a profile that is used to score listings and draft answers for your applications. The extension runs in your browser and pairs with your account through a one-time code; you can disconnect it at any time. Read the Privacy Policy for how data is stored and handled.",
  },
  {
    question: "What do the plans limit, and what happens at the limit?",
    answer:
      "Each plan sets a daily application limit (Starter 50, Pro 100, Premium 150), a monthly analysis budget and a monthly chat-message allowance. When you reach the daily limit, no more applications go out that day and the count resets the next day. Cover letters, interview prep and follow-ups are on Pro and Premium.",
  },
  {
    question: "How does the free trial and cancellation work?",
    answer:
      "Starter includes a 7-day free trial, then ₹199 per month. You can cancel from the Subscription page and keep access until the end of the period you have paid for. Check the Terms of Use or contact us before paying if you need refund details.",
  },
  {
    question: "Can Applivo guarantee interviews or offers?",
    answer:
      "No. Applivo reduces the repetitive work of applying and shows how well you match a listing. Whether you are shortlisted depends on the employer.",
  },
  {
    question: "What if something goes wrong or I need help?",
    answer:
      "Open the Docs for step-by-step guides and troubleshooting, or send a message from the Contact page with the page you were on and what you expected to happen.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section
      id="faq"
      className="relative z-10 w-full py-14 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-[var(--sx-bg-090909)] overflow-hidden border-t border-white/[0.04]"
      aria-label="Frequently Asked Questions"
    >
      {/* ─── Centered Header ─── */}
      <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
        <span className="text-[10px] sm:text-[11px] font-medium text-[var(--sx-tx-71717a)] uppercase tracking-[0.15em] block mb-2.5">
          FAQ
        </span>
        <h2 className="text-[26px] sm:text-[30px] md:text-[32px] font-semibold tracking-tight mb-2.5 leading-[1.2]">
          <span className="text-[var(--sx-tx-a1a1a1)] block">Before you sign up,</span>
          <span className="text-white font-semibold block">what to know.</span>
        </h2>
        <p className="text-[13px] sm:text-[13.5px] text-[var(--sx-tx-a1a1aa)] leading-[1.6] max-w-md mx-auto">
          What it works with, what it needs, and what stays in your control.
        </p>
      </div>

      {/* ─── Vertically Stacked Accordion (Moderately Wide, Max Width 800px) ─── */}
      <div className="w-full max-w-[800px] mx-auto flex flex-col gap-[11px]">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          const questionId = `faq-q-${idx}`;
          const answerId = `faq-a-${idx}`;

          return (
            <div
              key={idx}
              className="rounded-[11px] border border-[var(--sx-bd-262626)] bg-[var(--sx-bg-141414)] hover:border-[var(--sx-bd-333333)] transition-colors duration-150 overflow-hidden"
            >
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggle(idx)}
                className="w-full min-h-[56px] flex items-center justify-between text-left px-[18px] py-[16px] gap-4 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
              >
                <span className="text-[14.5px] font-medium text-[var(--sx-tx-f5f5f5)] leading-[1.5]">
                  {item.question}
                </span>
                <span className="shrink-0 flex items-center justify-center text-[var(--sx-tx-71717a)] ml-2">
                  {isOpen ? (
                    <Minus className="w-4 h-4 text-[var(--sx-tx-a1a1aa)]" aria-hidden="true" />
                  ) : (
                    <Plus className="w-4 h-4 text-[var(--sx-tx-71717a)]" aria-hidden="true" />
                  )}
                </span>
              </button>

              <div
                id={answerId}
                role="region"
                aria-labelledby={questionId}
                className={cn(
                  "grid transition-all duration-200 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-[18px] pb-[18px] pt-1 text-[13px] sm:text-[13.5px] text-[var(--sx-tx-a1a1aa)] leading-[1.6] font-normal">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
