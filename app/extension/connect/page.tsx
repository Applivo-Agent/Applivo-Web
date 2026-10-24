"use client";

/**
 * The single place where the browser extension is connected to an account.
 *
 *   signed out            -> /login (or /register for first-time installs), returning here afterwards
 *   signed in, no plan    -> /subscription, returning here after a VERIFIED payment
 *   signed in, paid plan  -> PKCE-style pairing with the extension (see lib/extension.tsx)
 *
 * Entitlement is always read from the server (GET /api/ext/entitlement); nothing here decides access on its own.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Puzzle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { extApi } from "@/lib/api";
import { useExtension } from "@/lib/extension";
import { nextQuery } from "@/lib/safe-redirect";

const HERE = "/extension/connect";
const PLANS = "/subscription?return_to=" + encodeURIComponent(HERE);

type Gate = "checking" | "ready" | "error";

export default function ExtensionConnectPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { status, info, connect, disconnect, refresh } = useExtension();
  const router = useRouter();
  const [gate, setGate] = useState<Gate>("checking");
  const [plan, setPlan] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [pairFailed, setPairFailed] = useState(false);
  const started = useRef(false);

  // 1. Signed out -> login/register (destination kept). Signed in -> plan, from the server.
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const intent = new URLSearchParams(window.location.search).get("intent");
      router.replace((intent === "signup" ? "/register" : "/login") + nextQuery(HERE));
      return;
    }
    let cancelled = false;
    extApi.entitlement()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data.entitled) { router.replace(PLANS); return; }    // no eligible paid plan: never pair, go buy one
        setPlan(data.plan);
        setGate("ready");
      })
      .catch(() => { if (!cancelled) setGate("error"); });
    return () => { cancelled = true; };
  }, [isLoading, isAuthenticated, router]);

  const sameAccount = !!(user && status === "connected" && info?.email && info.email.toLowerCase() === user.email.toLowerCase());
  const redirecting = !isLoading && !isAuthenticated;      // signed out: the effect above is navigating away
  const connected = gate === "ready" && sameAccount;

  // 2. Entitled and not yet attached to THIS account: pair. A different account on the extension is detached first.
  useEffect(() => {
    if (gate !== "ready" || sameAccount || started.current || pairFailed) return;
    if (status === "checking" || status === "not_installed") return;
    started.current = true;
    void (async () => {
      if (info?.connected) await disconnect();            // another account (or a stale/revoked connection) was attached
      const ok = await connect();
      if (ok) { await refresh(); setApproving(true); } else { started.current = false; setPairFailed(true); }
    })();
  }, [gate, sameAccount, status, info, pairFailed, connect, disconnect, refresh]);

  const phase: "checking" | "redirecting" | "needs_extension" | "pairing" | "approve" | "connected" | "error" =
    redirecting ? "redirecting"
    : gate === "error" || pairFailed ? "error"
    : gate === "checking" ? "checking"
    : connected ? "connected"
    : status === "not_installed" ? "needs_extension"
    : approving ? "approve"
    : "pairing";

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-[380px] rounded-[2rem] border border-white/[0.07] bg-[color-mix(in_srgb,var(--sx-bg-242424)_95%,transparent)] p-8 text-center space-y-5">
        <div className="mx-auto w-12 h-12 rounded-xl border border-white/10 bg-[var(--sx-bg-111115)] flex items-center justify-center">
          <Puzzle className="w-5 h-5 text-white" aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-white">Connect the Applivo extension</h1>

        {(phase === "checking" || phase === "redirecting") && (
          <p role="status" className="flex items-center justify-center gap-2 text-sm text-[var(--sx-tx-a1a1aa)]">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            {phase === "redirecting" ? "Taking you to the next step…" : "Checking your account…"}
          </p>
        )}

        {phase === "needs_extension" && (
          <p className="text-sm text-[var(--sx-tx-a1a1aa)]">
            We couldn&apos;t find the Applivo extension in this browser. Install it from the Chrome Web Store, then reload this page.
          </p>
        )}

        {phase === "pairing" && (
          <p role="status" className="flex items-center justify-center gap-2 text-sm text-[var(--sx-tx-a1a1aa)]">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Connecting securely…
          </p>
        )}

        {phase === "approve" && (
          <p role="status" className="text-sm text-[var(--sx-tx-a1a1aa)]">
            Approve the connection in the Applivo extension window that just opened.
          </p>
        )}

        {phase === "connected" && (
          <div role="status" className="space-y-3">
            <p className="flex items-center justify-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" aria-hidden /> Extension connected{plan ? ` · ${plan[0] + plan.slice(1).toLowerCase()} plan` : ""}
            </p>
            <Link href="/dashboard" className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300">
              Go to dashboard
            </Link>
          </div>
        )}

        {phase === "error" && (
          <div role="alert" className="space-y-3">
            <p className="flex items-center justify-center gap-2 text-sm text-amber-400">
              <AlertTriangle className="w-4 h-4" aria-hidden /> We couldn&apos;t finish connecting.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
