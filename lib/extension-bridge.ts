/**
 * Page ↔ Applivo extension bridge (protocol v2).
 *
 *   page → ext  { source:"applivo-web", v:2, id, type, payload }
 *   ext  → page { source:"applivo-ext", v:2, id?, type, payload }
 *
 * Replies carry the request id and type "<type>:reply"; unsolicited events
 * ("hello", "state", "run") carry no id. Nothing here ever sees the extension
 * token coming back (or going out): pairing uses a PKCE-style challenge, so the page only ever handles a challenge
 * and a one-time code, never a credential.
 */

export const BRIDGE_PROTOCOL = 2;

export interface ExtensionState {
  ok: boolean;
  version?: string;
  connected?: boolean;
  valid?: boolean;
  /** "ok" | "subscription_required" | "reconnect_required" | "unreachable" — as last verified by the server. */
  access?: string;
  email?: string;
  name?: string;
  error?: string;
}

export interface BeginPairReply {
  ok: boolean;
  /** SHA-256(verifier), hex. The verifier itself never leaves the extension. */
  challenge?: string;
  state?: string;
  error?: string;
}

export interface CompletePairReply {
  ok: boolean;
  /** The extension opened its own approval window; nothing is stored until the user approves there. */
  pending?: boolean;
  /** Set when the server refused with 402: the extension is NOT connected and the user needs a plan. */
  subscriptionRequired?: boolean;
  message?: string;
  error?: string;
}

export type RunItemStatus = "waiting" | "applying" | "awaiting_review" | "submitted" | "skipped" | "failed" | "unknown";

export interface RunItem {
  application_id: string;
  title: string;
  company?: string;
  status: RunItemStatus;
  error?: string | null;
}

export interface RunState {
  ok: boolean;
  hasRun: boolean;
  active: boolean;
  done?: boolean;
  stopped?: string | null;
  total?: number;
  idx?: number;
  nextAt?: number | null;
  startedAt?: number | null;
  items: RunItem[];
  error?: string;
}

export interface QueueItem {
  application_id: string;
  title: string;
  company?: string;
}

export interface QueueReply {
  ok: boolean;
  items?: QueueItem[];
  error?: string;
}

export interface StartReply {
  /** Server error code when the extension refused (e.g. run_cancelled, subscription_required). */
  ok: boolean;
  count?: number;
  /** The extension opened its own approval window; nothing starts until the user approves there. */
  pending?: boolean;
  message?: string;
  error?: string;
}

export interface SyncMessagesReply {
  ok: boolean;
  count?: number;
  synced_count?: number;
  conversations?: any[];
  error?: string;
  message?: string;
}

export type BridgeRequestType =
  | "hello" | "getState" | "beginPair" | "completePair" | "disconnect"
  | "getRun" | "getQueue" | "startRun" | "stopRun" | "kick" | "syncMessages";

type Listener = (type: string, payload: unknown) => void;

function isExtMessage(data: unknown): data is { source: string; v: number; id?: string; type: string; payload: unknown } {
  const d = data as Record<string, unknown> | null;
  return !!d && typeof d === "object" && d.source === "applivo-ext" && d.v === BRIDGE_PROTOCOL && typeof d.type === "string";
}

/** Send a request to the extension. Resolves null if it doesn't answer in time
 *  (extension not installed, or installed after this page loaded). */
export function bridgeRequest<T = ExtensionState>(
  type: BridgeRequestType,
  payload?: Record<string, unknown>,
  timeoutMs = 1500,
): Promise<T | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const done = (value: T | null) => {
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
      resolve(value);
    };
    const onMessage = (ev: MessageEvent) => {
      if (ev.source !== window || ev.origin !== window.location.origin) return;
      if (!isExtMessage(ev.data) || ev.data.id !== id || ev.data.type !== `${type}:reply`) return;
      done(ev.data.payload as T);
    };
    const timer = setTimeout(() => done(null), timeoutMs);
    window.addEventListener("message", onMessage);
    window.postMessage({ source: "applivo-web", v: BRIDGE_PROTOCOL, id, type, payload }, window.location.origin);
  });
}

/** Subscribe to unsolicited extension events ("hello", "state", "run"). */
export function onBridgeEvent(listener: Listener): () => void {
  const handler = (ev: MessageEvent) => {
    if (ev.source !== window || ev.origin !== window.location.origin) return;
    if (!isExtMessage(ev.data) || ev.data.id) return;
    listener(ev.data.type, ev.data.payload);
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}
