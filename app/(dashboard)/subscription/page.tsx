"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi, paymentsApi } from "@/lib/api";
import { useSubscription, PLAN_FEATURES, PLAN_PRICES, PlanTier } from "@/lib/subscription";
import { useAuth } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { CreditCard, Check, ShieldAlert, Sparkles, Crown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { safeNext } from "@/lib/safe-redirect";

function paymentStatusMeta(status: unknown): { label: string; className: string } {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "captured") {
    return { label: "Paid", className: "text-zinc-300" };
  }
  if (normalized === "failed") {
    return { label: "Failed", className: "text-zinc-300" };
  }
  if (normalized === "refunded") {
    return { label: "Refunded", className: "text-white" };
  }
  if (normalized === "created" || normalized === "authorized" || normalized === "pending") {
    return { label: "Not Paid", className: "text-white" };
  }
  return { label: normalized ? normalized : "Unknown", className: "text-zinc-400" };
}

function formatINRFromPaise(amount: unknown): string {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value / 100));
}

function PaymentHistory({ payments }: { payments: any[] }) {
  if (!payments.length) {
    return (
      <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5 text-[13px] text-zinc-400">
        No payment history yet.
      </div>
    );
  }

  return (
    <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
      <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-tight mb-4">Payment History</h3>
      <div className="space-y-3">
        {payments.map((payment) => (
          (() => {
            const statusMeta = paymentStatusMeta(payment.status);
            return (
              <div key={payment.id} className="flex flex-col gap-2 rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] p-3.5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-white">{String(payment.plan || "plan").toUpperCase()}</div>
                  <div className="mt-0.5 text-[11px] text-zinc-400 break-all font-mono">
                    Transaction ID: {payment.transaction_id || payment.razorpay_payment_id || payment.razorpay_order_id || payment.id}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[12px] text-zinc-400">
                  <span className="font-semibold text-white">{formatINRFromPaise(payment.amount)}</span>
                  <span className={statusMeta.className}>{statusMeta.label}</span>
                  <span>{new Date(payment.created_at).toLocaleString()}</span>
                </div>
              </div>
            );
          })()
        ))}
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const { subscription: sub, plan: currentPlan, isActive, quota, refresh } = useSubscription();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: historyData } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => paymentsApi.history().then(r => r.data),
  });

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const createOrderMut = useMutation({
    mutationFn: (plan: PlanTier) => paymentsApi.createOrder({ plan }),
    onSuccess: async (res) => {
      if (!razorpayLoaded) {
        alert("Payment system loading, please try again");
        return;
      }
      const { order_id, key_id, amount } = res.data;
      const rzp = new (window as any).Razorpay({
        key: key_id,
        amount,
        currency: "INR",
        name: "Applivo",
        order_id: order_id,
        handler: async (response: any) => {
          try {
            await paymentsApi.verify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            refresh();
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
            queryClient.invalidateQueries({ queryKey: ["payment-history"] });
            // Only reached after the server verified the payment signature (paymentsApi.verify resolved).
            // The destination is re-validated; the extension connect page re-checks the plan server-side again.
            const back = safeNext(new URLSearchParams(window.location.search).get("return_to"));
            if (back) router.push(back);
          } catch (err) {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: { email: user?.email },
        theme: { color: "#ffffff" },
      });
      rzp.open();
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to create order. Please try again.");
    },
  });

  const cancelMut = useMutation({
    mutationFn: () => subscriptionsApi.cancel(),
    onSuccess: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: () => alert("Failed to cancel. Contact support."),
  });

  const startTrialMut = useMutation({
    mutationFn: () => paymentsApi.startTrialWithAutopay({ plan: "starter" }),
    onSuccess: (res) => {
      const shortUrl = res.data?.short_url;
      if (shortUrl) window.location.href = shortUrl;
      else alert("Could not get payment link. Please try again.");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Failed to start trial. Please try again.");
    },
  });

  const handleCheckout = (planTier: PlanTier) => {
    if (currentPlan === planTier) return;
    createOrderMut.mutate(planTier);
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel your subscription?")) {
      cancelMut.mutate();
    }
  };

  const plans: { tier: PlanTier; label: string; popular?: boolean }[] = [
    { tier: "starter", label: "Starter" },
    { tier: "pro", label: "Pro", popular: true },
    { tier: "premium", label: "Premium" },
  ];

  const allPayments = historyData?.payments ?? [];
  const latestPayment = allPayments[0] ?? null;
  const olderPayments = allPayments.slice(1);
  const latestPaymentMeta = paymentStatusMeta(latestPayment?.status);

  const trialDaysRemaining = sub?.trial_days_remaining ?? 0;
  const isTrialExpired = sub?.status === "trial_expired";
  const isOnTrial = sub?.status === "trial" && trialDaysRemaining > 0;
  const noAutopay = sub?.status === "trial" && !sub?.autopay_enabled;
  const isPendingPayment = sub?.status === "pending";

  return (
    <div className="dash-page max-w-5xl space-y-6">
      <div>
        <h1 className="text-[22px] leading-7 font-medium tracking-tight text-white">Subscription</h1>
        <p className="dash-subtitle mt-1">Manage your Applivo billing loop and quotas.</p>
      </div>

      {/* Pending payment — user started trial flow but didn't complete ₹5 card verification */}
      {isPendingPayment && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-semibold text-white flex items-center gap-2">
                <span>⏳</span> Complete your trial setup
              </p>
              <p className="text-[12px] text-zinc-400 mt-1">
                You started the free trial flow but didn&apos;t complete the ₹5 card verification. Cancel and try again to complete the setup.
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelMut.isPending}
              className="h-8 px-3.5 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {cancelMut.isPending ? "..." : "Cancel & Retry"}
            </button>
          </div>
        </div>
      )}

      {/* Trial Banners */}
      {isOnTrial && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-semibold text-white flex items-center gap-2">
                <span>⏳</span> You are on a 7-day free trial
              </p>
              <p className="text-[12px] text-zinc-400 mt-1">
                {trialDaysRemaining} {trialDaysRemaining === 1 ? "day" : "days"} remaining. Your card will be charged ₹199 when the trial ends.
              </p>
            </div>
            <button
              onClick={() => alert("Razorpay subscription management coming soon")}
              className="h-8 px-3.5 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors whitespace-nowrap"
            >
              Manage Autopay
            </button>
          </div>
        </div>
      )}

      {noAutopay && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-semibold text-white flex items-center gap-2">
                <span>⚠️</span> No payment method saved
              </p>
              <p className="text-[12px] text-zinc-400 mt-1">
                Add your card to avoid losing access after your trial ends in {trialDaysRemaining} days.
              </p>
            </div>
            <button
              onClick={() => alert("Start autopay flow coming soon")}
              className="h-8 px-3.5 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors whitespace-nowrap"
            >
              Add Card
            </button>
          </div>
        </div>
      )}

      {isTrialExpired && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[14px] font-semibold text-white flex items-center gap-2">
                <span>❌</span> Your free trial has ended
              </p>
              <p className="text-[12px] text-zinc-400 mt-1">
                Subscribe to continue using Applivo. Choose a plan and start your paid subscription.
              </p>
            </div>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
              className="h-8 px-3.5 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors whitespace-nowrap"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      )}

      {latestPayment && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-medium text-zinc-400">Latest Payment</p>
              <p className="text-[14px] font-semibold text-white mt-0.5">
                {String(latestPayment.plan || "starter").toUpperCase()} • {formatINRFromPaise(latestPayment.amount)}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono break-all">
                Transaction ID: {latestPayment.transaction_id || latestPayment.razorpay_payment_id || latestPayment.razorpay_order_id || latestPayment.id}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className={cn(
                "text-[12px] font-semibold uppercase tracking-wider",
                latestPaymentMeta.className
              )}>
                {latestPaymentMeta.label}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{new Date(latestPayment.created_at).toLocaleString()}</p>
            </div>
          </div>
          {!isActive && String(latestPayment?.status || "").toLowerCase() === "captured" && (
            <p className="mt-3 text-[12px] text-zinc-300 border-t border-[var(--app-border-strong)] pt-3">
              Payment is captured. Plan activation is syncing. Please refresh once or wait a moment.
            </p>
          )}
        </div>
      )}

      {isActive && sub ? (
        <div className="bg-[var(--app-card)] p-5 flex items-start justify-between border border-[var(--app-border-strong)] rounded-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[16px] font-semibold capitalize text-white">{sub.plan} Plan</h2>
              <span className="px-2 py-0.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300 text-[11px] font-medium rounded">{sub.status === "trial" ? "Trial" : "Active"}</span>
            </div>
            <p className="text-[12px] text-zinc-400 max-w-lg">
              Active until {sub.end_date ? formatDate(sub.end_date) : "the end of time"}. Quota: {quota?.limit || "unlimited"}/day.
            </p>
          </div>
          <button
            onClick={handleCancel}
            disabled={cancelMut.isPending}
            className="h-8 px-3 border border-[var(--app-border-strong)] bg-[#171717] hover:bg-[var(--app-card)] text-zinc-300 hover:text-white rounded-md text-[12px] font-medium transition-colors disabled:opacity-50"
          >
            {cancelMut.isPending ? "..." : "Cancel"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg">
          <ShieldAlert className="w-4 h-4 text-zinc-400 shrink-0" />
          <p className="text-[13px] text-zinc-300">Upgrade to unlock the autonomous agent.</p>
        </div>
      )}

      {/* Upgrade Grid */}
      <div className="grid md:grid-cols-3 gap-4 pt-1">
        {plans.map(p => (
          <div key={p.tier} className={cn("relative bg-[var(--app-card)] p-5 flex flex-col border border-[var(--app-border-strong)] rounded-lg transition-all",
            p.popular ? "ring-1 ring-white/20" : "",
            currentPlan === p.tier ? "opacity-75" : "")}>

            {currentPlan === p.tier && (
              <div className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-300 rounded">
                Current
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-semibold text-[15px] sm:text-[16px] text-white tracking-tight">{p.label}</h3>
                  {p.tier === 'premium' && <Crown className="w-3.5 h-3.5 text-zinc-400" />}
                </div>
                <div className="flex items-baseline gap-1.5">
                  {p.tier === "starter" ? (
                    <>
                      <span className="text-[24px] leading-8 font-semibold tracking-tight text-white">₹0</span>
                      <span className="text-zinc-500 line-through text-[13px]">{formatINRFromPaise(PLAN_PRICES[p.tier])}</span>
                    </>
                  ) : (
                    <span className="text-[24px] leading-8 font-semibold tracking-tight text-white">{formatINRFromPaise(PLAN_PRICES[p.tier])}</span>
                  )}
                  <span className="text-zinc-400 text-[11px] font-medium">/mo</span>
                </div>
              </div>
              {p.popular && (
                <div className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Popular
                </div>
              )}
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {PLAN_FEATURES[p.tier].map(f => (
                <li key={f} className="flex gap-2 items-start">
                  <div className="mt-0.5 w-3.5 h-3.5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-zinc-400 text-[12px] leading-tight">{f}</span>
                </li>
              ))}
            </ul>

            {p.tier === "starter" && !isActive ? (
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => startTrialMut.mutate()}
                  disabled={startTrialMut.isPending}
                  className="w-full h-9 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-zinc-200"
                >
                  {startTrialMut.isPending ? "Starting..." : "Start 7-Day Free Trial"}
                </button>
                <p className="text-[11px] text-zinc-400">No charge for 7 days · ₹199/mo after trial</p>
              </div>
            ) : (
              <button
                onClick={() => handleCheckout(p.tier)}
                disabled={currentPlan === p.tier || createOrderMut.isPending}
                className={cn("w-full h-9 rounded-lg text-[13px] font-semibold transition-colors disabled:cursor-not-allowed",
                  currentPlan === p.tier ? "bg-[var(--app-nested)] border border-[var(--app-border-strong)] text-zinc-500" : "bg-white text-black hover:bg-zinc-200"
                )}>
                {createOrderMut.isPending ? "..." : currentPlan === p.tier ? (isOnTrial ? "Trial Active" : "Current Plan") : "Upgrade"}
              </button>
            )}
          </div>
        ))}
      </div>

      {olderPayments.length > 0 && <PaymentHistory payments={olderPayments} />}
    </div>
  );
}
