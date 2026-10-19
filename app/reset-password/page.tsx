"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    setToken(tokenParam);
    if (!tokenParam) {
      toast.error("Invalid or missing reset token. Please request a new recovery link.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!token) {
      toast.error("Missing reset token. Please request a new link.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, new_password: password });
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(
        typeof detail === "string"
          ? detail
          : "Failed to reset password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <Link
      href="/login"
      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Back to login
    </Link>
  );

  return (
    <AuthLayout
      heading={success ? "Password updated" : "Set new password"}
      supportingText={
        success
          ? "Your password has been changed. Redirecting to sign in..."
          : "Choose a strong password with at least 8 characters."
      }
      footer={footer}
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* New Password */}
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (min. 8 characters)"
              className="w-full h-11 px-4 pr-11 rounded-xl bg-[#19191b] border border-[#2b2b2b] focus:border-white/30 text-[14px] text-[#f5f5f5] placeholder:text-[#71717a] focus:outline-none transition-colors"
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

          {/* Confirm Password */}
          <div>
            <input
              type={showPass ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full h-11 px-4 rounded-xl bg-[#19191b] border border-[#2b2b2b] focus:border-white/30 text-[14px] text-[#f5f5f5] placeholder:text-[#71717a] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#f5f5f5] hover:bg-white text-[#080808] text-[14px] font-semibold transition-all active:scale-[0.99] disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Update password"
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-xs text-zinc-400">
            You will be redirected to the login page shortly.
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
