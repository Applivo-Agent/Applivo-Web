"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Totals { requests: number; succeeded: number; failed: number; success_rate: number; attempts: number; retries_and_fallback_attempts: number; fallback_requests: number; fallback_rate: number }
interface ModelRow { provider: string; model: string; attempts: number; succeeded: number; error_rate: number; tokens_in: number; tokens_out: number; cached_rate: number; cost_usd: number; p50_ms: number | null; p95_ms: number | null }
interface TaskRow { task_type: string; requests: number; succeeded: number; tokens: number; cost_usd: number; cost_per_request_usd: number | null }
interface UpstreamRow { upstream: string; calls: number; cost_usd: number; p50_ms: number | null; cached_rate: number }
interface ModeRow { mode: string; funded_by: "applivo" | "user"; requests: number; cost_usd: number }
interface Observability {
  window: { days: number; attempts_analysed: number; truncated: boolean; excluded_test_attempts: number };
  totals: Totals;
  tokens: { input: number; output: number; cached_input: number; cache_write: number; reasoning: number; provider_cache_hit_rate: number };
  cost: { reported_usd: number; estimated_only_usd: number; total_usd: number; unpriced_attempts: number; applivo_funded_usd: number; user_funded_usd: number; cost_per_successful_request_usd: number | null };
  latency: { p50_ms: number | null; p95_ms: number | null };
  by_model: ModelRow[]; by_task: TaskRow[]; by_upstream: UpstreamRow[]; by_credential_mode: ModeRow[];
  errors: { error_class: string; attempts: number }[];
  daily: { date: string; requests: number; failed: number; tokens: number; cost_usd: number }[];
  top_users: { user_id: string; email?: string | null; requests: number; tokens: number; cost_usd: number }[];
  recent_failures: { at: string; provider: string; model: string; error_class: string; task_type: string | null; request_id: string | null; attempt: number | null }[];
  privacy: Record<string, number>;
}

const usd = (n: number | null | undefined, d = 4) => (n == null ? "—" : `$${n.toFixed(d)}`);
const ms = (n: number | null | undefined) => (n == null ? "—" : n >= 1000 ? `${(n / 1000).toFixed(1)}s` : `${Math.round(n)}ms`);
const num = (n: number) => n.toLocaleString();

function Card({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "warn" | "bad" }) {
  return (
    <div className="rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] p-4">
      <p className="text-[11px] sm:text-[12px] font-medium text-zinc-400">{label}</p>
      <p className={cn("mt-1 text-[24px] leading-8 font-semibold tracking-tight text-white", tone === "good" && "text-emerald-400", tone === "warn" && "text-amber-400", tone === "bad" && "text-rose-400")}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">{sub}</p>}
    </div>
  );
}

