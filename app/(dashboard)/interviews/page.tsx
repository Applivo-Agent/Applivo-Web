"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
const INTERVIEW_STATUSES = ["interview_scheduled", "interview_completed"];

export default function InterviewsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["interview-applications"],
    queryFn: async () => {
      const rows = await Promise.all(
        INTERVIEW_STATUSES.map((status) => applicationsApi.list({ status, page_size: 50 }).then((r) => r.data?.items ?? []))
      );
      return rows.flat() as any[];
    },
  });
  const items = (data ?? []).slice().sort((a, b) => String(a.interview_date ?? "9999").localeCompare(String(b.interview_date ?? "9999")));

  return (
    <div className="dash-page">
      <section className="rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)] p-4">
        <header className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="text-[14px] font-medium text-white">Interviews</h2>
          <Link href="/applications?status=interview_scheduled" className="text-[12px] text-zinc-400 hover:text-white">View in Applications</Link>
        </header>

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">{[0, 1].map((i) => <div key={i} className="h-12 rounded-lg bg-white/[0.04] animate-pulse" />)}</div>
        ) : isError ? (
          <p className="text-[13px] text-zinc-400">Couldn&apos;t load your interviews. <button className="underline" onClick={() => refetch()}>Retry</button></p>
        ) : items.length === 0 ? (
          <p className="text-[13px] text-zinc-500 py-6 text-center">
            No interviews scheduled. When an application moves to the interview stage it will be listed here.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--app-border)]">
            {items.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/applications/${a.id}`} className="text-[14px] text-white hover:underline break-words">
                    {a.job_title_snapshot || a.job?.title || "Role not listed"}
                  </Link>
                  <p className="text-[12px] text-zinc-500 break-words">{a.company_snapshot || a.job?.company_name || "Company not listed"}</p>
                </div>
                <div className="shrink-0 text-right text-[12px]">
                  <p className="text-zinc-300">{a.interview_date ? formatDate(a.interview_date) : "Date not set"}</p>
                  <p className="text-zinc-500">{String(a.status).toLowerCase().replace(/_/g, " ")}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="text-[12px] text-zinc-600">AI mock interviews and prep packs are not available yet.</p>
    </div>
  );
}
