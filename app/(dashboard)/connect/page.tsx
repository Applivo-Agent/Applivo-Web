"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Link2,
  Shield,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  ChevronDown,
  RefreshCw,
  Copy,
  Check,
  Monitor,
} from "lucide-react";
import axios from "axios";

type PlatformConnectionStatus = {
  platform: string;
  is_valid: boolean;
  last_validated?: string | null;
  last_used?: string | null;
  expires_at?: string | null;
};

type PlatformStatusResponse = {
  platforms: PlatformConnectionStatus[];
};

const COOKIE_HELPER_SCRIPT = `copy(JSON.stringify(document.cookie.split(';').map(c=>{const[n,...v]=c.trim().split('=');return{name:n.trim(),value:v.join('=').trim(),domain:'.internshala.com',path:'/'}})))`;

const LOGIN_STEPS = [
  "Opening secure browser on the server…",
  "Unlocking Internshala session…",
  "Signing in with your credentials…",
  "Capturing your session securely…",
  "Almost done…",
];

function getSessionExpiryInfo(expiresAt?: string | null) {
  if (!expiresAt) return { text: null, isExpiringSoon: false };
  try {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) return { text: "Expired", isExpiringSoon: true };
    if (daysRemaining === 0) return { text: "Expires today", isExpiringSoon: true };
    if (daysRemaining === 1) return { text: "Expires tomorrow", isExpiringSoon: true };
    if (daysRemaining <= 7) return { text: `${daysRemaining} days left`, isExpiringSoon: true };
    return { text: `${daysRemaining} days left`, isExpiringSoon: false };
  } catch {
    return { text: null, isExpiringSoon: false };
  }
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { detail?: string } | undefined)?.detail || fallback;
  }
  return fallback;
};

function noVncViewerUrl(): string {
  if (typeof window === "undefined") return "http://localhost:6080/vnc.html";
  const host = window.location.hostname;
  const port = 6080;
  return `http://${host}:${port}/vnc.html?autoconnect=1&reconnect=1&resize=scale&path=websockify&host=${encodeURIComponent(host)}&port=${port}`;
}

