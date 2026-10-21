"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { TrendingUp, Briefcase, DollarSign, MapPin, Users, Loader2 } from "lucide-react";
import { ApplivoLoader } from "@/components/applivo-loader";

export default function MarketPage() {
  const { isPremium, isLoading: subLoading } = useSubscription();

  const { data: market, isLoading } = useQuery({
    queryKey: ["market-insights"],
    queryFn: () => analyticsApi.market().then((r) => r.data),
    enabled: isPremium,
    staleTime: 10 * 60 * 1000,
  });

  if (subLoading || isLoading) {
    return <ApplivoLoader variant="content" text="Loading Market Insights" />;
  }

  if (!isPremium) {
    return (
      <div className="dash-page space-y-6">
        <div>
          <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">Market Insights</h1>
          <p className="dash-subtitle mt-1">Latest job market intelligence based on your target roles.</p>
        </div>
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-12 text-center">
          <TrendingUp className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
          <h2 className="text-[16px] font-semibold text-white mb-1.5">Premium Feature</h2>
          <p className="text-[14px] text-zinc-400">Upgrade to Premium to access market insights.</p>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="dash-page space-y-6">
        <div>
          <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">Market Insights</h1>
          <p className="dash-subtitle mt-1">Latest job market intelligence based on your target roles.</p>
        </div>
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-12 text-center">
          <p className="text-[14px] text-zinc-400">No market data available. Run the agent first to collect data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page space-y-6">
      <div>
        <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">Market Insights</h1>
        <p className="dash-subtitle mt-1">Latest job market intelligence based on your target roles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-zinc-400" />
            <span className="text-[12px] font-medium text-zinc-400">Jobs Analyzed</span>
          </div>
          <p className="text-[24px] leading-8 font-semibold tracking-tight text-white">{market.total_jobs_analyzed?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-zinc-400" />
            <span className="text-[12px] font-medium text-zinc-400">Avg Salary Range</span>
          </div>
          <p className="text-[24px] leading-8 font-semibold tracking-tight text-white">
            ₹{Math.round((market.salary_data?.min_salary || 1400000) / 100000)}L - 
            ₹{Math.round((market.salary_data?.max_salary || 2200000) / 100000)}L
          </p>
        </div>
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-zinc-400" />
            <span className="text-[12px] font-medium text-zinc-400">Top Work Mode</span>
          </div>
          <p className="text-[24px] leading-8 font-semibold tracking-tight text-white capitalize">
            {market.by_work_mode ? Object.entries(market.by_work_mode as Record<string, number>).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A' : 'N/A'}
          </p>
        </div>
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <span className="text-[12px] font-medium text-zinc-400">Top Companies</span>
          </div>
          <p className="text-[24px] leading-8 font-semibold tracking-tight text-white">{market.top_companies_hiring?.length || 0}</p>
        </div>
      </div>

      {market.top_skills?.length > 0 && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-zinc-400" /> Top Skills in Demand
          </h2>
          <div className="flex flex-wrap gap-2">
            {(market.top_skills as string[]).map((skill: string, i: number) => (
              <span key={i} className="px-2.5 py-1 bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300 rounded-md text-[12px] font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {market.emerging_roles?.length > 0 && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Emerging Roles</h2>
          <div className="space-y-2.5">
            {(market.emerging_roles as string[]).map((role: string, i: number) => (
              <div key={i} className="flex items-center gap-2.5 text-[13px] text-zinc-300">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full shrink-0" />
                <span>{role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
        <h2 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Work Mode Distribution</h2>
        {market.by_work_mode && (
          <div className="space-y-3.5">
            {Object.entries(market.by_work_mode as Record<string, number>).map(([mode, count]) => (
              <div key={mode}>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="capitalize text-zinc-300">{mode}</span>
                  <span className="text-zinc-400">{count} jobs</span>
                </div>
                <div className="h-2 bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${(count / (market.total_jobs_analyzed || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}