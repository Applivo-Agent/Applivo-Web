"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/NavBar";
import { contactApi, ContactPayload } from "@/lib/api";
import {
  Headphones,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { siInstagram, siX } from "simple-icons";
import { Footer } from "@/components/Footer";

/* ─── SVG BRAND ICONS ─────────────────────────────────────── */
function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={siX.path} />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={siInstagram.path} />
    </svg>
  );
}

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

/* ─── VERIFIED OFFICIAL SOCIAL CHANNELS ────────────────────── */
const OFFICIAL_CHANNELS = [
  {
    name: "X",
    handle: "x.com/applivo_in",
    href: "https://x.com/applivo_in",
    tooltip: "Follow @applivo_in on X",
    icon: XIcon,
  },
  {
    name: "Instagram",
    handle: "instagram.com/applivo.in",
    href: "https://www.instagram.com/applivo.in/",
    tooltip: "Follow @applivo.in on Instagram",
    icon: InstagramIcon,
  },
  {
    name: "LinkedIn",
    handle: "linkedin.com/company/applivo-agent",
    href: "https://www.linkedin.com/company/applivo-agent/",
    tooltip: "Connect with Applivo on LinkedIn",
    icon: LinkedInIcon,
  },
];

/* ─── MAIN CONTACT PAGE COMPONENT ─────────────────────────── */
export default function ContactPage() {
  const [formData, setFormData] = useState<ContactPayload>({
    first_name: "",
    last_name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // Honeypot field
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState<string>("");

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }
    if (!formData.message.trim()) {
      errors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters long";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmissionStatus("submitting");
    setServerMessage("");

    try {
      const res = await contactApi.submit({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        website: formData.website || undefined,
      });

      if (res.data?.ok) {
        setSubmissionStatus("success");
        setServerMessage(res.data.message || "Thank you! Your message has been received.");
      } else {
        throw new Error(res.data?.message || "Failed to submit message");
      }
    } catch (err: unknown) {
      setSubmissionStatus("error");
      const axiosErr = err as { response?: { data?: { detail?: string }; status?: number } };
      if (axiosErr.response?.status === 429) {
        setServerMessage("Too many submissions. Please wait a few minutes before trying again.");
      } else if (axiosErr.response?.data?.detail) {
        setServerMessage(axiosErr.response.data.detail);
      } else {
        setServerMessage(
          "We could not deliver your message right now. Please try again or reach out on our social channels."
        );
      }
    }
  };

  const handleResetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      subject: "",
      message: "",
      website: "",
    });
    setFormErrors({});
    setSubmissionStatus("idle");
    setServerMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between selection:bg-white/20">
      <NavBar />

      {/* Main Content Area */}
      <main className="relative flex-1 pt-20 sm:pt-24 md:pt-28 pb-12 px-4 sm:px-6 overflow-hidden">
        {/* Subtle ambient lighting texture consistent with landing page */}
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_45%)] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(10,10,10,0.85))] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-[480px] mx-auto w-full">
          {/* Header Introduction */}
          <div className="text-center">
            {/* Announcement Badge matching visual reference */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
              <Headphones className="h-3 w-3 text-zinc-400" />
              <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-zinc-300">
                Applivo Support
              </span>
            </div>

            {/* Prominent Heading */}
            <h1 className="mt-4 text-2xl sm:text-3xl md:text-[36px] font-bold tracking-tight text-white flex items-center justify-center">
              Let&apos;s Have a Chat
            </h1>

            {/* Muted Supporting Text */}
            <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Questions about Applivo, your account, integrations, or applications?
              Send us a message and we&apos;ll get back to you.
            </p>
          </div>

          {/* Form / Success State */}
          <div className="mt-6 sm:mt-7">
            {submissionStatus === "success" ? (
              <div
                role="status"
                className="rounded-2xl border border-white/[0.06] bg-[#111111]/80 p-6 sm:p-8 text-center shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-white tracking-tight">
                  Message Sent
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  {serverMessage ||
                    "Thank you for contacting us! Your message has been saved and our team has been notified. We will get back to you shortly."}
                </p>
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/[0.1] hover:text-white transition-all"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Send another message</span>
                  </button>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-transparent bg-transparent px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
                  >
                    <span>Return to home</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl border border-white/[0.06] bg-[#111111]/80 p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
              >
                {/* Honeypot field (hidden from screen, detected for bots) */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Server Error Alert Banner */}
                {submissionStatus === "error" && (
                  <div
                    role="alert"
                    className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-200">Unable to send message</p>
                      <p className="mt-0.5 text-red-300/90 leading-relaxed">{serverMessage}</p>
                    </div>
                  </div>
                )}

                {/* Row 1: First name & Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-[11px] font-medium text-zinc-300 mb-1"
                    >
                      First name <span className="text-zinc-500">*</span>
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      placeholder="Your first name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={submissionStatus === "submitting"}
                      aria-invalid={Boolean(formErrors.first_name)}
                      aria-describedby={formErrors.first_name ? "first_name-error" : undefined}
                      className={`w-full rounded-xl border bg-[#141415]/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition-all focus:outline-none focus:ring-1 ${
                        formErrors.first_name
                          ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                          : "border-white/[0.08] focus:border-white/30 focus:ring-white/20"
                      }`}
                    />
                    {formErrors.first_name && (
                      <p id="first_name-error" className="mt-1 text-[11px] text-red-400">
                        {formErrors.first_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-[11px] font-medium text-zinc-300 mb-1"
                    >
                      Last name <span className="text-zinc-500">*</span>
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="Your last name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={submissionStatus === "submitting"}
                      aria-invalid={Boolean(formErrors.last_name)}
                      aria-describedby={formErrors.last_name ? "last_name-error" : undefined}
                      className={`w-full rounded-xl border bg-[#141415]/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition-all focus:outline-none focus:ring-1 ${
                        formErrors.last_name
                          ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                          : "border-white/[0.08] focus:border-white/30 focus:ring-white/20"
                      }`}
                    />
                    {formErrors.last_name && (
                      <p id="last_name-error" className="mt-1 text-[11px] text-red-400">
                        {formErrors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Email & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 mt-3 sm:mt-3.5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[11px] font-medium text-zinc-300 mb-1"
                    >
                      Email address <span className="text-zinc-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={submissionStatus === "submitting"}
                      aria-invalid={Boolean(formErrors.email)}
                      aria-describedby={formErrors.email ? "email-error" : undefined}
                      className={`w-full rounded-xl border bg-[#141415]/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition-all focus:outline-none focus:ring-1 ${
                        formErrors.email
                          ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                          : "border-white/[0.08] focus:border-white/30 focus:ring-white/20"
                      }`}
                    />
                    {formErrors.email && (
                      <p id="email-error" className="mt-1 text-[11px] text-red-400">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-[11px] font-medium text-zinc-300 mb-1"
                    >
                      Subject <span className="text-zinc-500">*</span>
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                      disabled={submissionStatus === "submitting"}
                      aria-invalid={Boolean(formErrors.subject)}
                      aria-describedby={formErrors.subject ? "subject-error" : undefined}
                      className={`w-full rounded-xl border bg-[#141415]/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition-all focus:outline-none focus:ring-1 ${
                        formErrors.subject
                          ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                          : "border-white/[0.08] focus:border-white/30 focus:ring-white/20"
                      }`}
                    />
                    {formErrors.subject && (
                      <p id="subject-error" className="mt-1 text-[11px] text-red-400">
                        {formErrors.subject}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 3: Message */}
                <div className="mt-3 sm:mt-3.5">
                  <label
                    htmlFor="message"
                    className="block text-[11px] font-medium text-zinc-300 mb-1"
                  >
                    Message <span className="text-zinc-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    onChange={handleChange}
                    disabled={submissionStatus === "submitting"}
                    aria-invalid={Boolean(formErrors.message)}
                    aria-describedby={formErrors.message ? "message-error" : undefined}
                    className={`w-full rounded-xl border bg-[#141415]/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition-all resize-y min-h-[96px] focus:outline-none focus:ring-1 ${
                      formErrors.message
                        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                        : "border-white/[0.08] focus:border-white/30 focus:ring-white/20"
                    }`}
                  />
                  {formErrors.message && (
                    <p id="message-error" className="mt-1 text-[11px] text-red-400">
                      {formErrors.message}
                    </p>
                  )}
                </div>

                {/* Submit button matching visual reference */}
                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    disabled={submissionStatus === "submitting"}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.99] text-white font-medium py-3 px-5 text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  >
                    {submissionStatus === "submitting" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-300" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <span>Send message</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Social Links & Subtle Divider matching reference 1 */}
          <div className="mt-8 sm:mt-10">
            <div className="relative flex items-center justify-center">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center bg-[#0a0a0a] px-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                  Connect With Us
                </span>
              </div>
            </div>

            {/* Clickable Social Icons (X, Instagram, LinkedIn) */}
            <div className="mt-5 flex items-center justify-center gap-4 sm:gap-5">
              {OFFICIAL_CHANNELS.map((channel) => {
                const IconComponent = channel.icon;
                return (
                  <a
                    key={channel.name}
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={channel.tooltip}
                    title={channel.tooltip}
                    className="group flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08] active:scale-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                  >
                    <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Shared Four-Column Footer */}
      <Footer className="border-t border-white/10" />
    </div>
  );
}
