/**
 * Post-login / post-payment redirect validation (open-redirect guard).
 *
 * A `next` / `return_to` value is honoured only if it is a same-site, path-only URL that points at one of the
 * allow-listed route prefixes. Anything else (absolute URLs, protocol-relative `//host`, backslashes, schemes,
 * control characters, unknown paths) is rejected and the caller falls back to its default.
 */
const ALLOWED_PREFIXES = ["/extension/connect", "/subscription", "/pricing", "/dashboard", "/onboarding"];

export function safeNext(raw: string | null | undefined, fallback: string | null = null): string | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 300) return fallback;
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    return fallback;
  }
  // Path-only: one leading slash; no "//", no backslash, no scheme, no control chars or whitespace tricks.
  if (!raw.startsWith("/") || raw.startsWith("//") || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || raw.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(value) || /^\/+[a-z][a-z0-9+.-]*:/i.test(value)) return fallback;
  let url: URL;
  try {
    url = new URL(value, "https://applivo.invalid");
  } catch {
    return fallback;
  }
  if (url.origin !== "https://applivo.invalid") return fallback;
  const path = url.pathname;
  const ok = ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
  return ok ? raw : fallback;   // the caller's original string (query encoding intact), now known to be a safe same-site path
}

/** Query string that carries a validated destination through login/register, or "" when there is none. */
export function nextQuery(next: string | null): string {
  return next ? `?next=${encodeURIComponent(next)}` : "";
}
