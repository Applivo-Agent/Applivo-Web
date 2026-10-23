"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { ExternalLink } from "lucide-react";

interface SkillGap {
  id: string;
  skill_name: string;
  demand_count: number;
  priority: string | null;
  learning_resources: string[] | null;
}

const isUrl = (v: string) => /^https?:\/\//i.test(v);

export default function SkillGapsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["skill-gaps"],
    queryFn: () => analyticsApi.skillGaps().then((r) => r.data as SkillGap[]),
  });
  const skills = Array.isArray(data) ? data : [];

  return (
    <div className="dash-page">
      <section className="rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-card)] p-4">
        <header className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="text-[14px] font-medium text-white">Skills to develop</h2>
          <span className="text-[12px] text-zinc-500">Ranked by demand in jobs you have analysed</span>
        </header>

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg bg-white/[0.04] animate-pulse" />)}</div>
        ) : isError ? (
          <p className="text-[13px] text-zinc-400">Couldn&apos;t load your skill gaps. <button className="underline" onClick={() => refetch()}>Retry</button></p>
        ) : skills.length === 0 ? (
          <p className="text-[13px] text-zinc-500 py-6 text-center">
            No skill gaps detected yet. They appear after jobs are analysed against your profile.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--app-border)]">
            {skills.map((s) => {
              const links = (s.learning_resources ?? []).filter(isUrl);
              return (
                <li key={s.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[14px] text-white break-words">{s.skill_name}</p>
                    <p className="text-[12px] text-zinc-500">
                      Requested in {s.demand_count} job{s.demand_count === 1 ? "" : "s"}
                      {s.priority ? ` · ${s.priority} priority` : ""}
                    </p>
                  </div>
                  {links.length > 0 && (
                    <a href={links[0]} target="_blank" rel="noopener noreferrer"
                       className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-[var(--app-border-strong)] text-[13px] text-zinc-200 hover:text-white hover:bg-white/[0.04]">
                      Learn <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
