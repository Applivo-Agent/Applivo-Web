"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Maximize2,
  RotateCcw,
  Send,
  User as UserIcon,
  ArrowRight,
  ArrowUp,
  Sparkles,
} from "lucide-react";
import { useLumi } from "@/lib/lumi-context";
import { cn } from "@/lib/utils";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-zinc-300 rounded-full"
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

const STARTER_PROMPTS = [
  "Tailor my resume for a Software Engineer role",
  "Find top job openings that match my profile",
  "Help me prepare for technical and behavioral interviews",
  "Analyze my profile and point out missing skills",
];

export function LumiPanel() {
  const router = useRouter();
  const {
    isOpen,
    closePanel,
    messages,
    input,
    setInput,
    isTyping,
    sendMessage,
    newChat,
    credits,
  } = useLumi();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-resize composer textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        Math.max(textareaRef.current.scrollHeight, 38),
        100
      )}px`;
    }
  }, [input]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Auto-scroll logic: only scroll if user was near bottom
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShouldAutoScroll(isNearBottom);
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isTyping, shouldAutoScroll]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;
    setShouldAutoScroll(true);
    sendMessage();
  };

  const handlePromptClick = (promptText: string) => {
    setShouldAutoScroll(true);
    sendMessage(promptText);
  };

  // Quota footer text
  const getQuotaText = () => {
    if (!credits) return "Limit: 150 messages/day · Resets 12:00 AM UTC";
    if (credits.is_unlimited) {
      return "Unlimited assistant queries · Active plan";
    }
    return `Limit: ${credits.remaining} messages remaining · Resets 12:00 AM UTC`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile/Tablet backdrop (< 1024px) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            aria-hidden="true"
          />

          {/* Docked Right Side Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-[var(--app-header-h)] right-0 bottom-0 z-40 w-full sm:w-[420px] lg:w-[420px] max-w-full bg-[var(--app-card)] border-l border-[var(--app-border-strong)] flex flex-col shadow-[-12px_0_40px_rgba(0,0,0,0.5)]"
            aria-label="Lumi Assistant"
          >
            {/* Header */}
            <div className="h-12 border-b border-[var(--app-border-strong)] px-3.5 flex items-center justify-between shrink-0 bg-[var(--app-card)]">
              {/* Left: Lumi unboxed logo & title */}
              <div className="flex items-center gap-2">
                <Image
                  src="/lumi-logo.png"
                  alt="Lumi"
                  width={22}
                  height={22}
                  className="w-5 h-5 object-contain shrink-0"
                  priority
                />
                <span className="text-[14px] sm:text-[15px] font-semibold text-white tracking-tight">
                  Lumi
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={newChat}
                  title="New chat"
                  aria-label="Start new conversation"
                  className="h-7 w-7 rounded-md hover:bg-[var(--app-nested)] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closePanel();
                    router.push("/chat");
                  }}
                  title="Open full chat"
                  aria-label="Expand to full chat page"
                  className="h-7 w-7 rounded-md hover:bg-[var(--app-nested)] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={closePanel}
                  title="Close panel"
                  aria-label="Close assistant panel"
                  className="h-7 w-7 rounded-md hover:bg-[var(--app-nested)] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages history area */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 w-full"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2.5",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {m.role === "assistant" && (
                    <Image
                      src="/lumi-logo.png"
                      alt="Lumi"
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain shrink-0 mt-0.5"
                    />
                  )}

                  <div
                    className={cn(
                      "rounded-lg px-3.5 py-2 text-[12.5px] leading-relaxed whitespace-pre-wrap break-words border",
                      m.role === "user"
                        ? "bg-[var(--app-nested)] text-white border-[var(--app-border-strong)] max-w-[85%]"
                        : "bg-[var(--app-nested)]/50 text-zinc-200 border-[var(--app-border-strong)]/80 max-w-[90%]"
                    )}
                  >
                    {m.content === "..." ? <TypingDots /> : m.content}
                  </div>

                  {m.role === "user" && (
                    <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}

              {/* Starter prompts shown when user hasn't sent messages yet */}
              {messages.length <= 1 && (
                <div className="pt-2 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-1">
                    Suggested Prompts
                  </p>
                  <div className="space-y-1.5">
                    {STARTER_PROMPTS.map((promptText) => (
                      <button
                        key={promptText}
                        onClick={() => handlePromptClick(promptText)}
                        type="button"
                        className="w-full text-left p-2.5 rounded-lg border border-[var(--app-border-strong)] bg-[var(--app-nested)] hover:bg-white/[0.04] text-[12px] text-zinc-300 hover:text-white transition-colors flex items-center justify-between group"
                      >
                        <span className="truncate pr-2">{promptText}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="shrink-0 p-3 border-t border-[var(--app-border-strong)] bg-[var(--app-card)] space-y-2">
              <form onSubmit={handleSubmit} className="relative w-full">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Ask Lumi about jobs, resumes, or your career…"
                  rows={1}
                  className="w-full bg-[var(--app-nested)] border border-[var(--app-border-strong)] rounded-lg pl-3 pr-10 py-2 text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none min-h-[38px] max-h-[100px] transition-colors leading-[1.4]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 bottom-2 h-7 w-7 flex items-center justify-center bg-white text-black rounded-md hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                >
                  {isTyping ? (
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4 text-black" />
                  )}
                </button>
              </form>

              {/* Status / Quota line (Runpod-inspired) */}
              <p className="text-[11px] text-zinc-400 text-center font-mono">
                {getQuotaText()}
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
