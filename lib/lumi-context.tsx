"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";
import { toast } from "sonner";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isError?: boolean;
}

export interface ChatCredits {
  allowed: boolean;
  is_unlimited: boolean;
  remaining: number;
  limit: number;
  reason?: string;
}

interface LumiContextType {
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  messages: Message[];
  input: string;
  setInput: (text: string) => void;
  isTyping: boolean;
  sendMessage: (text?: string) => Promise<void>;
  newChat: () => Promise<void>;
  credits: ChatCredits | null;
  creditsLoading: boolean;
  error: string | null;
}

const DEFAULT_GREETING: Message = {
  role: "assistant",
  content:
    "Hi! I'm Lumi, your personal career assistant. I can help with resume tailoring, finding matching jobs, interview preparation, and application tracking. What's on your mind?",
  timestamp: new Date(),
};

const LumiContext = createContext<LumiContextType | null>(null);

export function useLumi() {
  const ctx = useContext(LumiContext);
  if (!ctx) {
    throw new Error("useLumi must be used within a LumiProvider");
  }
  return ctx;
}

export function LumiProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([DEFAULT_GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const openPanel = useCallback(() => setIsOpen(true), []);
  const closePanel = useCallback(() => setIsOpen(false), []);
  const togglePanel = useCallback(() => setIsOpen((prev) => !prev), []);

  // Credits query
  const { data: credits, isLoading: creditsLoading } = useQuery<ChatCredits>({
    queryKey: ["chat-credits"],
    queryFn: () => chatApi.credits().then((r) => r.data),
    staleTime: 1000 * 30,
  });

  // History query
  const { data: history } = useQuery({
    queryKey: ["chat-history"],
    queryFn: () => chatApi.history(50).then((r) => r.data),
    staleTime: 1000 * 60,
  });

  // Populate history from server
  useEffect(() => {
    if (history && Array.isArray(history) && history.length > 0) {
      const loaded: Message[] = history
        .slice()
        .reverse()
        .map((m: { role: string; content: string; created_at?: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: m.created_at ? new Date(m.created_at) : new Date(),
        }));
      setMessages([DEFAULT_GREETING, ...loaded]);
    }
  }, [history]);

  // Send message mutation
  const chatMut = useMutation({
    mutationFn: (msg: string) =>
      chatApi.send({
        message: msg,
        persona: "general",
      }),
    onMutate: (msg) => {
      setError(null);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: msg, timestamp: new Date() },
        { role: "assistant", content: "...", timestamp: new Date() },
      ]);
      setIsTyping(true);
      setInput("");
    },
    onSuccess: (res) => {
      setIsTyping(false);
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: res.data.response,
          timestamp: new Date(),
        };
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["chat-credits"] });
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
    },
    onError: (err: unknown) => {
      setIsTyping(false);
      const errMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Sorry, I encountered an issue processing that request. Please try again.";
      setError(errMsg);
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: errMsg,
          timestamp: new Date(),
          isError: true,
        };
        return next;
      });
    },
  });

  const sendMessage = useCallback(
    async (text?: string) => {
      const messageToSend = (text ?? input).trim();
      if (!messageToSend || chatMut.isPending) return;
      chatMut.mutate(messageToSend);
    },
    [input, chatMut]
  );

  const newChat = useCallback(async () => {
    try {
      await chatApi.newConversation();
      setMessages([DEFAULT_GREETING]);
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
      queryClient.invalidateQueries({ queryKey: ["chat-credits"] });
      toast.success("New conversation started");
    } catch {
      try {
        await chatApi.clearHistory();
        setMessages([DEFAULT_GREETING]);
        queryClient.invalidateQueries({ queryKey: ["chat-history"] });
        toast.success("Chat history cleared");
      } catch {
        toast.error("Could not reset chat");
      }
    }
  }, [queryClient]);

  return (
    <LumiContext.Provider
      value={{
        isOpen,
        openPanel,
        closePanel,
        togglePanel,
        messages,
        input,
        setInput,
        isTyping,
        sendMessage,
        newChat,
        credits: credits ?? null,
        creditsLoading,
        error,
      }}
    >
      {children}
    </LumiContext.Provider>
  );
}
