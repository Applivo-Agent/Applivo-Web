"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
const WAIT_DAYS = 7;   // same rule the analytics reminder uses: applied, no response for 7 days

export default function FollowUpsPage() {
  const { data: due = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["follow-up-candidates"],
    queryFn: async () => {
      const items = ((await applicationsApi.list({ status: "applied", page_size: 100 })).data?.items ?? []) as any[];
      const now = Date.now();                                          // evaluated at fetch time, not during render
      return items
        .filter((a) => a.applied_at && new Date(a.applied_at).getTime() <= now - WAIT_DAYS * 86_400_000)
        .map((a) => ({ ...a, days_ago: Math.floor((now - new Date(a.applied_at).getTime()) / 86_400_000) }))
        .sort((x, y) => String(x.applied_at).localeCompare(String(y.applied_at)));
    },
  });

  return (
    <div className="dash-page">
      <section className="rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)] p-4">
        <header className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="text-[14px] font-medium text-white">Awaiting a response</h2>
          <span className="text-[12px] text-zinc-500">Applied {WAIT_DAYS}+ days ago with no reply</span>
        </header>

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">{[0, 1].map((i) => <div key={i} className="h-12 rounded-lg bg-white/[0.04] animate-pulse" />)}</div>
        ) : isError ? (
          <p className="text-[13px] text-zinc-400">Couldn&apos;t load your applications. <button className="underline" onClick={() => refetch()}>Retry</button></p>
        ) : due.length === 0 ? (
          <p className="text-[13px] text-zinc-500 py-6 text-center">
            Nothing to follow up on. Applications appear here {WAIT_DAYS} days after you apply if the employer has not replied.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--app-border)]">
            {due.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/applications/${a.id}`} className="text-[14px] text-white hover:underline break-words">
                    {a.job_title_snapshot || a.job?.title || "Role not listed"}
                  </Link>
                  <p className="text-[12px] text-zinc-500 break-words">{a.company_snapshot || a.job?.company_name || "Company not listed"}</p>
                </div>
                <div className="shrink-0 text-right text-[12px]">
                  <p className="text-zinc-300">{a.days_ago} days ago</p>
                  <p className="text-zinc-500">{formatDate(a.applied_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
