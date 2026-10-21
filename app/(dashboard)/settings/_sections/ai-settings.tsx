"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { SettingSection, SettingCard } from "@/components/settings/card";
import { Toggle } from "@/components/settings/toggle";
import { useSettings } from "@/lib/settings-context";
import { useSubscription } from "@/lib/subscription";
import { settingsV2Api } from "@/lib/api";
import { Brain, Zap, Gauge, Briefcase, Shield, Lock, Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanTier } from "@/lib/subscription";

// ── Types & Data ───────────────────────────────────────────────────────────────

type MinPlan = "starter" | "pro" | "premium";

interface ModelDef {
  key: string;
  label: string;
  provider: "groq" | "gemini" | "openrouter";
  providers?: string[];
  description: string;
  minPlan: MinPlan;
}

const PROVIDERS = [
  { id: "groq" as const,       label: "Groq",       description: "Fast inference, Llama models" },
  { id: "gemini" as const,     label: "Gemini",     description: "Google DeepMind models" },
  { id: "openrouter" as const, label: "OpenRouter", description: "200+ models via one API" },
];

// The model list comes from the server (GET /settings/v2/ai/models): exactly what the router can run, with
// labels that say what actually runs. Nothing is hard-coded here, so retired labels cannot reappear.
interface ApiModel {
  key: string;
  label: string;
  description: string;
  plan: MinPlan;
  providers: string[];
  available: boolean;
}

const PLAN_ORDER: Record<MinPlan, number> = { starter: 0, pro: 1, premium: 2 };

// Provider icon — simple coloured initials badge


function planMeetsRequirement(userPlan: PlanTier, required: MinPlan): boolean {
  if (userPlan === "none") return false;
  return PLAN_ORDER[userPlan as MinPlan] >= PLAN_ORDER[required];
}

// ── Model Dropdown ─────────────────────────────────────────────────────────────

const GROUPS: { key: MinPlan; label: string }[] = [
  { key: "starter",  label: "Free" },
  { key: "pro",      label: "Pro" },
  { key: "premium",  label: "Premium" },
];

