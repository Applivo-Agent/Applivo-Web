"use client";

/**
 * Extension connection state for the whole app + auto-connect.
 *
 * Pairing is PKCE-style and never exposes a credential to page JavaScript:
 *   1. the extension generates a secret verifier and gives the page only SHA-256(verifier) + a random state;
 *   2. the signed-in, paid-plan website session asks the server for a one-time pairing code bound to that challenge;
 *   3. the page hands the code to the extension, which redeems it directly with the server using the verifier.
 * The scoped extension token goes server -> extension service worker only. Disconnecting revokes it server-side.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { extApi } from "@/lib/api";
import {
  bridgeRequest, onBridgeEvent,
  type ExtensionState, type RunState, type QueueReply, type StartReply, type BeginPairReply, type CompletePairReply, type SyncMessagesReply,
} from "@/lib/extension-bridge";

export type ExtensionStatus =
  | "checking"
  | "not_installed"   // no answer from the bridge
  | "disconnected"    // installed, not connected to this account
  | "connected"
  | "expired"         // connected but the server rejects the token (revoked / expired): pair again
  | "subscription_required"; // connected, but the account has no eligible paid plan

interface ExtensionContextType {
  status: ExtensionStatus;
  info: ExtensionState | null;
  busy: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Live state of the apply run the extension is doing in the background. */
  run: RunState | null;
  getQueue: () => Promise<QueueReply>;
  /** Hand an already-created (server-side, authorized) run to the extension. */
  startRun: (runId: string) => Promise<StartReply>;
  stopRun: () => Promise<void>;
  syncMessages: () => Promise<SyncMessagesReply>;
}

const ExtensionContext = createContext<ExtensionContextType | null>(null);

const AUTO_KEY = "applivo_ext_autoconnect"; // "off" after the user disconnects on purpose
const DEVICE_KEY = "applivo_ext_device";

function deviceLabel(): string {
  let id = "";
  try {
    id = localStorage.getItem(DEVICE_KEY) || "";
    if (!id) {
      id = Math.random().toString(36).slice(2, 8);
      localStorage.setItem(DEVICE_KEY, id);
    }
  } catch {
    id = "browser";
  }
  return `Chrome extension ${id}`;
}

function toStatus(s: ExtensionState | null): ExtensionStatus {
  if (!s || !s.ok) return "not_installed";
  if (!s.connected) return "disconnected";
  if (s.access === "subscription_required") return "subscription_required";
  return s.valid ? "connected" : "expired";
}

