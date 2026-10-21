import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared monochrome card kit for the signed-in app.
 * Surfaces come from the --app-* tokens (page #111, card #181818, nested #1b1b1d); variety comes from surface level,
 * border, spacing and type only. No accent colours.
 */

/** Subtle grey container that holds an icon. */
export function IconTile({ icon: Icon, size = "md", className }: { icon: LucideIcon; size?: "sm" | "md" | "lg"; className?: string }) {
  const box = size === "lg" ? "h-12 w-12 rounded-xl" : size === "sm" ? "h-7 w-7 rounded-md" : "h-9 w-9 rounded-lg";
  const glyph = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-3.5 w-3.5" : "h-[18px] w-[18px]";
  return (
    <span className={cn("flex shrink-0 items-center justify-center bg-white/[0.06] text-zinc-300", box, className)}>
      <Icon className={glyph} strokeWidth={1.6} aria-hidden />
    </span>
  );
}

export function AppCard({ children, level = "card", className }: { children: React.ReactNode; level?: "card" | "nested" | "flat"; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        level === "card" && "bg-[var(--app-card)] border-[var(--app-border-strong)]",
        level === "nested" && "bg-[var(--app-nested)] border-[var(--app-border-strong)]",
        level === "flat" && "bg-transparent border-[var(--app-border)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Dashboard metric: icon, label, big number, hint. */
export function MetricCard({ icon, label, value, hint, className }: { icon: LucideIcon; label: string; value: React.ReactNode; hint?: string; className?: string }) {
  return (
    <AppCard className={className}>
      <IconTile icon={icon} />
      <p className="mt-4 text-[12px] text-zinc-400">{label}</p>
      <p className="mt-0.5 text-[24px] font-semibold leading-8 tracking-tight text-white">{value}</p>
      {hint && <p className="mt-1 text-[12px] text-zinc-500">{hint}</p>}
    </AppCard>
  );
}

/** Summary statistic with an optional unavailable state (shows a dash and the reason instead of a made-up number). */
export function SummaryStat({ icon, label, value, hint }: { icon: LucideIcon; label: string; value?: React.ReactNode; hint?: string }) {
  return (
    <AppCard className="p-5">
      <IconTile icon={icon} size="lg" />
      <p className={cn("mt-5 text-[24px] leading-8 tracking-tight", value === undefined ? "text-zinc-500" : "text-white")}>{value === undefined ? "—" : value}</p>
      <p className="mt-0.5 text-[13px] text-zinc-300">{label}</p>
      {hint && <p className="mt-1 text-[12px] text-zinc-500">{hint}</p>}
    </AppCard>
  );
}

/** Resource / feature card: centred icon, title, description, optional action slot. */
export function ResourceCard({ icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
  return (
    <AppCard className="flex flex-col items-center px-6 py-8 text-center">
      <IconTile icon={icon} size="lg" />
      <h3 className="mt-5 text-[15px] font-medium text-white">{title}</h3>
      <p className="mt-2 max-w-[34ch] text-[13px] leading-5 text-zinc-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </AppCard>
  );
}

/** Benefit list card ("They get" / "You get"). Items marked `muted` render in grey with a hollow marker. */
export function BenefitCard({ title, items }: { title: string; items: { text: string; muted?: boolean }[] }) {
  return (
    <AppCard className="p-5">
      <h3 className="text-[15px] sm:text-[16px] font-semibold tracking-tight text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it.text} className="flex items-start gap-3">
            <span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full", it.muted ? "border border-[var(--app-border-strong)] text-zinc-600" : "bg-white/10 text-white")}>
              <Check className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
            </span>
            <span className={cn("text-[13px] leading-relaxed", it.muted ? "text-zinc-500" : "text-zinc-300")}>{it.text}</span>
          </li>
        ))}
      </ul>
    </AppCard>
  );
}

/** Large featured panel with headline, copy, actions and a replaceable art slot. */
export function FeatureBanner({ title, description, children, art }: { title: string; description: React.ReactNode; children?: React.ReactNode; art?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)]">
      <div className="grid items-center gap-6 p-5 md:grid-cols-[minmax(0,1fr)_260px] md:p-6">
        <div className="min-w-0">
          <h2 className="text-[20px] sm:text-[22px] font-medium leading-7 tracking-tight text-white">{title}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">{description}</p>
          {children && <div className="mt-4">{children}</div>}
        </div>
        <div className="hidden md:block">{art}</div>
      </div>
    </section>
  );
}

/** Row used for job-match style lists. */
export function MatchRow({ icon, title, meta, badge, action }: { icon: LucideIcon; title: string; meta?: string; badge?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] px-4 py-3">
      <IconTile icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-white">{title}</p>
        {meta && <p className="truncate text-[12px] text-zinc-500">{meta}</p>}
      </div>
      {badge && <span className="shrink-0 rounded-full border border-[var(--app-border-strong)] px-2.5 py-0.5 text-[12px] text-zinc-300">{badge}</span>}
      {action}
    </div>
  );
}
