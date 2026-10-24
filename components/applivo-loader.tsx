"use client";

import React from "react";
import Image from "next/image";
import { RotateCcw, AlertCircle } from "lucide-react";

export interface ApplivoLoaderProps {
  /**
   * Layout variant:
   * - "content": Centered within the dashboard content area (between sidebar/header).
   * - "fullscreen": Fixed full-screen viewport for initial app boot or auth checking.
   * - "compact": Compact inline loading for smaller cards or nested sections.
   */
  variant?: "content" | "fullscreen" | "compact";
  /**
   * Pixel size of the center logo mark (default: 40 for content/fullscreen, 28 for compact).
   */
  size?: number;
  /**
   * Refined caption displayed below the mark. Defaults to "Loading Applivo".
   * Pass null to omit text entirely.
   */
  text?: string | null;
  /**
   * Whether to display the subtle animated three-dot indicator. Defaults to true.
   */
  showDots?: boolean;
  /**
   * Optional custom CSS class name for the wrapper.
   */
  className?: string;
  /**
   * If an error occurs, displays the calm brand mark with the error message and retry action.
   */
  error?: string | null;
  /**
   * Callback invoked when the user clicks the retry button.
   */
  onRetry?: () => void;
}

export function ApplivoLoader({
  variant = "content",
  size,
  text = "Loading Applivo",
  showDots = true,
  className = "",
  error,
  onRetry,
}: ApplivoLoaderProps) {
  const isCompact = variant === "compact";
  const logoSize = size ?? (isCompact ? 28 : 40);
  const ringSize = isCompact ? 60 : 86;

  // Root wrapper layout based on variant
  const containerClasses =
    variant === "fullscreen"
      ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--sx-bg-09090b)] text-white px-4 overflow-hidden select-none"
      : variant === "compact"
      ? "w-full flex flex-col items-center justify-center py-8 text-white px-3 select-none"
      : "w-full flex-1 flex flex-col items-center justify-center py-20 sm:py-28 min-h-[380px] text-white px-4 select-none";

  // Error state display
  if (error) {
    return (
      <div
        className={`${containerClasses} ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="relative flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Applivo"
            width={logoSize}
            height={logoSize}
            priority
            className="object-contain select-none opacity-60 grayscale"
          />
        </div>

        <div className="mt-5 flex flex-col items-center text-center max-w-sm">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[13px] font-medium">
            <AlertCircle className="w-4 h-4 text-zinc-400" />
            <span>{error}</span>
          </div>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${containerClasses} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text || "Loading"}
    >
      {/* Central Visual Mark: Real Applivo logo directly against background */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: ringSize, height: ringSize }}
      >
        {/* Soft white/grey ambient glow behind the logo */}
        <div
          className="absolute inset-0 m-auto rounded-full pointer-events-none applivo-loader-glow"
          style={{
            width: ringSize * 1.35,
            height: ringSize * 1.35,
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 42%, transparent 72%)",
          }}
          aria-hidden="true"
        />

        {/* Thin, low-contrast orbital stroke encircling the logo */}
        <svg
          width={ringSize}
          height={ringSize}
          viewBox="0 0 100 100"
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* Subtle static background orbit track */}
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="1.25"
          />

          {/* Continuous primary orbital arc stroke */}
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke="rgba(255, 255, 255, 0.38)"
            strokeWidth="1.25"
            strokeDasharray="42 180"
            strokeLinecap="round"
            className="applivo-loader-orbit"
          />

          {/* Subtle secondary counter-accent arc */}
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1.25"
            strokeDasharray="18 200"
            strokeLinecap="round"
            className="applivo-loader-orbit-counter"
          />
        </svg>

        {/* Real brand logo directly on page background — no card or bordered container */}
        <div className="relative z-10 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Applivo"
            width={logoSize}
            height={logoSize}
            priority
            className="object-contain select-none applivo-loader-logo"
          />
        </div>
      </div>

      {/* Small, refined loading text directly below the logo */}
      {text !== null && (
        <div className="mt-5 flex items-center justify-center gap-1 select-none text-[12px] sm:text-[13px] font-medium tracking-[0.015em] text-zinc-400">
          <span>{text}</span>
          {showDots && (
            <span
              className="inline-flex items-center gap-[3px] ml-0.5"
              aria-hidden="true"
            >
              <span className="applivo-loader-dot w-1 h-1 rounded-full bg-zinc-400 inline-block" />
              <span className="applivo-loader-dot w-1 h-1 rounded-full bg-zinc-400 inline-block" />
              <span className="applivo-loader-dot w-1 h-1 rounded-full bg-zinc-400 inline-block" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ApplivoLoader;
