import { Briefcase, TrendingUp, Send, FileText, Star, CheckCircle2, LayoutDashboard, FileUser, BarChart3, MessageSquare, Search } from "lucide-react";

/**
 * A static, illustrative miniature of the Applivo dashboard for the landing hero. It is plain markup: no data fetching,
 * no handlers, no authenticated state. Every figure is made-up sample data and the preview says so. It uses the same
 * surface tokens as the real app (--app-sidebar / --app-card / --app-border), so it stays in step with the product.
 */
const KPIS = [
  { label: "Total jobs", value: "403", sub: "sample data", Icon: Briefcase },
  { label: "High match", value: "27", sub: "≥75% match", Icon: TrendingUp },
  { label: "Applied", value: "18", sub: "this month", Icon: Send },
  { label: "Pending approval", value: "4", sub: "awaiting review", Icon: FileText },
  { label: "Interviews", value: "3", sub: "scheduled", Icon: Star },
  { label: "Offers", value: "1", sub: "received", Icon: CheckCircle2 },
];
const NAV = [
  { label: "Dashboard", Icon: LayoutDashboard, active: true },
  { label: "Jobs", Icon: Briefcase },
  { label: "Applications", Icon: Send },
  { label: "Resumes", Icon: FileUser },
  { label: "Analytics", Icon: BarChart3 },
  { label: "Messages", Icon: MessageSquare },
];
const STAGES = [
  { name: "Scrape", state: "Done", pct: 100 },
  { name: "Analyze", state: "Done", pct: 100 },
  { name: "Queue", state: "Running", pct: 60 },
  { name: "Deploy", state: "Waiting", pct: 0 },
];

const MATCHES = [
  { role: "Machine Learning Engineer", co: "Northwind Labs", score: 92 },
  { role: "Backend Engineer", co: "Helio Systems", score: 88 },
  { role: "AI Product Engineer", co: "Brightpath", score: 84 },
];

const surface = "bg-[var(--app-card)] border border-[var(--app-border)]";

export function MiniDashboardPreview() {
  return (
    <div
      className="flex w-full text-left select-none pointer-events-none bg-[var(--app-bg)] text-[#ededef]"
      role="img"
      aria-label="Illustration of the Applivo dashboard with sample data"
    >
      {/* Sidebar: icons only on small screens */}
      <aside className="shrink-0 w-11 sm:w-[168px] bg-[var(--app-sidebar)] border-r border-[var(--app-border)] p-2 sm:p-3 flex flex-col gap-1">
        <div className="hidden sm:flex items-center gap-2 px-1.5 pb-3 text-[13px] font-medium">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={20} height={20} className="h-5 w-5 object-contain" />Applivo
        </div>
        <div className="hidden sm:flex items-center gap-2 h-7 rounded-md border border-[var(--app-border)] px-2 text-[11px] text-zinc-500 mb-2">
          <Search className="h-3 w-3" />Search
        </div>
        {NAV.map(({ label, Icon, active }) => (
          <div key={label} className={`flex items-center justify-center sm:justify-start gap-2 h-7 rounded-md px-1.5 text-[12px] ${active ? "bg-white/[0.08] text-white" : "text-zinc-400"}`}>
            <Icon className="h-3.5 w-3.5 shrink-0" /><span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </aside>

      <div className="min-w-0 flex-1">
        {/* Top bar */}
        <div className="flex h-10 items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-header)] px-3 sm:px-4">
          <span className="text-[12px] text-zinc-300">System Overview</span>
          <span className="rounded-md border border-[var(--app-border)] px-2 py-0.5 text-[10.5px] text-zinc-500">Sample data</span>
        </div>

        <div className="space-y-2.5 p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {KPIS.map(({ label, value, sub, Icon }, i) => (
              <div key={label} className={`${surface} rounded-xl p-2.5 ${i > 3 ? "hidden sm:block" : ""}`}>
                <Icon className="h-3.5 w-3.5 text-zinc-500" />
                <div className="mt-2 text-[11px] text-zinc-400">{label}</div>
                <div className="text-[20px] font-medium leading-tight tabular-nums text-white">{value}</div>
                <div className="text-[10.5px] text-zinc-500">{sub}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1.4fr]">
            <div className={`${surface} hidden sm:flex rounded-xl p-3 flex-col`}>
              <div className="text-[11px] text-zinc-400">Daily quota</div>
              <div className="mt-2 text-[22px] font-medium tabular-nums">12 <span className="text-[12px] text-zinc-500">/ 100</span></div>
              <div className="mt-2 h-1 rounded-full bg-white/10"><div className="h-1 w-[12%] rounded-full bg-white/70" /></div>
              <div className="mt-1.5 text-[10.5px] text-zinc-500">applications today</div>
            </div>
            <div className={`${surface} hidden sm:flex rounded-xl p-3 flex-col`}>
              <div className="text-[11px] text-zinc-400">AI usage</div>
              <div className="mt-2 text-[22px] font-medium tabular-nums">38k <span className="text-[12px] text-zinc-500">tokens</span></div>
              <div className="mt-2 h-1 rounded-full bg-white/10"><div className="h-1 w-[32%] rounded-full bg-white/70" /></div>
              <div className="mt-1.5 text-[10.5px] text-zinc-500">this month</div>
            </div>
            <div className={`${surface} rounded-xl p-3`}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-white">Application run status</span>
                <span className="rounded border border-[var(--app-border)] px-1.5 text-[10.5px] text-zinc-400">Running</span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                {STAGES.map((s) => (
                  <div key={s.name} className="rounded-md border border-[var(--app-border)] px-2 py-1.5">
                    <div className="flex items-center justify-between text-[11px]"><span className="text-zinc-300">{s.name}</span><span className="text-zinc-500">{s.state}</span></div>
                    <div className="mt-1.5 h-0.5 rounded-full bg-white/10"><div className="h-0.5 rounded-full bg-white/60" style={{ width: `${s.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${surface} rounded-xl p-3`}>
            <div className="mb-1.5 text-[12px] text-white">Top job matches</div>
            {MATCHES.map((m) => (
              <div key={m.role} className="flex items-center justify-between border-t border-[var(--app-border)] py-2 text-[12px]">
                <span className="min-w-0 truncate"><span className="text-zinc-200">{m.role}</span><span className="text-zinc-500"> · {m.co}</span></span>
                <span className="shrink-0 tabular-nums text-zinc-300">{m.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
