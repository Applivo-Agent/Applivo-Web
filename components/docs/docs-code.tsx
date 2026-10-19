"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function DocsCodeBlock({ code, lang, label }: { code: string; lang?: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };
  return (
    <div className="my-6 overflow-hidden rounded-lg border border-[var(--docs-border)] bg-[var(--docs-card)]">
      <div className="flex items-center justify-between border-b border-[var(--docs-border)] px-4 py-2 text-[12px] text-[var(--docs-dim)]">
        <span>{label ?? lang ?? "code"}</span>
        <button type="button" onClick={copy} aria-label="Copy code" className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[13.5px] leading-6 text-[var(--docs-text)]"><code>{code}</code></pre>
    </div>
  );
}
