"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  heading: string;
  supportingText: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({
  heading,
  supportingText,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen w-full max-w-full flex flex-col items-center justify-center bg-[#080808] px-4 py-8 relative overflow-x-hidden overflow-y-auto select-none">
      {/* ── BACKGROUND LAYER SYSTEM: MONOCHROME SOFT PLANETARY HORIZON & GLOW ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0 bg-[#080808]">
        {/* Layer 1: Restrained ambient grayscale glow centered behind auth card */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "880px",
            maxWidth: "96vw",
            height: "500px",
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255, 255, 255, 0.09) 0%, rgba(180, 180, 185, 0.04) 35%, rgba(60, 60, 65, 0.01) 65%, transparent 82%)",
            filter: "blur(50px)",
          }}
        />

        {/* Layer 2: Soft core illumination separating card from background */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "52%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "560px",
            maxWidth: "90vw",
            height: "340px",
            background:
              "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(255, 255, 255, 0.13) 0%, rgba(160, 160, 165, 0.05) 45%, transparent 75%)",
            filter: "blur(35px)",
          }}
        />

        {/* Layer 3: Soft feathered planetary horizon extending beyond both viewport edges */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "53%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "190vw",
            minWidth: "700px",
            maxWidth: "2400px",
            height: "850px",
          }}
        >
          {/* Feathered atmospheric haze along the rim (soft, blurred, no hard line) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
              borderTop: "1.5px solid rgba(255, 255, 255, 0.20)",
              boxShadow:
                "0 -3px 12px rgba(255, 255, 255, 0.10), 0 -8px 24px rgba(255, 255, 255, 0.04)",
              filter: "blur(3.5px)",
              WebkitMaskImage:
                "radial-gradient(ellipse 65% 50% at 50% 0%, black 20%, rgba(0,0,0,0.4) 55%, transparent 85%)",
              maskImage:
                "radial-gradient(ellipse 65% 50% at 50% 0%, black 20%, rgba(0,0,0,0.4) 55%, transparent 85%)",
            }}
          />

          {/* Faint, delicate central horizon highlight (gently illuminated at center, disappearing at sides) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
              borderTop: "1px solid rgba(220, 220, 230, 0.26)",
              boxShadow: "0 -1px 6px rgba(255, 255, 255, 0.14)",
              filter: "blur(1.5px)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 18%, rgba(0,0,0,0.3) 32%, black 44%, black 56%, rgba(0,0,0,0.3) 68%, transparent 82%)",
              maskImage:
                "linear-gradient(to right, transparent 18%, rgba(0,0,0,0.3) 32%, black 44%, black 56%, rgba(0,0,0,0.3) 68%, transparent 82%)",
            }}
          />

          {/* Dark planetary body below the horizon (solid #080808 occlusion) */}
          <div
            className="absolute inset-0 bg-[#080808] pointer-events-none"
            style={{
              borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
              marginTop: "1.5px",
            }}
          />
        </div>
      </div>

      {/* ── CENTERED AUTH PANEL (430px desktop width, 16px radius, #111111 surface, 24–32px padding) ── */}
      <div className="w-full max-w-[380px] relative z-10">
        <div className="rounded-2xl bg-[#111111] border border-[#232326] p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.95)]">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center mb-3 group transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-[#161618] flex items-center justify-center shadow-md p-1.5">
                <Image
                  src="/applivo-logo.png"
                  alt="Applivo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                  unoptimized
                />
              </div>
            </Link>

            <h1 className="text-[20px] font-semibold text-[#f5f5f5] tracking-tight">
              {heading}
            </h1>
            <p className="text-[13px] text-[#a1a1aa] mt-1 leading-normal max-w-[320px]">
              {supportingText}
            </p>
          </div>

          {/* Development Status Notice Banner inside card (Exact site theme) */}
          <div className="flex items-center justify-center gap-2 px-3 py-2 mb-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse shrink-0" />
            <span className="text-[12px] font-medium text-zinc-300 leading-tight">
              Platform in Development &bull; Access opening soon
            </span>
          </div>

          {/* Form Content */}
          <div className="space-y-3">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-center text-[13px] text-[#a1a1aa]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ── SOCIAL AUTH BUTTONS & DIVIDER ── */

export function AppleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

export function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function SocialButtons({
  onGoogleClick,
  onAppleClick,
  googleLoading = false,
  appleLoading = false,
  compact = false,
}: {
  onGoogleClick: () => void;
  onAppleClick: () => void;
  googleLoading?: boolean;
  appleLoading?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={onGoogleClick}
        disabled={googleLoading || appleLoading}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#18181b] hover:bg-[#202024] border border-[#2b2b2b] text-[#f5f5f5] text-[13.5px] font-medium transition-all active:scale-[0.99] disabled:opacity-50"
      >
        <GoogleIcon className="w-4 h-4 shrink-0" />
        <span>Google</span>
      </button>

      <button
        type="button"
        onClick={onAppleClick}
        disabled={appleLoading || googleLoading}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#18181b] hover:bg-[#202024] border border-[#2b2b2b] text-[#f5f5f5] text-[13.5px] font-medium transition-all active:scale-[0.99] disabled:opacity-50"
      >
        <AppleIcon className="w-4 h-4 text-[#f5f5f5] shrink-0" />
        <span>Apple</span>
      </button>
    </div>
  );
}

export function AuthDivider({ text = "OR SIGN IN WITH" }: { text?: string }) {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/[0.08]" />
      </div>
      <div className="relative flex justify-center text-[11px] font-medium tracking-wider">
        <span className="bg-[#111111] px-3 text-[#71717a] uppercase">{text}</span>
      </div>
    </div>
  );
}
