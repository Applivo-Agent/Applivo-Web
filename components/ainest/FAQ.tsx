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
    question: "What is Applivo?",
    answer:
      "Applivo helps job seekers discover opportunities, organize applications, analyze job descriptions, and streamline repetitive parts of the job search.",
  },
  {
    question: "How does Applivo's automated application feature work?",
    answer:
      "Applivo assists with supported application workflows using your verified resume and profile information. Through the lightweight browser extension, it autofills candidate answers directly within your active browser session without storing or sharing your portal passwords.",
  },
  {
    question: "Which job platforms does Applivo support?",
    answer:
      "Currently, Applivo supports automated application workflows on Internshala, and provides smart job description analysis and Kanban application tracking for listings from LinkedIn and major career boards.",
  },
  {
    question: "Do I need to install the browser extension?",
    answer:
      "The web app handles resume parsing, job analysis, profile customization, and Kanban tracking. The browser extension is only needed when you want automated form autofill and submission on supported job portals within your own browser session.",
  },
  {
    question: "How does AI-powered job analysis work?",
    answer:
      "Applivo compares job descriptions against your uploaded resume and profile context. It highlights key skill matches, calculates compatibility scores, and suggests tailored responses for application questions to help you apply with higher precision.",
  },
  {
    question: "What are the subscription plans and usage limits?",
    answer:
      "Applivo offers three tiers: Starter (₹199/month with a 7-day free trial) includes 50 daily automated applications and 120k analysis tokens/month; Pro (₹399/month) provides 100 daily applications, 600k tokens, priority queues, and AI cover letters; and Premium (₹599/month) provides 150 daily applications, 1.2M tokens, and salary benchmark insights.",
  },
  {
    question: "Can I track my job applications?",
    answer:
      "Yes. Every submitted application is automatically logged on your interactive Kanban board. You can monitor live stages across Applied, In Review, Interviewing, Offered, and Archived, add interview notes, and export your history to CSV.",
  },
  {
    question: "How does Applivo protect my data?",
    answer:
      "Your account is secured with JWT authentication and encrypted data storage. Profile information is used strictly to answer job applications with your explicit consent, and the browser extension runs locally without recording sensitive portal credentials.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes. You can cancel your subscription at any time directly from your dashboard settings. You will retain full access to your plan's quotas until the end of your current billing period with zero cancellation fees.",
  },
  {
    question: "What should I do if an application requires manual input?",
    answer:
      "If a job portal prompts for a custom assessment, portfolio upload, or CAPTCHA verification, Applivo pauses and notifies you so you can review and complete the final step safely before submission.",
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
          <span className="text-[var(--sx-tx-a1a1a1)] block">Have Questions?</span>
          <span className="text-white font-semibold block">We&apos;ve Got Answers.</span>
        </h2>
        <p className="text-[13px] sm:text-[13.5px] text-[var(--sx-tx-a1a1aa)] leading-[1.6] max-w-md mx-auto">
          Everything you need to know about using Applivo to simplify your job search.
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
