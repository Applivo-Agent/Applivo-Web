"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertCircle, ArrowRight, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DateRange = 7 | 30 | 90;
/* eslint-disable @typescript-eslint/no-explicit-any */

// Neutral palette. One warm highlight for the primary series; everything else is grey.
const WARM = "var(--cc-d4a15a)";
const GREY_HI = "rgb(var(--tw-zinc-400))";
const GREY_LO = "var(--cc-6b6b73)";
/** Previous-period comparisons need a baseline this large before a percentage means anything. */
const MIN_BASELINE = 5;

const surface = "rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)]";

function change(curr: number, prev: number, days: number): { text: string; muted: boolean } {
  if (prev >= MIN_BASELINE) {
    const pct = Math.round(((curr - prev) / prev) * 100);
    return { text: `${pct > 0 ? "+" : ""}${pct}% vs previous ${days}d`, muted: false };
  }
  if (prev > 0) return { text: `${prev} in previous ${days}d`, muted: true };
  return { text: "No prior baseline", muted: true };
}

function Section({ title, hint, children, className }: { title: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn(surface, "p-4 min-w-0", className)}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-3">
        <h2 className="text-[14px] font-medium text-white">{title}</h2>
        {hint && <div className="text-[12px] text-zinc-500 text-right">{hint}</div>}
      </header>
      {children}
    </section>
  );
}

