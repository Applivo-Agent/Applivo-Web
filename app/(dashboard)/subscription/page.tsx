"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi, paymentsApi } from "@/lib/api";
import { useSubscription, PLAN_FEATURES, PLAN_PRICES, PlanTier } from "@/lib/subscription";
import { useAuth } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { safeNext } from "@/lib/safe-redirect";
import { PRICING_PLANS } from "@/lib/pricing-data";

const TIERS: { tier: Exclude<PlanTier, "none">; label: string }[] = [
  { tier: "starter", label: "Starter" },
  { tier: "pro", label: "Pro" },
  { tier: "premium", label: "Premium" },
];
const RANK: Record<string, number> = { none: 0, starter: 1, pro: 2, premium: 3 };
const PAGE_SIZE = 10;

const SUB_STATUS: Record<string, { label: string; note?: string }> = {
  active: { label: "Active" },
  trial: { label: "Free trial" },
  pending: { label: "Payment pending", note: "Setup was started but not completed." },
  cancelled: { label: "Cancelled" },
  trial_expired: { label: "Trial ended" },
  expired: { label: "Expired" },
};

function inr(paise: unknown): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(Number(paise || 0) / 100));
}

const section = "py-5 first:pt-0";
const h2 = "text-[14px] font-medium text-white";

