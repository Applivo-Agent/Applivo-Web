"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/** Shared control styling so every select/input in Settings has the same size, border and focus state. */
export const selectCls =
  "h-9 w-full sm:w-[240px] max-w-full px-3 bg-transparent border border-[var(--app-border-strong)] rounded-lg text-[13px] text-white focus:outline-none focus:border-zinc-400 transition-colors cursor-pointer";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  /** Kept for call-site compatibility; the reference layout uses no row icons. */
  icon?: ReactNode;
  action?: ReactNode;
}

/** One settings section: title and explanation on the left, controls on the right, divider below. */
export function SettingCard({ children, className, title, description, action }: CardProps) {
  return (
    <section className={cn("grid gap-x-10 gap-y-3 py-6 border-b border-[var(--app-border-strong)] last:border-b-0 lg:grid-cols-[minmax(220px,1fr)_minmax(0,2fr)]", className)}>
      <div className="min-w-0">
        {title && <h2 className="text-[14px] font-medium text-white">{title}</h2>}
        {description && <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">{description}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

interface RowProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingRow({ label, description, children, className }: RowProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-6 py-3.5 border-b border-[var(--app-border)] first:pt-0 last:border-0 last:pb-0", className)}>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-white">{label}</p>
        {description && <p className="text-[13px] text-zinc-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0 sm:ml-auto">{children}</div>
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export function SettingSection({ children, className }: SectionProps) {
  return <div className={cn("", className)}>{children}</div>;
}

/** Small note for preferences that are stored only in this browser. */
export function DeviceOnly() {
  return <span className="ml-2 text-[11px] font-normal text-zinc-600">This device only</span>;
}
