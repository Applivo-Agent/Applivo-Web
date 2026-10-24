import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact and support",
  description: "Ask about your account, billing, integrations or an application that needs attention. Tell us the page you were on and what you expected to happen.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