function CopyRef({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      title={`Copy ${value}`}
      aria-label="Copy reference"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); }).catch(() => toast.error("Could not copy"));
      }}
      className="inline-flex items-center gap-1.5 font-mono text-[12px] text-zinc-400 hover:text-white"
    >
      <span className="max-w-[140px] truncate">{value}</span>
      {done ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function SubscriptionPage() {
  const { subscription: sub, quota, refresh, isLoading: subLoading } = useSubscription();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const historyQ = useQuery({ queryKey: ["payment-history"], queryFn: () => paymentsApi.history().then((r) => r.data) });
  const payments: any[] = historyQ.data?.payments ?? [];

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<string | null>(null);
  const checkoutLock = useRef(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  // Source of truth: the billing subscription row. Admin accounts get every feature regardless of plan, but that
  // is access, not a purchased plan, so it never decides which card says "Current".
  const subStatus = String(sub?.status ?? "").toLowerCase();
  const entitled = subStatus === "active" || subStatus === "trial";
  const billingPlan: PlanTier = entitled ? ((sub?.plan as PlanTier) ?? "none") : "none";
  const isAdmin = !!user?.is_superuser;
  const statusMeta = SUB_STATUS[subStatus] ?? { label: subStatus ? subStatus.replace(/_/g, " ") : "No subscription" };
  const trialDays = sub?.trial_days_remaining ?? 0;

  const createOrderMut = useMutation({
    mutationFn: (plan: PlanTier) => paymentsApi.createOrder({ plan }),
    onSuccess: (res) => {
      if (!razorpayLoaded) {
        checkoutLock.current = false;
        toast.error("Payment system is still loading. Try again in a moment.");
        return;
      }
      const { order_id, key_id, amount } = res.data;
      const rzp = new (window as any).Razorpay({
        key: key_id,
        amount,
        currency: "INR",
        name: "Applivo",
        order_id,
        modal: { ondismiss: () => { checkoutLock.current = false; } },
        handler: async (response: any) => {
          try {
            await paymentsApi.verify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment confirmed. Your plan is updated.");
            refresh();
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
            queryClient.invalidateQueries({ queryKey: ["payment-history"] });
            const back = safeNext(new URLSearchParams(window.location.search).get("return_to"));
            if (back) router.push(back);
          } catch {
            toast.error("We could not verify the payment. If you were charged, contact support.");
          } finally {
            checkoutLock.current = false;
          }
        },
        prefill: { email: user?.email },
        theme: { color: "#ffffff" },
      });
      rzp.open();
    },
    onError: (err: any) => {
      checkoutLock.current = false;
      toast.error(err.response?.data?.detail || "Could not start checkout. Please try again.");
    },
  });

  const cancelMut = useMutation({
    mutationFn: () => subscriptionsApi.cancel(),
    onSuccess: () => {
      toast.success("Subscription cancelled.");
      refresh();
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: () => toast.error("Could not cancel. Please contact support."),
  });

  const startTrialMut = useMutation({
    mutationFn: () => paymentsApi.startTrialWithAutopay({ plan: "starter" }),
    onSuccess: (res) => {
      const url = res.data?.short_url;
      if (url) window.location.href = url;
      else toast.error("Could not get the payment link. Please try again.");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Could not start the trial. Please try again."),
  });

  const handleSelect = (tier: PlanTier, label: string) => {
    if (billingPlan === tier || checkoutLock.current || createOrderMut.isPending) return;
    const direction = RANK[tier] < RANK[billingPlan] ? "switch down to" : "upgrade to";
    if (!confirm(`You are about to ${direction} ${label} (${inr(PLAN_PRICES[tier])} per month). You will be asked to pay ${inr(PLAN_PRICES[tier])} now. Continue?`)) return;
    checkoutLock.current = true;
    createOrderMut.mutate(tier);
  };

  const handleCancel = () => {
    if (confirm("Cancel your subscription? Access follows your plan rules once it is cancelled.")) cancelMut.mutate();
  };

  const downloadInvoice = async (p: any) => {
    setDownloading(p.id);
    try {
      const res = await paymentsApi.downloadInvoice(p.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `applivo-invoice-${String(p.id).slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      let detail = "Could not download the invoice. Please try again.";
      try { const t = await err?.response?.data?.text?.(); if (t) detail = JSON.parse(t).detail || detail; } catch { /* keep default */ }
      toast.error(detail);
    } finally {
      setDownloading(null);
    }
  };

  const invoices = payments.filter((p) => p.invoice_available);
  const pages = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));
  const pageRows = payments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});


  return (
    <div className="divide-y divide-[var(--app-border)]">

      {/* Current subscription: an open summary, not a card */}
      <section className={section} aria-label="Current subscription">
        {subLoading ? (
          <div className="h-12 animate-pulse rounded bg-white/[0.04]" />
        ) : (
          <>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[16px] font-medium text-white capitalize">
                    {sub && billingPlan !== "none" ? `${billingPlan} plan` : sub ? `${String(sub.plan)} plan` : "No active plan"}
                  </h2>
                  <span className="text-[12px] text-zinc-400">· {statusMeta.label}</span>
                </div>
                {sub && billingPlan !== "none" && <p className="text-[13px] text-zinc-400 mt-0.5">{inr(PLAN_PRICES[billingPlan])} per month</p>}
                {statusMeta.note && <p className="text-[12px] text-zinc-500 mt-1">{statusMeta.note}</p>}
                {!sub && <p className="text-[13px] text-zinc-400 mt-1">Choose a plan below to unlock the automation agent.</p>}
                {subStatus === "trial_expired" && <p className="text-[13px] text-zinc-400 mt-1">Your free trial has ended. Pick a plan below to continue.</p>}
                {isAdmin && <p className="text-[12px] text-zinc-500 mt-1">Admin access unlocks every feature; the plan shown is the billing subscription only.</p>}
              </div>
              {sub && (
                <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px] sm:grid-cols-4 lg:text-right">
                  <div><dt className="text-[12px] text-zinc-500">Started</dt><dd className="text-zinc-200">{sub.start_date ? formatDate(sub.start_date) : "—"}</dd></div>
                  <div>
                    <dt className="text-[12px] text-zinc-500">{subStatus === "trial" ? "Trial ends" : "Access until"}</dt>
                    <dd className="text-zinc-200">
                      {sub.end_date ? formatDate(sub.end_date) : "—"}
                      {subStatus === "trial" && trialDays > 0 && <span className="text-zinc-500"> · {trialDays}d left</span>}
                    </dd>
                  </div>
                  <div><dt className="text-[12px] text-zinc-500">Autopay</dt><dd className="text-zinc-200">{sub.autopay_enabled ? "On" : "Off"}</dd></div>
                  <div>
                    <dt className="text-[12px] text-zinc-500">Applications today</dt>
                    <dd className="text-zinc-200 tabular-nums">
                      {quota ? <>{quota.used} <span className="text-zinc-500">of {quota.limit}</span></> : sub.daily_limit ? `Limit ${sub.daily_limit}/day` : "—"}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
            {(subStatus === "pending" || entitled) && (
              <div className="mt-3">
                <button onClick={handleCancel} disabled={cancelMut.isPending} className="text-[13px] text-zinc-400 hover:text-white underline-offset-2 hover:underline disabled:opacity-50">
                  {cancelMut.isPending ? "Cancelling…" : subStatus === "pending" ? "Cancel & retry" : "Cancel subscription"}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Plans: one flat comparison, separated by hairlines only */}
      <section className={section} aria-label="Plans">
        <h2 className={h2}>Plans</h2>
        <p className="text-[12px] text-zinc-500 mt-0.5">Billed monthly. Cancel anytime.</p>
        <div className="mt-4 grid grid-cols-1 divide-y divide-[var(--app-border)] md:grid-cols-3 md:divide-x md:divide-y-0">
          {TIERS.map(({ tier, label }) => {
            const isCurrent = billingPlan === tier;
            const higher = RANK[tier] > RANK[billingPlan];
            const all = PLAN_FEATURES[tier].filter((f) => !/^Everything in /i.test(f));
            const meta = PRICING_PLANS.find((p) => p.id === tier);
            const offersTrial = tier === "starter" && !entitled && billingPlan === "none";
            const pending = createOrderMut.isPending && createOrderMut.variables === tier;
            const previous = tier === "pro" ? "Starter" : tier === "premium" ? "Pro" : null;
            const open = !!expanded[tier];
            const more = all.slice(5);
            const list = open ? all : all.slice(0, 5);
            const action = "h-8 w-full md:w-auto md:px-4 inline-flex items-center justify-center rounded-md text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 disabled:cursor-default";
            return (
              <div key={tier} className="flex flex-col py-5 first:pt-0 last:pb-0 md:py-0 md:px-6 md:first:pl-0 md:last:pr-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-[15px] font-medium text-white">{label}</h3>
                  {isCurrent && <span className="text-[12px] text-zinc-400">Current</span>}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span data-plan-price className="text-[28px] font-medium text-white leading-none tracking-tight">₹{Math.round(PLAN_PRICES[tier] / 100)}</span>
                  <span className="text-[12px] text-zinc-500">/month</span>
                </div>
                {offersTrial && <p className="text-[12px] text-zinc-500 mt-1">7 days free, then {inr(PLAN_PRICES.starter)}/month</p>}
                <p className="text-[12px] text-zinc-400 mt-2 leading-snug">{meta?.description ?? ""}</p>
                <div className="my-3 border-t border-[var(--app-border)]" />
                {open && previous && <p className="text-[12px] text-zinc-500 mb-2">Includes everything in {previous}</p>}
                <ul className="space-y-1.5">
                  {list.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-zinc-300 leading-snug">
                      <Check className="mt-[3px] h-3 w-3 shrink-0 text-zinc-500" strokeWidth={2} />{f}
                    </li>
                  ))}
                </ul>
                {more.length > 0 && (
                  <button type="button" aria-expanded={open} onClick={() => setExpanded((e) => ({ ...e, [tier]: !e[tier] }))} className="mt-2 self-start text-[12px] text-zinc-500 hover:text-white">
                    {open ? "Show fewer features" : `Show all features (+${more.length})`}
                  </button>
                )}
                <div className="mt-auto pt-4">
                  {offersTrial ? (
                    <button onClick={() => startTrialMut.mutate()} disabled={startTrialMut.isPending} className={cn(action, "bg-white text-black hover:bg-zinc-200 disabled:opacity-60")}>
                      {startTrialMut.isPending ? "Starting…" : "Start 7-day free trial"}
                    </button>
                  ) : isCurrent ? (
                    <span className="inline-flex h-8 items-center text-[13px] text-zinc-500">{subStatus === "trial" ? "Trial active" : "Current plan"}</span>
                  ) : (
                    <button onClick={() => handleSelect(tier, label)} disabled={createOrderMut.isPending}
                      className={cn(action, higher ? "bg-white text-black hover:bg-zinc-200 disabled:opacity-60" : "border border-[var(--app-border-strong)] text-zinc-300 hover:text-white hover:bg-white/[0.04] disabled:opacity-60")}>
                      {pending ? "Opening checkout…" : higher ? "Upgrade" : "Downgrade"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Invoices & receipts */}
      <section className={section} aria-label="Invoices and receipts">
        <h2 className={h2}>Invoices &amp; receipts</h2>
        {historyQ.isLoading ? (
          <div className="mt-3 h-8 animate-pulse rounded bg-white/[0.04]" />
        ) : historyQ.isError ? (
          <p className="mt-2 text-[13px] text-zinc-400">Couldn&apos;t load your billing documents. <button className="underline" onClick={() => historyQ.refetch()}>Retry</button></p>
        ) : invoices.length === 0 ? (
          <p className="mt-1 text-[13px] text-zinc-500">No invoices yet. One is issued after a payment is confirmed.</p>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--app-border)]">
            {invoices.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-[13px]">
                <span className="min-w-0 truncate">
                  <span className="font-mono text-[12px] text-zinc-300">INV-{String(p.id).slice(0, 8).toUpperCase()}</span>
                  <span className="text-zinc-500"> · {formatDate(p.created_at)} · <span className="capitalize">{String(p.plan || "").toLowerCase()}</span></span>
                </span>
                <span className="flex shrink-0 items-center gap-4">
                  <span className="text-white tabular-nums">{inr(p.amount)}</span>
                  <button onClick={() => downloadInvoice(p)} disabled={downloading === p.id} className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white disabled:opacity-50">
                    {downloading === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}Download
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Payment history */}
      <section className={section} aria-label="Payment history">
        <h2 className={h2}>Payment history</h2>
        {historyQ.isLoading ? (
          <div className="mt-3 h-10 animate-pulse rounded bg-white/[0.04]" />
        ) : payments.length === 0 ? (
          <p className="mt-1 text-[13px] text-zinc-500">No payments yet. Orders and payments appear here once you check out.</p>
        ) : (
          <>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-[13px]">
                <thead><tr className="text-[12px] text-zinc-500 border-b border-[var(--app-border)]">
                  <th className="py-1.5 pr-4 font-normal">Date</th><th className="py-1.5 pr-4 font-normal">Plan</th><th className="py-1.5 pr-4 font-normal">Amount</th>
                  <th className="py-1.5 pr-4 font-normal">Status</th><th className="py-1.5 pr-4 font-normal">Reference</th><th className="py-1.5 font-normal text-right">Invoice</th>
                </tr></thead>
                <tbody className="divide-y divide-[var(--app-border)]">
                  {pageRows.map((p) => (
                    <tr key={p.id}>
                      <td className="py-1.5 pr-4 text-zinc-300 whitespace-nowrap">{formatDate(p.created_at)}</td>
                      <td className="py-1.5 pr-4 text-zinc-300 capitalize">{String(p.plan || "").toLowerCase()}</td>
                      <td className="py-1.5 pr-4 text-white tabular-nums">{inr(p.amount)}</td>
                      <td className="py-1.5 pr-4 text-zinc-300 whitespace-nowrap" title={p.display?.hint || undefined}>{p.display?.label ?? String(p.status).toLowerCase()}</td>
                      <td className="py-1.5 pr-4"><CopyRef value={String(p.transaction_id || p.razorpay_order_id || p.id)} /></td>
                      <td className="py-1.5 text-right">
                        {p.invoice_available ? (
                          <button onClick={() => downloadInvoice(p)} disabled={downloading === p.id} className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white disabled:opacity-50">
                            {downloading === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}Download
                          </button>
                        ) : <span className="text-zinc-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="mt-3 flex items-center justify-between text-[12px] text-zinc-500">
                <span>Page {page} of {pages}</span>
                <span className="flex gap-1">
                  <button disabled={page === 1} onClick={() => setPage((n) => n - 1)} className="h-7 px-2.5 rounded-md border border-[var(--app-border-strong)] text-zinc-300 disabled:opacity-40">Prev</button>
                  <button disabled={page === pages} onClick={() => setPage((n) => n + 1)} className="h-7 px-2.5 rounded-md border border-[var(--app-border-strong)] text-zinc-300 disabled:opacity-40">Next</button>
                </span>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
