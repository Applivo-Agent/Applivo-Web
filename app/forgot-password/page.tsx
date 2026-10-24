"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      await authApi.forgotPassword(email.trim());
      setSubmitted(true);
      toast.success("Reset link sent if the email exists in our records.");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "An error occurred. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <p>
      Remember your password?{" "}
      <Link
        href="/login"
        className="text-white hover:underline font-medium transition-colors"
      >
        Log in
      </Link>
    </p>
  );

  return (
    <AuthLayout
      heading={submitted ? "Check your email" : "Reset password"}
      supportingText={
        submitted
          ? `If an account exists for ${email}, a password recovery link has been sent.`
          : "Enter your email address to receive password recovery instructions."
      }
      footer={footer}
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className="w-full h-11 px-4 rounded-xl bg-[var(--sx-bg-19191b)] border border-[var(--sx-bd-2b2b2b)] focus:border-white/30 text-[14px] text-[var(--sx-tx-f5f5f5)] placeholder:text-[var(--sx-tx-71717a)] outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[var(--sx-bg-f5f5f5)] hover:bg-white text-[var(--sx-tx-080808)] text-[14px] font-semibold transition-all active:scale-[0.99] disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Send reset instructions"
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto text-zinc-200">
            <MailCheck className="w-6 h-6 text-white" />
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[var(--sx-bg-18181b)] hover:bg-[var(--sx-bg-202024)] border border-[var(--sx-bd-2b2b2b)] text-[var(--sx-tx-f5f5f5)] text-[13.5px] font-medium transition-colors"
            >
              Didn&apos;t get an email? Try again
            </button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 text-[12.5px] text-[var(--sx-tx-a1a1aa)] hover:text-[var(--sx-tx-f5f5f5)] pt-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to login
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
