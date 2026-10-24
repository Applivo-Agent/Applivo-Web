import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Starter ₹199, Pro ₹399 and Premium ₹599 per month. Starter includes a 7-day free trial. Compare daily application limits, analysis budgets, cover letters, interview prep and follow-ups.",
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
