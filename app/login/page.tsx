"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { nextQuery, safeNext } from "@/lib/safe-redirect";
import { getErrorMessage } from "@/lib/utils";
import {
  AuthLayout,
  SocialButtons,
  AuthDivider,
} from "@/components/auth/AuthLayout";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const { login, verifyLoginOtp, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"login" | "verify">("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get("next");
    if (nextParam) {
      setNextUrl(safeNext(nextParam));
    }
    const savedEmail = localStorage.getItem("applivo_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem("applivo_remember_email", email);
      } else {
        localStorage.removeItem("applivo_remember_email");
      }

      await login(email.trim(), password);
      toast.success("Security check: please check your email for the verification code.");
      setStep("verify");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Authentication failed. Check your email and password."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || otp.length < 6) return;
    setLoading(true);

    try {
      await verifyLoginOtp(email.trim(), otp);
      toast.success("Welcome back!");
      router.push(nextUrl || "/dashboard");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Invalid or expired verification code"));
    } finally {
      setLoading(false);
    }
  };

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
              toast.success("Welcome back to Applivo!");
              router.push(nextUrl || "/dashboard");
            } catch (err: any) {
              toast.error(getErrorMessage(err, "Google sign-in failed. Please try again."));
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

  const footer =
    step === "login" ? (
      <p>
        Don&apos;t have an account?{" "}
        <Link
          href={"/register" + nextQuery(nextUrl)}
          className="text-white hover:underline font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    ) : null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
      />

      <AuthLayout
        heading={step === "login" ? "Welcome back" : "Verification code"}
        supportingText={
          step === "login"
            ? "Please enter your details."
            : `Enter the 6-digit code sent to ${email}`
        }
        footer={footer}
      >
        {step === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full h-10 px-4 rounded-xl bg-[#19191b] border border-[#2b2b2b] focus:border-white/30 text-[14px] text-[#f5f5f5] placeholder:text-[#71717a] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-colors"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-[13px] pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-[#a1a1aa] hover:text-[#f5f5f5] select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#2b2b2b] bg-[#19191b] text-white focus:ring-0 focus:ring-offset-0 cursor-pointer accent-white"
                />
                <span>Remember for 30 days</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-[#ededed] text-[#0a0a0a] text-[14px] font-semibold transition-all active:scale-[0.99] disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Login"
              )}
            </button>

            {/* Subtle Divider */}
            <AuthDivider text="OR SIGN IN WITH" />

            {/* Social Buttons (Google & Apple side-by-side) */}
            <SocialButtons
              onAppleClick={handleAppleClick}
              onGoogleClick={handleGoogleClick}
              googleLoading={googleLoading}
              appleLoading={appleLoading}
            />
          </form>
        ) : (
          /* Verification Form */
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
              className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-[#f5f5f5] hover:bg-white text-[#080808] text-[14px] font-semibold transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Verify & Sign in"
              )}
            </button>

            <div className="pt-1 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setStep("login")}
                className="inline-flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#f5f5f5] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </button>
            </div>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
