"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function SettingCard({ children, className, title, description, icon, action }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-xl shadow-sm overflow-hidden",
        className
      )}
    >
      {(title || icon) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--app-border-strong)]">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-[var(--app-nested)] border border-[var(--app-border-strong)] flex items-center justify-center text-zinc-300 shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && <h2 className="font-semibold text-white text-[15px] sm:text-[16px] tracking-tight">{title}</h2>}
              {description && <p className="text-[12px] text-zinc-400 mt-0.5">{description}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
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
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 border-b border-[var(--app-border-strong)] last:border-0", className)}>
      <div className="flex-1 min-w-0 pr-0 sm:pr-4">
        <p className="text-[13px] sm:text-[14px] font-medium text-white">{label}</p>
        {description && <p className="text-[12px] text-zinc-400 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export function SettingSection({ children, className }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("space-y-6", className)}
    >
      {children}
    </motion.div>
  );
}
