import { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { IntegrationsHub } from "@/components/ainest/IntegrationsHub";
import Link from "next/link";
import Image from "next/image";

import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Integrations and job sources",
  description: "Internshala has automated applying today; other job boards are assisted. See each integration's status, from calendars and notes to Slack, Telegram and webhooks.",
};

export default function IntegrationsPage() {
  return (
    <div className="public-flat min-h-screen bg-[var(--sx-bg-0a0a0a)] text-white flex flex-col justify-between selection:bg-white/20">
      <NavBar />
      <main className="flex-1 pt-20 pb-16">
        <IntegrationsHub />
      </main>
      <Footer showCta />
    </div>
  );
}
