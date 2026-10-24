export type PlanTier = "starter" | "pro" | "premium";

export interface PricingPlan {
  id: PlanTier;
  name: string;
  description: string;
  monthlyPrice: number; // in INR
  billingPeriod: string;
  hasTrial: boolean;
  trialDays: number;
  trialNote?: string;
  billingNote: string;
  isPopular: boolean;
  badge?: string;
  features: string[];
  notIncluded?: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For students starting out: Internshala applying and a tracker",
    monthlyPrice: 199,
    billingPeriod: "/month",
    hasTrial: true,
    trialDays: 7,
    trialNote: "7-day free trial included",
    billingNote: "Free for 7 days · then ₹199/month",
    isPopular: false,
    features: [
      "50 daily automated applications",
      "Analyze budget: 25k/run · 120k/mo",
      "AI Chat assistant (50 msgs/month)",
      "Internshala scraping & apply bot",
      "Kanban tracker & CSV data export",
    ],
    notIncluded: [
      "Priority queue processing",
      "AI cover letter & interview prep",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For a bigger search: higher limit, cover letters, interview prep, follow-ups",
    monthlyPrice: 399,
    billingPeriod: "/month",
    hasTrial: false,
    trialDays: 0,
    billingNote: "Billed monthly · Cancel anytime",
    isPopular: true,
    badge: "Most Popular",
    features: [
      "100 daily automated applications",
      "Analyze budget: 60k/run · 600k/mo",
      "AI Chat assistant (100 msgs/month)",
      "Priority queue processing",
      "AI cover letter generator",
      "Interview prep & round tracking",
      "Email monitoring & follow-ups",
    ],
    notIncluded: [],
  },
  {
    id: "premium",
    name: "Premium",
    description: "For high-volume searching: the highest daily limit and queue priority",
    monthlyPrice: 599,
    billingPeriod: "/month",
    hasTrial: false,
    trialDays: 0,
    billingNote: "Billed monthly · Cancel anytime",
    isPopular: false,
    badge: "Best Value",
    features: [
      "150 daily automated applications",
      "Analyze budget: 120k/run · 1.2M/mo",
      "AI Chat assistant (150 msgs/month)",
      "Highest priority processing queue",
      "Advanced market & salary benchmarks",
      "Resume performance ranking",
      "Dedicated priority support channel",
    ],
    notIncluded: [],
  },
];

export type ComparisonCellValue = boolean | string;

export interface ComparisonRow {
  label: string;
  description?: string;
  starter: ComparisonCellValue;
  pro: ComparisonCellValue;
  premium: ComparisonCellValue;
}

export interface ComparisonSection {
  section: string;
  rows: ComparisonRow[];
}

export const COMPARISON_SECTIONS: ComparisonSection[] = [
  {
    section: "Applications & Automation",
    rows: [
      { label: "Daily application quota", starter: "50 / day", pro: "100 / day", premium: "150 / day" },
      { label: "Internshala job scraping & sync", starter: true, pro: true, premium: true },
      { label: "Automated application bot", starter: true, pro: true, premium: true },
      { label: "Application tracker (Kanban & Table)", starter: true, pro: true, premium: true },
      { label: "CSV export for applications", starter: true, pro: true, premium: true },
      { label: "Priority queue processing", starter: false, pro: true, premium: true },
      { label: "Highest priority queue (top of runner)", starter: false, pro: false, premium: true },
    ],
  },
  {
    section: "AI & Token Analysis Budgets",
    rows: [
      { label: "AI analyze budget / run", starter: "25k tokens", pro: "60k tokens", premium: "120k tokens" },
      { label: "AI analyze budget / month", starter: "120k tokens", pro: "600k tokens", premium: "1.2M tokens" },
      { label: "JD match scoring", starter: true, pro: true, premium: true },
      { label: "Deep requirement analysis", starter: false, pro: true, premium: true },
      { label: "Skill gap analysis", starter: false, pro: true, premium: true },
      { label: "Market insights & salary benchmarks", starter: false, pro: false, premium: true },
    ],
  },
  {
    section: "Resume & Career Intelligence",
    rows: [
      { label: "Resume upload & parsing", starter: true, pro: true, premium: true },
      { label: "AI cover letter generator", starter: false, pro: true, premium: true },
      { label: "Interview tracking & round prep", starter: false, pro: true, premium: true },
      { label: "Resume performance ranking", starter: false, pro: false, premium: true },
      { label: "Interview conversion funnel", starter: false, pro: false, premium: true },
    ],
  },
  {
    section: "Notifications & Workflows",
    rows: [
      { label: "Email notifications", starter: true, pro: true, premium: true },
      { label: "Telegram notification alerts", starter: false, pro: true, premium: true },
      { label: "Email inbox monitoring (IMAP)", starter: false, pro: true, premium: true },
      { label: "7-day follow-up automation", starter: false, pro: true, premium: true },
    ],
  },
  {
    section: "AI Chat & Support",
    rows: [
      { label: "AI Chat assistant messages", starter: "50 / mo", pro: "100 / mo", premium: "150 / mo" },
      { label: "Lumi AI copilot access", starter: true, pro: true, premium: true },
      { label: "Knowledge base & documentation", starter: true, pro: true, premium: true },
      { label: "Support tier", starter: "Standard", pro: "Priority", premium: "Priority Dedicated" },
    ],
  },
];

export interface PricingFaq {
  question: string;
  answer: string;
}

export const PRICING_FAQS: PricingFaq[] = [
  {
    question: "How does the 7-day free trial work?",
    answer:
      "The Starter plan includes a full 7-day free trial with automatic extension capabilities and 50 daily applications. You save your payment card via Razorpay, but you will not be charged until day 7. You can cancel at any time from your dashboard without being billed.",
  },
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer:
      "Yes. You can switch between Starter, Pro, and Premium directly from your dashboard under Settings → Subscription. Upgrades take effect immediately so your daily application quotas and AI analysis budgets increase right away.",
  },
  {
    question: "What is the difference between daily application limits and AI token budgets?",
    answer:
      "Daily application limits govern how many jobs the automated bot can apply to per day (50 for Starter, 100 for Pro, 150 for Premium). AI token budgets allocate monthly LLM capacity for automated JD analysis, resume scoring, and cover letter generation (120k tokens/mo for Starter, 600k for Pro, 1.2M for Premium).",
  },
  {
    question: "What payment methods are supported?",
    answer:
      "Applivo processes payments securely through Razorpay. We support UPI (Google Pay, PhonePe, Paytm), all major credit and debit cards (Visa, Mastercard, RuPay), and Net Banking across all major Indian banks.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel your subscription at any time with a single click in your dashboard under Settings → Subscription. There are no cancellation fees or lock-ins. You will continue to have access until the end of your billing cycle.",
  },
];