function Table({ title, cols, rows, empty }: { title: string; cols: string[]; rows: (string | number)[][]; empty?: string }) {
  return (
    <div className="rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] p-4 overflow-x-auto">
      <p className="mb-2 text-[13px] font-semibold text-white">{title}</p>
      {rows.length === 0 ? <p className="py-3 text-xs text-zinc-500">{empty ?? "No data in this period."}</p> : (
        <table className="w-full text-left text-[12px]">
          <thead><tr className="text-zinc-500">{cols.map((c) => <th key={c} className="pb-1.5 pr-3 font-medium whitespace-nowrap">{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-[var(--app-border-strong)] text-zinc-300">
                {r.map((v, j) => <td key={j} className="py-1.5 pr-3 whitespace-nowrap">{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/** Cost, reliability and cache effectiveness of every LLM call. Metadata only — no prompts or answers. */
export function LLMObservability() {
  const [days, setDays] = useState(7);
  const [includeTest, setIncludeTest] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-llm-observability", days, includeTest],
    queryFn: () => api.get<Observability>("/admin/llm/observability", { params: { days, include_test: includeTest } }).then((r) => r.data),
    staleTime: 30_000,
  });

  if (isLoading) return <div className="mb-8 h-40 animate-pulse rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)]" />;
  if (isError || !data) {
    return (
      <div className="mb-8 rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-300">
        Couldn&apos;t load LLM observability. <button onClick={() => refetch()} className="underline">Retry</button>
      </div>
    );
  }

  const t = data.totals, c = data.cost;
  const maxDaily = Math.max(1, ...data.daily.map((d) => d.requests));
  const successTone = t.requests === 0 ? undefined : t.success_rate >= 99 ? "good" : t.success_rate >= 95 ? "warn" : "bad";

  return (
    <section className="mb-10 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-white tracking-tight">Cost &amp; reliability</h2>
          <p className="mt-0.5 text-xs text-zinc-400">
            Per request, from Applivo&apos;s own usage ledger. Free: no external service. Metadata only (no prompts, answers or keys).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-zinc-400">
            <input type="checkbox" checked={includeTest} onChange={(e) => setIncludeTest(e.target.checked)} className="accent-white" />
            include test traffic{data.window.excluded_test_attempts > 0 && !includeTest ? ` (${data.window.excluded_test_attempts} hidden)` : ""}
          </label>
          <div className="flex items-center gap-1 rounded-lg border border-[var(--app-border-strong)] bg-[#171717] p-0.5">
            {[1, 7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)} className={cn("rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors", days === d ? "bg-white text-black" : "text-zinc-400 hover:text-white")}>
                {d === 1 ? "24h" : `${d}d`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card label="Requests" value={num(t.requests)} sub={`${num(t.attempts)} provider calls, ${num(t.retries_and_fallback_attempts)} retries/fallbacks`} />
        <Card label="Success rate" value={t.requests ? `${t.success_rate}%` : "—"} sub={`${num(t.failed)} failed requests`} tone={successTone} />
        <Card label="Cost (Applivo-funded)" value={usd(c.applivo_funded_usd)} sub={`provider-reported ${usd(c.reported_usd)} + estimated ${usd(c.estimated_only_usd)}`} />
        <Card label="Cost / successful request" value={usd(c.cost_per_successful_request_usd, 6)} sub={c.unpriced_attempts ? `${c.unpriced_attempts} calls have no verified price (not counted)` : "all calls priced"} tone={c.unpriced_attempts ? "warn" : undefined} />
        <Card label="Fallback rate" value={`${t.fallback_rate}%`} sub={`${num(t.fallback_requests)} requests served by a fallback`} tone={t.fallback_rate > 10 ? "warn" : undefined} />
        <Card label="Provider cache hit" value={`${data.tokens.provider_cache_hit_rate}%`} sub={`${num(data.tokens.cached_input)} of ${num(data.tokens.input)} input tokens`} />
        <Card label="Latency p50 / p95" value={`${ms(data.latency.p50_ms)} / ${ms(data.latency.p95_ms)}`} sub="successful calls" />
        <Card label="User-funded (historical BYOK)" value={usd(c.user_funded_usd)} sub="historical rows only: bring-your-own-key was removed and every new request is Applivo-managed" />
      </div>

      <div className="rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-card)] p-4">
        <p className="mb-2 text-[13px] font-semibold text-white">Requests per day <span className="font-normal text-zinc-500">(red = requests where every attempt failed)</span></p>
        {data.daily.length === 0 ? <p className="py-3 text-xs text-zinc-500">No data in this period.</p> : (
          <div className="flex h-24 items-stretch gap-1.5">
            {data.daily.map((d) => (
              <div key={d.date} className="group flex h-full flex-1 flex-col items-center justify-end" title={`${d.date}: ${d.requests} requests, ${d.failed} failed, ${usd(d.cost_usd)}`}>
                <div className="flex w-full flex-col justify-end overflow-hidden rounded-t bg-white/80" style={{ height: `${Math.max(4, (d.requests / maxDaily) * 100)}%` }}>
                  {d.failed > 0 && <div className="bg-rose-500" style={{ height: `${(d.failed / d.requests) * 100}%` }} />}
                </div>
                <span className="mt-1 text-[9px] text-zinc-600">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Table title="By model" cols={["model", "calls", "error", "cache", "p50", "p95", "cost"]}
          rows={data.by_model.map((m) => [`${m.provider}/${m.model.split("/").pop()}`, num(m.attempts), `${m.error_rate}%`, `${m.cached_rate}%`, ms(m.p50_ms), ms(m.p95_ms), usd(m.cost_usd)])} />
        <Table title="By task (cost per successful request)" cols={["task", "requests", "ok", "tokens", "cost", "per request"]}
          rows={data.by_task.map((x) => [x.task_type, num(x.requests), num(x.succeeded), num(x.tokens), usd(x.cost_usd), usd(x.cost_per_request_usd, 6)])} />
        <Table title="Upstream hosts (routers like OpenRouter)" cols={["host", "calls", "p50", "cache", "cost"]}
          rows={data.by_upstream.map((u) => [u.upstream, num(u.calls), ms(u.p50_ms), `${u.cached_rate}%`, usd(u.cost_usd)])}
          empty="No routed calls in this period." />
        <Table title="Who pays" cols={["credential mode", "paid by", "requests", "cost"]}
          rows={data.by_credential_mode.map((m) => [m.mode, m.funded_by === "applivo" ? "Applivo" : "the user", num(m.requests), usd(m.cost_usd)])} />
        <Table title="Failures by class" cols={["error class", "attempts"]} rows={data.errors.map((e) => [e.error_class, num(e.attempts)])} empty="No failed calls." />
        <Table title="Top Applivo-funded spenders" cols={["user", "requests", "tokens", "cost"]}
          rows={data.top_users.map((u) => [u.email ?? u.user_id.slice(0, 8), num(u.requests), num(u.tokens), usd(u.cost_usd)])} />
      </div>

      <Table title="Recent failed calls" cols={["when", "model", "error", "task", "request id"]}
        rows={data.recent_failures.map((f) => [new Date(f.at).toLocaleString(), `${f.provider}/${f.model.split("/").pop()}`, f.error_class, f.task_type ?? "—", (f.request_id ?? "").slice(0, 10)])}
        empty="No failures in this period." />

      <p className="text-[11px] leading-5 text-zinc-600">
        Privacy routing of successful calls: {Object.entries(data.privacy).map(([k, v]) => `${k.replace("not_applicable", "n/a")} ×${v}`).join(", ") || "—"}.
        Privacy mode is the routing policy requested, not a guarantee. {data.window.truncated && "Showing the newest 50,000 calls only."}
      </p>
    </section>
  );
}
