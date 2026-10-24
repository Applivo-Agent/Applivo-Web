"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        checked ? "bg-zinc-200" : "bg-white/[0.12]",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <span
        className={cn("absolute top-0.5 h-4 w-4 rounded-full transition-all", checked ? "left-[18px] bg-[var(--sx-bg-0b0b0f)]" : "left-0.5 bg-zinc-400")}
      />
    </button>
  );
}
