"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn, getErrorMessage } from "@/lib/utils";
import { nextQuery, safeNext } from "@/lib/safe-redirect";
import {
  AuthLayout,
  SocialButtons,
  AuthDivider,
} from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  const { register, verifyRegisterOtp, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    referral_code: "",
    full_name: "",
    password: "",
    confirm_password: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"initial" | "details" | "verify">("initial");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [planFromUrl, setPlanFromUrl] = useState<string | null>(null);
  const [intervalFromUrl, setIntervalFromUrl] = useState<string>("monthly");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get("next");
    if (nextParam) {
      setNextUrl(safeNext(nextParam));
    }
    const plan = params.get("plan");
    if (plan) {
      setPlanFromUrl(plan);
    }
    const interval = params.get("interval");
    if (interval) {
      setIntervalFromUrl(interval);
    }
  }, []);

  /* ── STEP 1: INITIAL EMAIL & REFERRAL VALIDATION ── */
  const handleInitialNext = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = form.email.trim();
    if (!emailTrimmed || !/^\S+@\S+\.\S+$/.test(emailTrimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setStep("details");
  };

  /* ── STEP 2: DETAILS & REGISTRATION INITIATE ── */
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!form.full_name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(form.email.trim(), form.password, form.full_name.trim());
      toast.success("Account initiated! Please check your email for the verification code.");
      setStep("verify");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 3: OTP VERIFY & COMPLETE ── */
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || otp.length < 6) return;
    setLoading(true);

    try {
      await verifyRegisterOtp(form.email.trim(), otp, {
        password: form.password,
        full_name: form.full_name.trim(),
      });
      toast.success("Account verified! Let's get started.");

      if (nextUrl) {
        router.push(nextUrl);
        return;
      }

      const onboardingUrl = planFromUrl
        ? `/onboarding?plan=${planFromUrl}&interval=${intervalFromUrl}`
        : "/onboarding";
      router.push(onboardingUrl);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Invalid or expired verification code"));
    } finally {
      setLoading(false);
    }
  };

  /* ── GOOGLE AUTH ── */
  const handleGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error(
        "Google Sign-In is not configured yet. Required environment variable: NEXT_PUBLIC_GOOGLE_CLIENT_ID"
      );
      return;
    }

    if (!window.google?.accounts?.id) {
      toast.error("Google authentication service is loading. Please try again in a moment.");
      return;
    }

    try {
      setGoogleLoading(true);
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (response?.credential) {
            try {
              await loginWithGoogle(response.credential);
              toast.success("Welcome to Applivo!");
              router.push(nextUrl || "/onboarding");
            } catch (err: any) {
              toast.error(getErrorMessage(err, "Google registration failed"));
            } finally {
              setGoogleLoading(false);
            }
          } else {
            setGoogleLoading(false);
          }
        },
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
        }
      });
    } catch {
      setGoogleLoading(false);
      toast.error("Could not initialize Google authentication.");
    }
  };

  /* ── APPLE AUTH ── */
  const handleAppleClick = () => {
    const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    if (!appleClientId) {
      toast.error(
        "Apple Sign-In is not configured yet. Required setup: Apple Developer Service ID, APPLE_CLIENT_ID, and backend credentials."
      );
      return;
    }

    setAppleLoading(true);
    toast.info("Connecting to Apple authentication...");
    setTimeout(() => {
      setAppleLoading(false);
    }, 1500);
  };

  const footer = (
    <p>
      Already have an account?{" "}
      <Link
        href={"/login" + nextQuery(nextUrl)}
        className="text-[#f5f5f5] hover:underline font-medium transition-colors"
      >
        Log in
      </Link>
    </p>
  );

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
      />

      <AuthLayout
        heading={
          step === "initial"
            ? "Create account"
            : step === "details"
            ? "Complete account"
            : "Verify your email"
        }
        supportingText={
          step === "initial"
            ? "Automate your job search and accelerate your career discovery."
            : step === "details"
            ? "Enter your name and password to finalize your account."
            : `Enter the 6-digit code sent to ${form.email}`
        }
        footer={step !== "verify" ? footer : null}
      >
        {/* ── STAGE 1: INITIAL EMAIL-FIRST SCREEN (Exact reference match) ── */}
        {step === "initial" && (
          <form onSubmit={handleInitialNext} className="space-y-3.5">
            {/* Email address */}
            <div>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                autoComplete="email"
                className="w-full h-10 px-4 rounded-xl bg-[#19191b] border border-[#2b2b2b] focus:border-white/30 text-[14px] text-[#f5f5f5] placeholder:text-[#71717a] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-colors"
              />
            </div>

            {/* Referral Code (optional) */}
            <div>
              <input
                type="text"
                value={form.referral_code}
                onChange={(e) =>
                  setForm({ ...form, referral_code: e.target.value })
                }
                placeholder="Referral Code (optional)"
                autoComplete="off"
                className="w-full h-10 px-4 rounded-xl bg-[#19191b] border border-[#2b2b2b] focus:border-white/30 text-[14px] text-[#f5f5f5] placeholder:text-[#71717a] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-colors"
              />
            </div>

            {/* Terms checkbox */}
            <div className="pt-0.5">
              <label className="flex items-start gap-2.5 cursor-pointer text-[12.5px] text-[#a1a1aa] leading-normal select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-[#2b2b2b] bg-[#19191b] text-white focus:ring-0 focus:ring-offset-0 cursor-pointer accent-white shrink-0"
                />
                <span>
                  By clicking &quot;Next&quot;, I agree to the{" "}
                  <Link
                    href="/docs/terms-of-use"
                    target="_blank"
                    className="text-[#f5f5f5] hover:underline font-medium"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/docs/privacy-policy"
                    target="_blank"
                    className="text-[#f5f5f5] hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Primary Action Button: "Next" */}
            <button
              type="submit"
              className="w-full h-10 flex items-center justify-center rounded-xl bg-white hover:bg-[#ededed] text-[#0a0a0a] text-[14px] font-semibold transition-all active:scale-[0.99] shadow-sm"
            >
              Next
            </button>

            {/* Unobtrusive Social Sign-in Divider */}
            <AuthDivider text="or sign up with" />

            {/* Social Buttons */}
            <SocialButtons
              onAppleClick={handleAppleClick}
              onGoogleClick={handleGoogleClick}
              googleLoading={googleLoading}
              appleLoading={appleLoading}
              compact
            />
          </form>
        )}

        {/* ── STAGE 2: ACCOUNT DETAILS (Name & Password) ── */}
        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="space-y-3.5">
            <div>
              <input
                type="text"
                required
                autoFocus
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                placeholder="Full name"
                autoComplete="name"
                className="w-full h-10 px-4 rounded-xl bg-[#19191b] border border-[#2b2b2b] focus:border-white/30 text-[14px] text-[#f5f5f5] placeholder:text-[#71717a] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-colors"
              />
            </div>

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Password (min. 8 characters)"
                autoComplete="new-password"
                className="w-full h-10 px-4 pr-11 rounded-xl bg-[#19191b] border border-[#2b2b2b] focus:border-white/30 text-[14px] text-[#f5f5f5] placeholder:text-[#71717a] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#f5f5f5] transition-colors"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div>
              <input
                type={showPass ? "text" : "password"}
                required
                value={form.confirm_password}
                onChange={(e) =>
                  setForm({ ...form, confirm_password: e.target.value })
                }
                placeholder="Confirm password"
                autoComplete="new-password"
                className="w-full h-10 px-4 rounded-xl bg-[#19191b] border border-[#2b2b2b] focus:border-white/30 text-[14px] text-[#f5f5f5] placeholder:text-[#71717a] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-[#ededed] text-[#0a0a0a] text-[14px] font-semibold transition-all active:scale-[0.99] disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create account"
              )}
            </button>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setStep("initial")}
                className="inline-flex items-center gap-1.5 text-[12.5px] text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to email
              </button>
            </div>
          </form>
        )}

        {/* ── STAGE 3: OTP VERIFICATION (Backend contract) ── */}
        {step === "verify" && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                autoFocus
                required
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="w-full h-11 px-3.5 rounded-xl bg-[#19191b] border border-[#2b2b2b] text-center text-xl font-mono tracking-[0.35em] text-[#f5f5f5] focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-[#ededed] text-[#0a0a0a] text-[14px] font-semibold transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Verify & Complete"
              )}
            </button>

            <div className="pt-1 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="inline-flex items-center gap-1.5 text-[12.5px] text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </div>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
