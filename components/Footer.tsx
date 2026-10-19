"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  showCta?: boolean;
  className?: string;
}

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Integrations", href: "/integrations" },
      { label: "Workflow", href: "/#workflow" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "FAQ", href: "/docs/faq" },
      { label: "Getting Started", href: "/docs/quick-start" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/docs/privacy-policy" },
      { label: "Terms of Use", href: "/docs/terms-of-use" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "X", href: "https://x.com/applivo_in", external: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/applivo-agent/", external: true },
      { label: "Instagram", href: "https://www.instagram.com/applivo.in/", external: true },
    ],
  },
];

export function Footer({ showCta = false, className = "" }: FooterProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("applivo_token")));
  }, []);

  return (
    <div className={`w-full bg-[#0a0a0a] text-white ${className}`}>
      {/* ── FINAL CTA SECTION (KILO-INSPIRED) ──────────────── */}
      {showCta && (
        <section className="relative w-full py-20 md:py-28 px-5 md:px-8 overflow-hidden bg-[#0a0a0a] border-t border-white/[0.04]">
          {/* Subtle ambient lighting consistent with landing page */}
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_65%)] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-white leading-[1.12]">
              Make your next<br className="hidden sm:inline" /> career move.
            </h2>
            <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Find relevant opportunities, prepare stronger applications, and manage your job search with Applivo.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all duration-200 shadow-[0_4px_24px_rgba(255,255,255,0.18)] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
              >
                Get started
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FOUR-COLUMN FOOTER & WATERMARK ──────────────────── */}
      <footer className="relative border-t border-white/[0.06] pt-14 md:pt-18 pb-8 px-5 md:px-8 overflow-hidden">
        <div className="max-w-[1200px] mx-auto w-full">
          {/* Four Navigation Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pb-12 md:pb-16">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 mb-3.5 sm:mb-4">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-zinc-400 hover:text-white transition-colors inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 rounded"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[13px] text-zinc-400 hover:text-white transition-colors inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 rounded"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Oversized Applivo Brand Watermark */}
          <div
            className="relative py-6 sm:py-10 md:py-14 flex items-center justify-center overflow-hidden pointer-events-none select-none"
            aria-hidden="true"
          >
            <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 opacity-25 transition-opacity">
              {/* Emblem Box */}
              <div className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px] md:w-[110px] md:h-[110px] bg-gradient-to-br from-[#2a2a2a] to-[#141414] rounded-2xl md:rounded-3xl flex items-center justify-center border border-white/[0.08] shadow-[inset_0_2px_10px_rgba(255,255,255,0.03)]">
                <Image
                  src="/logo.png"
                  alt="Applivo Logo"
                  width={70}
                  height={70}
                  className="w-7 h-7 sm:w-11 sm:h-11 md:w-16 md:h-16 object-contain grayscale opacity-60"
                />
              </div>

              {/* Massive Wordmark with subtle fade */}
              <span className="text-[60px] sm:text-[96px] md:text-[130px] lg:text-[160px] font-extrabold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/30 via-white/10 to-transparent">
                Applivo
              </span>
            </div>
          </div>

          {/* Clean Bottom Bar */}
          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Applivo"
                width={18}
                height={18}
                className="rounded object-contain opacity-80"
              />
              <span className="font-semibold text-zinc-300 tracking-tight">Applivo</span>
              <span className="text-zinc-700 hidden sm:inline">·</span>
              <span className="text-zinc-500">© 2026 Applivo. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-5 text-xs text-zinc-400">
              <Link href="/docs/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/docs/terms-of-use" className="hover:text-white transition-colors">
                Terms of Use
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