function LoginProgress({
  state,
  message,
  isManual,
}: {
  state: "running" | "awaiting_captcha";
  message?: string;
  isManual?: boolean;
}) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, LOGIN_STEPS.length - 1)), 12000);
    return () => clearInterval(id);
  }, []);

  if (state === "awaiting_captcha" || isManual) {
    return (
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Monitor className="w-4 h-4 text-indigo-300 animate-pulse shrink-0" />
          <p className="text-[13px] text-indigo-100 font-medium">
            {isManual
              ? "Your turn — log in on the server screen"
              : message || "CAPTCHA detected on the server browser"}
          </p>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-200 mb-2">
            {isManual ? "Log in in the browser viewer" : "Solve it in the browser"}
          </p>
          {(isManual
            ? [
                "Click “Open viewer” below — the live server screen opens in a new tab.",
                "Type your Internshala email & password there and click Login (solve the CAPTCHA if asked).",
                "Once you're logged in, sit back — we grab your session and disconnect.",
              ]
            : [
                "Click “Open CAPTCHA viewer” below — it opens the live server screen in a new tab.",
                "Tick the “I’m not a robot” checkbox on the Internshala page.",
                "If needed, click the Login button again, then sit back — we take over.",
              ]
          ).map((txt) => (
            <div key={txt} className="flex items-start gap-2 text-[12px] text-indigo-100/80">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
              <span>{txt}</span>
            </div>
          ))}
        </div>

        <a
          href={noVncViewerUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-white text-black rounded-lg text-[12px] font-bold hover:bg-gray-200 transition"
        >
          <Monitor className="w-3.5 h-3.5" /> {isManual ? "Open viewer" : "Open CAPTCHA viewer"}
        </a>
        <div className="rounded-lg bg-indigo-950/40 border border-indigo-500/25 px-3 py-2 text-[11px] font-mono text-indigo-200 break-all">
          {noVncViewerUrl()}
        </div>

        <p className="flex items-center gap-2 text-[12px] text-indigo-200/70">
          <Loader2 className="w-3 h-3 animate-spin" />
          {isManual ? "Waiting for you to log in… (auto-resumes)" : "Waiting for you to solve the CAPTCHA… (auto-resumes)"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-blue-300 animate-spin shrink-0" />
        <p className="text-[13px] text-blue-200 font-medium">Connecting to Internshala…</p>
      </div>
      <div className="space-y-1.5">
        {LOGIN_STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 text-[12px]">
            {i < step ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : i === step ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-300 animate-spin shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-white/15 shrink-0" />
            )}
            <span className={i <= step ? "text-blue-100" : "text-[#A1A1AA]"}>{label}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-blue-200/70">
        This usually takes 30–60 seconds. We log in from the server, capture your session, then
        delete your credentials immediately — they are never stored.
      </p>
    </div>
  );
}

export default function ConnectPage() {
  const qc = useQueryClient();
  const platform = "internshala";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCookieFallback, setShowCookieFallback] = useState(false);
  const [cookieString, setCookieString] = useState("");
  const [scriptCopied, setScriptCopied] = useState(false);

  const [loginTaskId, setLoginTaskId] = useState<string | null>(null);
  const [loginTaskState, setLoginTaskState] = useState<"running" | "awaiting_captcha">("running");
  const [loginTaskMessage, setLoginTaskMessage] = useState("");
  const [manualDispatch, setManualDispatch] = useState(false);
  const [manualMode, setManualMode] = useState(true);

  const { data: status, isLoading } = useQuery({
    queryKey: ["platform-status"],
    queryFn: () => platformApi.status().then((r) => r.data as PlatformStatusResponse),
  });

  const internshala = (status?.platforms || []).find((p) => p.platform === platform);
  const isConnected = Boolean(internshala);
  const expiryInfo = getSessionExpiryInfo(internshala?.expires_at);

  const resetLoginTask = () => {
    setLoginTaskId(null);
    setLoginTaskState("running");
    setLoginTaskMessage("");
    setManualDispatch(false);
  };

  const loginMut = useMutation({
    mutationFn: () =>
      platformApi.login(platform, {
        email: manualMode ? "" : loginEmail,
        password: manualMode ? "" : loginPassword,
      }),
    onSuccess: (res) => {
      const data = res.data as { task_id?: string };
      if (data?.task_id) {
        setLoginTaskId(data.task_id);
        setLoginTaskState("running");
        setLoginTaskMessage("");
        setManualDispatch(manualMode);
      } else {
        toast.success("Internshala connected — session captured securely");
        if (!manualMode) {
          setLoginEmail("");
          setLoginPassword("");
        }
        setShowCookieFallback(false);
        qc.invalidateQueries({ queryKey: ["platform-status"] });
      }
    },
    onError: (err) =>
      toast.error(
        getErrorMessage(
          err,
          manualMode
            ? "Could not start the manual login. Please try again."
            : "Login failed — double-check your Internshala credentials and try again"
        )
      ),
  });

  const loginInFlight = Boolean(loginTaskId) || loginMut.isPending;

  useEffect(() => {
    if (!loginTaskId) return;
    const id = setInterval(async () => {
      try {
        const { data } = await platformApi.loginStatus(platform, loginTaskId);
        if (data.status === "success") {
          clearInterval(id);
          toast.success("Internshala connected — session captured securely");
          setLoginEmail("");
          setLoginPassword("");
          resetLoginTask();
          setShowCookieFallback(false);
          qc.invalidateQueries({ queryKey: ["platform-status"] });
        } else if (data.status === "failure") {
          clearInterval(id);
          toast.error(data.message || "Login failed");
          resetLoginTask();
        } else if (data.status === "awaiting_captcha") {
          setLoginTaskState("awaiting_captcha");
          setLoginTaskMessage(data.message || "");
        } else {
          setLoginTaskState("running");
        }
      } catch {
        // Transient network error — keep polling.
      }
    }, 2000);
    return () => clearInterval(id);
  }, [loginTaskId, qc]);

  const connectCookiesMut = useMutation({
    mutationFn: () =>
      platformApi.uploadCookies({ platform, cookies: cookieString }),
    onSuccess: () => {
      toast.success("Internshala connected — cookies encrypted");
      setCookieString("");
      setShowCookieFallback(false);
      qc.invalidateQueries({ queryKey: ["platform-status"] });
    },
    onError: (err) => toast.error(getErrorMessage(err, "Failed to connect platform")),
  });

  const disconnectMut = useMutation({
    mutationFn: (p: string) => platformApi.disconnect(p),
    onSuccess: () => {
      toast.success("Internshala disconnected");
      qc.invalidateQueries({ queryKey: ["platform-status"] });
    },
    onError: () => toast.error("Failed to disconnect"),
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMode && (!loginEmail || !loginPassword)) {
      toast.error("Enter your Internshala email and password");
      return;
    }
    loginMut.mutate();
  };

  const handleCookiesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cookieString) return;
    connectCookiesMut.mutate();
  };

  const copyHelperScript = async () => {
    try {
      await navigator.clipboard.writeText(COOKIE_HELPER_SCRIPT);
      setScriptCopied(true);
      window.setTimeout(() => setScriptCopied(false), 2000);
    } catch {
      toast.error("Failed to copy helper script");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#242424] border border-white/[0.08] rounded-lg">
          <Link2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Connect Internshala</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Connect your Internshala account so the bot can find and apply to jobs for you.
          </p>
        </div>
      </div>

      {/* Connection status */}
      <div
        className={`rounded-2xl border p-5 flex items-center justify-between gap-4 ${
          isConnected
            ? internshala?.is_valid
              ? "bg-[#101914] border-emerald-500/25"
              : "bg-[#1d1608] border-amber-500/25"
            : "bg-[#242424] border-white/[0.08]"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#1d1d1d] border border-[#34343a] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white text-[15px] capitalize">Internshala</p>
              {isConnected ? (
                internshala?.is_valid ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    <XCircle className="w-3 h-3" /> Session expired
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-500/15 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                  <Clock className="w-3 h-3" /> Not connected
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#A1A1AA] mt-1">
              {isConnected
                ? expiryInfo?.text
                  ? `Session ${expiryInfo.text.toLowerCase()}`
                  : "Session active — bot enabled"
                : "Connect to enable automated applications"}
            </p>
            {isConnected && (
              <button
                onClick={() => disconnectMut.mutate(platform)}
                disabled={disconnectMut.isPending}
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-[#A1A1AA] hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {disconnectMut.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Disconnect
              </button>
            )}
          </div>
        </div>
        {isConnected && internshala?.is_valid && (
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              {internshala.last_used ? "Last used" : "Validated"}
            </p>
            <p className="text-[12px] text-white mt-1">
              {internshala.last_used
                ? new Date(internshala.last_used).toLocaleDateString()
                : internshala.last_validated
                  ? new Date(internshala.last_validated).toLocaleDateString()
                  : "—"}
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Direct Login (primary) */}
        <div className="md:col-span-3 bg-[#242424] border border-white/[0.08] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] p-6 h-fit">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.2em] text-gray-400">
              Sign in to Internshala
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.15em] text-[#A1A1AA]">
              Direct
            </span>
          </div>
          <p className="text-[12px] text-[#A1A1AA] mb-5">
            Log in with the email and password you use on internshala.com. We capture the session
            securely and never store your password.
          </p>

          {isLoading ? (
            <div className="space-y-3">
              <div className="h-12 bg-[#1d1d1d] border border-white/[0.06] animate-pulse rounded-lg" />
              <div className="h-12 bg-[#1d1d1d] border border-white/[0.06] animate-pulse rounded-lg" />
            </div>
          ) : isConnected && internshala?.is_valid ? (
            <div className="p-4 bg-[#101914] border border-emerald-500/25 rounded-xl text-center space-y-2">
              <CheckCircle className="w-7 h-7 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-white">Internshala is connected</p>
              <p className="text-[12px] text-[#A1A1AA]">
                Your session is active. Disconnect above to log in with a different account.
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-1 bg-[#1d1d1d] border border-[#34343a] rounded-lg p-1 text-[12px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setManualMode(true)}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      manualMode ? "bg-white text-black" : "text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    I&apos;ll log in myself
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualMode(false)}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      !manualMode ? "bg-white text-black" : "text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    Auto-fill for me
                  </button>
                </div>

                {manualMode ? (
                  <div className="p-3 bg-[#232327] border border-[#34343a] rounded-lg text-[12px] text-[#A1A1AA]">
                    We open the Internshala login page on a live server screen. You type your
                    email &amp; password there (solving any CAPTCHA), and we capture the session
                    the moment you&apos;re logged in. Nothing is typed or stored by the bot.
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
                        Internshala email
                      </label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        disabled={loginInFlight}
                        autoComplete="username"
                        className="w-full bg-[#1d1d1d] border border-[#34343a] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-[#A1A1AA] focus:border-white/30 transition-all outline-none disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          disabled={loginInFlight}
                          autoComplete="current-password"
                          className="w-full bg-[#1d1d1d] border border-[#34343a] rounded-lg px-3 py-2.5 pr-10 text-[13px] text-white placeholder-[#A1A1AA] focus:border-white/30 transition-all outline-none disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loginInFlight}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white transition-colors disabled:opacity-50"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={(manualMode ? false : !loginEmail || !loginPassword) || loginInFlight}
                  className="w-full py-3 bg-white text-black rounded-lg text-[13px] font-bold hover:bg-gray-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loginInFlight ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      {manualMode ? "Open viewer & connect" : "Connect Internshala"}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 p-3 bg-[#232327] border border-[#34343a] rounded-lg flex gap-3 text-[11px] text-[#A1A1AA]">
                <Shield className="w-4 h-4 shrink-0 mt-0.5 text-white" />
                <p>
                  {manualMode
                    ? "Nothing is typed by the bot — you log in yourself on the server screen. The captured session is encrypted and your login is never stored."
                    : "We log in from the server using a secure browser. Your password is used once, deleted after the session is captured, and never stored."}
                </p>
              </div>

              {loginInFlight && (
                <div className="mt-4">
                  <LoginProgress
                    state={loginTaskState}
                    message={loginTaskMessage}
                    isManual={manualDispatch}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* How it works / fallback */}
        <div className="md:col-span-2 space-y-6 h-fit">
          <div className="bg-[#242424] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">
              How it works
            </h2>
            <div className="space-y-4 text-[12px] text-[#A1A1AA] leading-5">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <p>Enter your Internshala login — this happens once.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <p>We sign in from the server and capture your session (cookie) securely.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <p>The bot uses that session to apply to jobs and read your messages for you.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#242424] border border-white/[0.08] rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowCookieFallback(!showCookieFallback)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-[#A1A1AA]" />
                <span>
                  <span className="block text-[13px] font-semibold text-white">
                    Already signed in on your browser?
                  </span>
                  <span className="block text-[11px] text-[#A1A1AA] mt-0.5">
                    Use the cookie method instead
                  </span>
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#A1A1AA] transition-transform ${
                  showCookieFallback ? "rotate-180" : ""
                }`}
              />
            </button>

            {showCookieFallback && (
              <form onSubmit={handleCookiesSubmit} className="px-5 pb-5 space-y-3 border-t border-white/[0.06] pt-4">
                <div className="rounded-lg border border-white/10 bg-[#17171a] p-3">
                  <p className="text-[11px] text-[#A1A1AA] mb-2">
                    Log in on internshala.com, open the browser console (F12 → Console), paste this,
                    and press Enter — then paste the output below.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[10px] leading-4 text-indigo-100 break-all bg-black/40 border border-white/10 rounded-md px-2 py-1.5">
                      {COOKIE_HELPER_SCRIPT}
                    </code>
                    <button
                      type="button"
                      onClick={copyHelperScript}
                      className="shrink-0 rounded-md border border-white/10 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-black hover:bg-gray-200 transition"
                    >
                      {scriptCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <textarea
                  value={cookieString}
                  onChange={(e) => setCookieString(e.target.value)}
                  placeholder="Paste your document.cookie string or JSON cookie array here…"
                  rows={4}
                  className="w-full bg-[#1d1d1d] border border-[#34343a] rounded-lg px-3 py-2.5 text-[12px] font-mono text-white placeholder-[#A1A1AA] resize-none focus:border-white/30 transition-all outline-none"
                />
                <button
                  type="submit"
                  disabled={!cookieString || connectCookiesMut.isPending}
                  className="w-full py-2.5 bg-white/10 border border-white/15 text-white rounded-lg text-[12px] font-bold hover:bg-white/15 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {connectCookiesMut.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5" />
                  )}
                  Connect with Cookies
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}