function Ranked({ rows, empty }: { rows: { name: string; count: number; percentage?: number }[]; empty: string }) {
  if (!rows.length) return <p className="text-[13px] text-zinc-500">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <ol className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={r.name} className="text-[13px]">
          <div className="grid grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-x-2">
            <span className="text-zinc-600 tabular-nums">{i + 1}</span>
            <span className="truncate text-zinc-200" title={r.name}>{r.name}</span>
            <span className="text-zinc-400 tabular-nums">{r.count}{r.percentage !== undefined ? <span className="text-zinc-600"> · {r.percentage}%</span> : null}</span>
          </div>
          <div className="mt-1 ml-6 h-px bg-white/[0.07]">
            <div className="h-px bg-zinc-400/70" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const date = payload[0]?.payload?.date;
  const title = date ? new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : label;
  return (
    <div className="rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] px-3 py-2 text-[12px] shadow-lg">
      <div className="text-white mb-1">{title}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6 text-zinc-300">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3" style={{ background: p.stroke }} />{p.name}</span>
          <span className="tabular-nums text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState<DateRange>(30);
  const [isExporting, setIsExporting] = useState(false);

  const { data: perf, isLoading, isError, refetch } = useQuery({
    queryKey: ["analytics-performance", days],
    queryFn: () => analyticsApi.performance(days).then((r) => r.data),
    staleTime: 60 * 1000,
  });

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await analyticsApi.downloadCsv(days);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `applivo_analytics_${days}d.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${days}-day analytics CSV`);
    } catch {
      toast.error("Failed to export analytics CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const kpi = perf?.kpi ?? { total_applications: 0, total_applications_prev: 0, employer_responses: 0, employer_responses_prev: 0, interviews: 0, interviews_prev: 0, offers: 0, offers_prev: 0 };
  const activity: any[] = useMemo(() => (Array.isArray(perf?.activity) ? perf.activity : []), [perf]);
  const stages: any[] = perf?.funnel?.stages ?? [];
  const breakdowns = perf?.breakdowns;
  const queue = perf?.queue;
  const responseTime = perf?.response_time;
  const totalAccountApps = perf?.total_account_applications ?? 0;
  const followUp = (Array.isArray(perf?.insights) ? perf.insights : []).find((i: any) => i.id === "follow_up");

  const periodTotal = useMemo(
    () => activity.reduce((a, d) => a + (Number(d.applied) || 0) + (Number(d.responses) || 0) + (Number(d.interviews) || 0), 0),
    [activity]
  );
  const appliedTotal = useMemo(() => activity.reduce((a, d) => a + (Number(d.applied) || 0), 0), [activity]);
  const stageMax = Math.max(...stages.map((s) => s.count), 1);
  const queuedTotal = (queue?.queued ?? 0) + (queue?.pending_approval ?? 0);

  const cards = [
    { label: "Applications", value: kpi.total_applications, prev: kpi.total_applications_prev, sub: null as string | null },
    { label: "Employer responses", value: kpi.employer_responses, prev: kpi.employer_responses_prev, sub: kpi.total_applications > 0 ? `${((kpi.employer_responses / kpi.total_applications) * 100).toFixed(1)}% of applications` : null },
    { label: "Interviews", value: kpi.interviews, prev: kpi.interviews_prev, sub: kpi.employer_responses > 0 ? `${((kpi.interviews / kpi.employer_responses) * 100).toFixed(1)}% of responses` : null },
    { label: "Offers", value: kpi.offers, prev: kpi.offers_prev, sub: kpi.interviews > 0 ? `${((kpi.offers / kpi.interviews) * 100).toFixed(1)}% of interviews` : null },
  ];

  return (
    <div className="dash-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div role="group" aria-label="Date range" className="flex items-center rounded-lg border border-[var(--app-border-strong)] p-0.5">
            {([7, 30, 90] as DateRange[]).map((d) => (
              <button key={d} type="button" onClick={() => setDays(d)} aria-pressed={days === d}
                className={cn("px-2.5 py-1 text-[12px] rounded-md transition-colors", days === d ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-200")}>
                {d}d
              </button>
            ))}
          </div>
          <button type="button" onClick={handleExportCsv} disabled={isExporting}
            className="h-8 px-3 rounded-lg text-[12px] border border-[var(--app-border-strong)] text-zinc-300 hover:text-white hover:bg-white/[0.04] inline-flex items-center gap-1.5 disabled:opacity-50">
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-busy="true">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[0, 1, 2, 3].map((i) => <div key={i} className={cn(surface, "h-[76px] animate-pulse")} />)}</div>
          <div className={cn(surface, "h-64 animate-pulse")} />
        </div>
      ) : isError ? (
        <div className={cn(surface, "p-8 text-center space-y-3")}>
          <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />
          <p className="text-[14px] text-white">Failed to load analytics</p>
          <button type="button" onClick={() => refetch()} className="h-8 px-3 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-zinc-200">Retry</button>
        </div>
      ) : totalAccountApps === 0 ? (
        <div className={cn(surface, "px-6 py-8 text-center space-y-2")}>
          <p className="text-[14px] text-white">No applications tracked yet</p>
          <p className="text-[13px] text-zinc-400 max-w-md mx-auto">Conversion, response rates and next steps appear here once you start applying.</p>
          <Link href="/jobs" className="inline-flex h-8 items-center px-3 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-zinc-200">Find jobs</Link>
        </div>
      ) : (
        <>
          {followUp && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.05] px-3.5 py-2.5">
              <div className="min-w-0 text-[13px]">
                <span className="text-amber-200/90">{followUp.title}</span>
                <span className="text-zinc-400"> — submitted over 7 days ago without a response.</span>
              </div>
              <Link href={followUp.action_url || "/follow-ups"} className="inline-flex items-center gap-1 text-[12px] text-zinc-200 hover:text-white">
                Review <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)] divide-x divide-y lg:divide-y-0 divide-[var(--app-border-strong)] overflow-hidden">
            {cards.map((c) => {
              const ch = change(c.value, c.prev, days);
              return (
                <div key={c.label} className="px-4 py-3 min-w-0">
                  <div className="text-[12px] text-zinc-500 truncate">{c.label}</div>
                  <div className="mt-1 text-[22px] leading-7 font-medium text-white tabular-nums">{c.value}</div>
                  <div className={cn("mt-1 text-[12px] truncate", c.sub ? "text-zinc-300" : ch.muted ? "text-zinc-500" : "text-zinc-300")}>{c.sub ?? ch.text}</div>
                  {c.sub && <div className={cn("text-[12px] truncate", ch.muted ? "text-zinc-600" : "text-zinc-400")}>{ch.text}</div>}
                </div>
              );
            })}
          </div>

          <Section
            title="Activity"
            hint={
              <span className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3" style={{ background: WARM }} />Applications</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3" style={{ background: GREY_HI }} />Responses</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 border-t border-dashed" style={{ borderColor: GREY_LO }} />Interviews</span>
              </span>
            }
          >
            {periodTotal === 0 ? (
              <p className="py-4 text-[13px] text-zinc-500">
                No applications, responses or interviews in the last {days} days.{" "}
                <Link href="/applications" className="text-zinc-300 hover:text-white underline underline-offset-2">Review applications</Link>
              </p>
            ) : (
              <>
                <p className="text-[12px] text-zinc-500 mb-2">{appliedTotal} application{appliedTotal === 1 ? "" : "s"} in the last {days} days</p>
                <div className="h-48" role="img" aria-label={`Daily applications, responses and interviews for the last ${days} days`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activity} margin={{ top: 6, right: 8, left: -24, bottom: 0 }}>
                      <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={32} />
                      <YAxis allowDecimals={false} tick={{ fill: "var(--chart-axis)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTip />} cursor={{ stroke: "var(--chart-cursor)" }} />
                      <Line isAnimationActive={false} type="linear" dataKey="applied" name="Applications" stroke={WARM} strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
                      <Line isAnimationActive={false} type="linear" dataKey="responses" name="Responses" stroke={GREY_HI} strokeWidth={1.25} dot={false} />
                      <Line isAnimationActive={false} type="linear" dataKey="interviews" name="Interviews" stroke={GREY_LO} strokeWidth={1.25} strokeDasharray="4 3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </Section>

          <Section title="Application funnel" hint={`Applications dated in the last ${days} days`}>
            <ul className="space-y-3">
              {stages.map((s) => (
                <li key={s.key}>
                  <div className="flex items-center justify-between gap-3 text-[13px]">
                    <Link href={`/applications?status=${s.filter_status}`} className="text-zinc-200 hover:text-white">{s.name}</Link>
                    <span className="flex items-center gap-3 tabular-nums">
                      {s.conversion_rate !== null && s.conversion_rate !== undefined && <span className="text-[12px] text-zinc-500">{s.conversion_rate}% of previous stage</span>}
                      <span className="text-white w-8 text-right">{s.count}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-zinc-400/80" style={{ width: `${s.count ? Math.max((s.count / stageMax) * 100, 3) : 0}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            {queuedTotal > 0 && (
              <p className="mt-4 pt-3 border-t border-[var(--app-border-strong)] text-[12px] text-zinc-500">
                {queuedTotal} saved or queued job{queuedTotal === 1 ? "" : "s"} not yet submitted (not counted above).{" "}
                <Link href="/applications?status=queued" className="text-zinc-300 hover:text-white underline underline-offset-2">View</Link>
              </p>
            )}
          </Section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Targeted roles" hint="Top 5 submitted"><Ranked rows={breakdowns?.roles ?? []} empty="No submitted applications in this period." /></Section>
            <Section title="Top companies" hint="Top 5 submitted"><Ranked rows={breakdowns?.companies ?? []} empty="No submitted applications in this period." /></Section>
          </div>

          <Section title="Sources, work mode and response time">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3 text-[13px]">
              <div>
                <dt className="text-[12px] text-zinc-500">Source</dt>
                <dd className="text-zinc-200">
                  {breakdowns?.sources?.length
                    ? breakdowns.sources.map((s: any) => `${s.name} ${s.count}`).join(" · ")
                    : <span className="text-zinc-500">No data</span>}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-zinc-500">Work mode</dt>
                <dd className="text-zinc-200">
                  {breakdowns?.work_modes?.length
                    ? breakdowns.work_modes.map((w: any) => `${w.name} ${w.percentage}%`).join(" · ")
                    : <span className="text-zinc-500">No data</span>}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-zinc-500">Median time to response</dt>
                <dd className="text-zinc-200">
                  {responseTime?.median_days !== null && responseTime?.median_days !== undefined
                    ? <>{responseTime.median_days} days <span className="text-zinc-500">({responseTime.total_responded} response{responseTime.total_responded === 1 ? "" : "s"}, all time)</span></>
                    : <span className="text-zinc-500">No responses observed yet</span>}
                </dd>
              </div>
            </dl>
          </Section>
        </>
      )}
    </div>
  );
}