export function ExtensionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [info, setInfo] = useState<ExtensionState | null>(null);
  const [status, setStatus] = useState<ExtensionStatus>("checking");
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState<RunState | null>(null);

  const apply = useCallback((s: ExtensionState | null) => {
    setInfo(s);
    setStatus(toStatus(s));
  }, []);

  const refresh = useCallback(async () => {
    apply(await bridgeRequest("getState"));
  }, [apply]);

  const connect = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    try {
      const begin = await bridgeRequest<BeginPairReply>("beginPair", undefined, 4000);
      if (!begin?.ok || !begin.challenge || !begin.state) {
        toast.error("Couldn't reach the Applivo extension. Reload this page and try again.");
        return false;
      }
      let code: string;
      try {
        const r = await extApi.pairStart({ code_challenge: begin.challenge, state: begin.state, label: deviceLabel() });
        code = r.data.pairing_code;
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 402) {
          // Server says: no eligible paid plan. Send the user to the real plans page; they come back here after paying.
          window.location.assign("/subscription?return_to=" + encodeURIComponent("/extension/connect"));
        } else {
          toast.error("Couldn't start the connection. Please try again.");
        }
        return false;
      }
      const res = await bridgeRequest<CompletePairReply>("completePair", { code, state: begin.state }, 15000);
      if (res?.subscriptionRequired) {
        window.location.assign("/subscription?return_to=" + encodeURIComponent("/extension/connect"));
        return false;
      }
      if (res?.pending) toast.info(res.message ?? "Approve the connection in the Applivo extension window.");
      else await refresh();
      try { localStorage.removeItem(AUTO_KEY); } catch {}
      return !!res?.ok;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const disconnect = useCallback(async () => {
    setBusy(true);
    try {
      try { localStorage.setItem(AUTO_KEY, "off"); } catch {}
      // Revoke every live token this browser minted, then drop it from the extension.
      try {
        const label = deviceLabel();
        const { data } = await extApi.listTokens();
        await Promise.all(data.tokens.filter((t) => t.label === label && !t.revoked).map((t) => extApi.revokeToken(t.id)));
      } catch { /* still disconnect locally */ }
      apply(await bridgeRequest("disconnect"));
    } finally {
      setBusy(false);
    }
  }, [apply]);

  // Detect the extension; stay in sync with its pushed events.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let s = await bridgeRequest("hello");
      if (!s && !cancelled) s = await bridgeRequest("hello", undefined, 2500); // slow start
      if (!cancelled) apply(s);
    })();
    const off = onBridgeEvent((type, payload) => {
      if (type === "run") setRun(payload as RunState);
      else apply(payload as ExtensionState);
    });
    return () => { cancelled = true; off(); };
  }, [apply]);

  // Pick up a run that is already going (page reload mid-run).
  useEffect(() => {
    if (status !== "connected") { setRun(null); return; }
    let cancelled = false;
    void bridgeRequest<RunState>("getRun").then((r) => { if (!cancelled && r) setRun(r); });
    return () => { cancelled = true; };
  }, [status]);

  // While a run is active, this page keeps nudging the extension. Chrome can
  // drop a chrome.alarm; a real page's timer is a reliable second clock.
  useEffect(() => {
    if (!run?.active) return;
    const id = setInterval(() => { void bridgeRequest("kick"); }, 15000);
    return () => clearInterval(id);
  }, [run?.active]);

  const getQueue = useCallback(async (): Promise<QueueReply> => {
    return (await bridgeRequest<QueueReply>("getQueue", undefined, 10000)) ?? { ok: false, error: "no_response" };
  }, []);

  const startRun = useCallback(async (runId: string): Promise<StartReply> => {
    const res = (await bridgeRequest<StartReply>("startRun", { runId }, 15000)) ?? { ok: false, error: "no_response" };
    if (res.ok) {
      const r = await bridgeRequest<RunState>("getRun");
      if (r) setRun(r);
    }
    return res;
  }, []);

  const stopRun = useCallback(async () => {
    await bridgeRequest("stopRun");
    const r = await bridgeRequest<RunState>("getRun");
    if (r) setRun(r);
  }, []);

  const syncMessages = useCallback(async (): Promise<SyncMessagesReply> => {
    if (status === "not_installed") {
      return {
        ok: false,
        error: "not_installed",
        message: "Applivo extension is not detected. Please install and enable it in Chrome.",
      };
    }
    if (status === "disconnected" || status === "expired") {
      return {
        ok: false,
        error: "not_connected",
        message: "Please connect the Applivo extension in Settings first.",
      };
    }
    const res = await bridgeRequest<SyncMessagesReply>("syncMessages", undefined, 25000);
    if (!res) {
      return {
        ok: false,
        error: "extension_timeout",
        message: "Extension timed out. Please check that an Internshala tab is open.",
      };
    }
    return res;
  }, [status]);

  // No auto-connect: pairing is always started by the user (the Connect button) and approved in the extension's own window.

  // Signing out of Applivo also detaches the extension from this account.
  const wasAuthed = useRef(false);
  useEffect(() => {
    if (wasAuthed.current && !isAuthenticated) {
      void bridgeRequest("disconnect").then((s) => { if (s) apply(s); });
    }
    wasAuthed.current = isAuthenticated;
  }, [isAuthenticated, apply]);

  return (
    <ExtensionContext.Provider value={{ status, info, busy, connect, disconnect, refresh, run, getQueue, startRun, stopRun, syncMessages }}>
      {children}
    </ExtensionContext.Provider>
  );
}

export function useExtension() {
  const ctx = useContext(ExtensionContext);
  if (!ctx) throw new Error("useExtension must be used inside ExtensionProvider");
  return ctx;
}
