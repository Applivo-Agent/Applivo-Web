"use client";

import { SettingSection, SettingCard } from "@/components/settings/card";
import { useSettings } from "@/lib/settings-context";
import { Rocket, Scale, Gem, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const strategies = [
  {
    id: "aggressive" as const,
    label: "Aggressive",
    description: "Apply to more jobs with a lower match threshold. Faster automation, higher volume.",
    details: [
      "Lower match threshold (50%)",
      "Applies to 2x more jobs",
      "Faster queue processing",
      "Higher daily application cap",
    ],
    icon: Rocket,
    color: "text-zinc-300",
    border: "border-[var(--app-border-strong)]",
    bg: "bg-white/[0.06]",
    ring: "ring-white/20",
  },
  {
    id: "balanced" as const,
    label: "Balanced",
    description: "The recommended mode. A healthy mix of quantity and quality for most users.",
    details: [
      "Standard match threshold (75%)",
      "Moderate application volume",
      "Smart queue prioritization",
      "Best for most users",
    ],
    icon: Scale,
    color: "text-zinc-300",
    border: "border-[var(--app-border-strong)]",
    bg: "bg-white/[0.06]",
    ring: "ring-white/20",
  },
  {
    id: "quality" as const,
    label: "Quality",
    description: "Apply only to the strongest matches. Higher standards, better targeting.",
    details: [
      "High match threshold (90%)",
      "Fewer but stronger applications",
      "Detailed cover letters",
      "Best for senior roles",
    ],
    icon: Gem,
    color: "text-zinc-400",
    border: "border-[var(--app-border-strong)]/20",
    bg: "bg-zinc-700/5",
    ring: "ring-zinc-700/20",
  },
];

export function AgentStrategySection() {
  const { settings, saveSection } = useSettings();

  return (
    <SettingSection>
      <SettingCard
        title="Agent Strategy"
        description="Define how your AI agent approaches the job market"
        icon={<Scale className="w-4 h-4 text-white" />}
      >
        <div className="grid gap-4">
          {strategies.map((s, i) => {
            const Icon = s.icon;
            const isActive = settings.strategyMode === s.id;

            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => saveSection("strategy", { agent_strategy: s.id })}
                className={cn(
                  "relative text-left p-4 rounded-lg border transition-colors",
                  isActive
                    ? "bg-[var(--app-card)] border-white/20 ring-1 ring-white/10"
                    : "bg-[var(--app-nested)] border-[var(--app-border-strong)] hover:border-zinc-500"
                )}
              >
                {isActive && (
                  <div className="absolute top-4 right-4 text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--app-card)] border border-[var(--app-border-strong)] text-white">
                    Active
                  </div>
                )}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[var(--app-card)] border border-[var(--app-border-strong)] text-zinc-300">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-semibold text-white mb-0.5">{s.label}</h4>
                    <p className="text-[12px] text-zinc-400 leading-relaxed mb-2.5">{s.description}</p>
                    <ul className="space-y-1">
                      {s.details.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-[12px] text-zinc-400">
                          <ChevronRight className="w-3 h-3 shrink-0 text-zinc-500" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </SettingCard>
    </SettingSection>
  );
}