function ModelDropdown({
  value,
  models,
  effectivePlan,
  onChange,
}: {
  value: string;
  models: ModelDef[];
  effectivePlan: MinPlan;
  onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = models.filter(
    (m) =>
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase())
  );

  const selected = models.find((m) => m.key === value);

  const choose = useCallback(
    (m: ModelDef) => {
      if (!planMeetsRequirement(effectivePlan, m.minPlan)) return;
      onChange(m.key);
      setOpen(false);
      setSearch("");
    },
    [effectivePlan, onChange]
  );

  // Position portal below trigger
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPortalStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
    setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 30);
  }, [open]);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPortalStyle((s) => ({ ...s, top: rect.bottom + 6, left: rect.left, width: rect.width }));
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  useEffect(() => { setHighlighted(filtered[0]?.key ?? null); }, [search]); // eslint-disable-line

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown"].includes(e.key)) { e.preventDefault(); setOpen(true); }
      return;
    }
    const idx = filtered.findIndex((m) => m.key === highlighted);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = filtered[idx + 1];
      if (next) setHighlighted(next.key);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = filtered[idx - 1];
      if (prev) setHighlighted(prev.key);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const m = filtered.find((m) => m.key === highlighted);
      if (m) choose(m);
    } else if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  // Scroll highlighted into view
  useEffect(() => {
    if (!open || !listRef.current || !highlighted) return;
    const el = listRef.current.querySelector(`[data-key="${highlighted}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  const groupedFiltered = GROUPS.map((g) => ({
    ...g,
    models: filtered.filter((m) => m.minPlan === g.key),
  })).filter((g) => g.models.length > 0);

  const panel = open ? (
    <div
      ref={panelRef}
      style={portalStyle}
      onKeyDown={onKeyDown}
      className="rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-inset)] shadow-2xl shadow-black/80 overflow-hidden"
    >
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--app-border-strong)]">
        <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search models"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
        />
      </div>

      {/* List */}
      <div ref={listRef} className="max-h-72 overflow-y-auto">
        {groupedFiltered.length === 0 ? (
          <p className="px-4 py-4 text-sm text-zinc-500">No models match</p>
        ) : (
          groupedFiltered.map((group) => (
            <div key={group.key}>
              <div className="sticky top-0 px-3 py-1.5 bg-[var(--app-inset)] border-b border-[var(--app-border-strong)]/50">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  {group.label}
                </span>
              </div>

              {group.models.map((m) => {
                const locked = !planMeetsRequirement(effectivePlan, m.minPlan);
                const isSelected = m.key === value;
                const isHigh = m.key === highlighted;

                return (
                  <button
                    key={m.key}
                    type="button"
                    data-key={m.key}
                    disabled={locked}
                    onMouseEnter={() => !locked && setHighlighted(m.key)}
                    onClick={() => choose(m)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                      isHigh && !locked ? "bg-zinc-800/60" : "",
                      locked ? "cursor-not-allowed" : "cursor-pointer"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "text-sm truncate block",
                        locked ? "text-zinc-600" : isSelected ? "text-white font-medium" : "text-zinc-300"
                      )}>
                        {m.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {locked && (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                          <Lock className="w-2.5 h-2.5" />
                          {group.label}
                        </span>
                      )}
                      {isSelected && !locked && <Check className="w-3.5 h-3.5 text-zinc-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <div onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all",
          "bg-[var(--app-card)] border-[var(--app-border-strong)] hover:border-zinc-600 focus:outline-none focus:border-zinc-500",
          open && "border-zinc-600"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-sm font-medium text-white truncate">
            {selected?.label ?? "Select model"}
          </span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {typeof document !== "undefined" && panel
        ? createPortal(panel, document.body)
        : null}
    </div>
  );
}

// ── Option cards (Reasoning / Style / Fallback) ────────────────────────────────

const REASONING_OPTIONS = [
  { id: "fast" as const,     label: "Fast",     description: "Max speed, lower cost. temperature=0.2, 1k tokens." },
  { id: "balanced" as const, label: "Balanced", description: "Speed/quality tradeoff. temperature=0.4, 2.5k tokens." },
  { id: "deep" as const,     label: "Deep",     description: "Maximum reasoning depth. temperature=0.7, 5k tokens." },
];

const STYLE_OPTIONS = [
  { id: "professional" as const, label: "Professional", description: "Polished corporate tone. ATS-friendly." },
  { id: "technical" as const,    label: "Technical",    description: "Engineering-focused with precise terminology." },
  { id: "startup" as const,      label: "Startup",      description: "Energetic, impact-driven, builder mindset." },
  { id: "enterprise" as const,   label: "Enterprise",   description: "Structured, process-oriented, risk-aware." },
];

const FALLBACK_STRATEGY_OPTIONS = [
  { id: "fastest" as const,      label: "Fastest",      description: "Groq → Gemini Flash → DeepSeek. Prioritize speed." },
  { id: "balanced" as const,     label: "Balanced",     description: "Groq 70B → Gemini → DeepSeek. Best all-round." },
  { id: "best_quality" as const, label: "Best Quality", description: "Claude Sonnet → DeepSeek R1 → Gemini Pro. Max quality." },
];

// ── Main ───────────────────────────────────────────────────────────────────────

export function AISettingsSection() {
  const { settings, saveSection } = useSettings();
  const { plan } = useSubscription();
  const effectivePlan = (plan === "none" ? "starter" : plan) as MinPlan;

  const [catalogue, setCatalogue] = useState<ModelDef[]>([]);
  useEffect(() => {
    settingsV2Api
      .getAIModels()
      .then((res) => {
        const list: ApiModel[] = res.data?.models ?? [];
        setCatalogue(
          list
            .filter((m) => m.available)
            .map((m) => ({
              key: m.key,
              label: m.label,
              description: m.description,
              provider: (m.providers[0] ?? "openrouter") as ModelDef["provider"],
              providers: m.providers,
              minPlan: m.plan,
            }))
        );
      })
      .catch(() => setCatalogue([]));
  }, []);

  const filteredModels = catalogue.filter(
    (m) => !settings.aiProvider || m.providers?.includes(settings.aiProvider) || m.key === "auto"
  );
  // A stored value that is no longer offered is shown as the default rather than as a retired name.
  const shownModel = filteredModels.some((m) => m.key === settings.aiModel) ? settings.aiModel : "auto";

  const save = (data: Record<string, unknown>) => saveSection("ai", data);

  return (
    <SettingSection>
      {/* Engine: fixed by server policy */}
      <SettingCard
        title="AI engine"
        description="Applivo runs every request on its own managed key through OpenRouter, with one model. There is nothing to configure and no key to enter."
        icon={<Brain className="w-4 h-4 text-white" />}
      >
        <div className="p-4 rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)]">
          <p className="text-sm font-bold text-white">OpenRouter · {catalogue[0]?.label ?? "GPT-OSS 20B"}</p>
          <p className="text-[11px] text-zinc-500 mt-1">{catalogue[0]?.description ?? "Managed by Applivo. Your data is requested to be routed only to hosts that do not retain prompts."}</p>
        </div>
      </SettingCard>

      {/* Reasoning Depth */}
      <SettingCard
        title="Reasoning Depth"
        description="Controls temperature, max tokens, and reasoning instructions injected into every AI request"
        icon={<Gauge className="w-4 h-4 text-white" />}
      >
        <div className="grid gap-3">
          {REASONING_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => save({ reasoning_depth: opt.id })}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                settings.reasoningDepth === opt.id
                  ? "bg-[var(--app-card)] border-white/30 ring-1 ring-white/10"
                  : "bg-[var(--app-card)] border-[var(--app-border-strong)] hover:border-[var(--app-border-strong)]"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                settings.reasoningDepth === opt.id ? "bg-white" : "bg-[var(--app-card)]"
              )}>
                <Zap className={cn("w-4 h-4", settings.reasoningDepth === opt.id ? "text-black" : "text-[#A1A1AA]")} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{opt.label}</p>
                <p className="text-xs text-[#A1A1AA] mt-0.5">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>
      </SettingCard>

      {/* Application Generation Style */}
      <SettingCard
        title="Application Generation Style"
        description="Injected into every cover letter, resume optimization, follow-up, and AI chat response"
        icon={<Briefcase className="w-4 h-4 text-white" />}
      >
        <div className="grid grid-cols-2 gap-3">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => save({ app_gen_style: opt.id })}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                settings.applicationStyle === opt.id
                  ? "bg-[var(--app-card)] border-white/30 ring-1 ring-white/10"
                  : "bg-[var(--app-card)] border-[var(--app-border-strong)] hover:border-[var(--app-border-strong)]"
              )}
            >
              <p className="text-sm font-bold text-white mb-1">{opt.label}</p>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">{opt.description}</p>
            </button>
          ))}
        </div>
      </SettingCard>

    </SettingSection>
  );
}
