"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLumi } from "@/lib/lumi-context";

function TypingIndicator() {
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

export default function ChatPage() {
  const {
    messages,
    input,
    setInput,
    isTyping,
    sendMessage,
  } = useLumi();

  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea smoothly up to 120px max height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, 42), 120)}px`;
    }
  }, [input]);

  const didInitialScroll = useRef(false);
  useEffect(() => {
    if (messages.length === 0) return;
    // First render with history: jump straight to the latest message; afterwards scroll smoothly.
    if (!didInitialScroll.current) {
      didInitialScroll.current = true;
      const jump = () => endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      jump();
      const t = setTimeout(jump, 120);   // again once images/markdown have laid out
      return () => clearTimeout(t);
    }
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage();
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full relative h-full">
      {/* Messages History - independently scrolling container */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-3 px-1 space-y-3 w-full">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "flex gap-2.5 max-w-[88%] sm:max-w-[75%]",
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 overflow-hidden",
                  m.role === "user"
                    ? "bg-white text-black border border-white"
                    : "bg-transparent"
                )}
              >
                {m.role === "user" ? (
                  <UserIcon className="w-3.5 h-3.5" />
                ) : (
                  <Image src="/lumi-logo.png" alt="Lumi" width={22} height={22} className="w-5 h-5 object-contain" />
                )}
              </div>
              <div
                className={cn(
                  "px-3.5 py-2.5 rounded-lg text-[13px] sm:text-[14px] leading-[1.5] whitespace-pre-wrap break-words border",
                  m.role === "user"
                    ? "bg-[var(--app-nested)] text-white border-[var(--app-border-strong)]"
                    : "bg-[var(--app-card)] text-zinc-300 border-[var(--app-border-strong)]"
                )}
              >
                {m.content === "..." ? <TypingIndicator /> : m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input Composer */}
      <div className="shrink-0 pt-2 pb-0 border-t border-[var(--app-border-strong)] bg-[var(--app-bg)] w-full">
        <form onSubmit={handleSubmit} className="relative w-full">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about interviewing, resume tailoring, or job matching..."
            className="w-full bg-[var(--app-card)] border border-[var(--app-border-strong)] rounded-lg pl-3.5 pr-10 py-2.5 text-[13px] sm:text-[14px] text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none min-h-[42px] max-h-[120px] transition-colors leading-[1.4]"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bottom-2.5 h-7 w-7 flex items-center justify-center bg-white text-black rounded-md hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            {isTyping ? (
              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-black" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
