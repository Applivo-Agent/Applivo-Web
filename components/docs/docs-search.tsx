"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, Hash } from "lucide-react";
import { search, getArticleIcon } from "@/lib/docs/registry";

interface DocsSearchProps {
  open: boolean;
  onClose: () => void;
}

export function DocsSearch({ open, onClose }: DocsSearchProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(q), [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => setSel(0), [q]);

  if (!open) return null;

  const go = (i: number) => {
    const r = results[i];
    if (!r) return;
    onClose();
    router.push(`/docs/${r.slug}${r.hash ? `#${r.hash}` : ""}`);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(sel);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKey}
        className="w-full max-w-[560px] overflow-hidden rounded-xl border border-[var(--docs-border)] bg-[var(--docs-card)] shadow-[0_24px_64px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-center gap-3 border-b border-[var(--docs-border)] px-4">
          <Search className="h-4 w-4 text-[var(--docs-muted)]" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search documentation, guides, and features…"
            aria-label="Search"
            role="combobox"
            aria-expanded
            aria-controls="docs-search-results"
            className="h-12 flex-1 bg-transparent text-[14.5px] text-[var(--docs-text)] outline-none placeholder:text-[var(--docs-muted)]"
          />
          <kbd className="rounded border border-[var(--docs-border)] bg-[#1c1c1c] px-1.5 py-0.5 text-[11px] font-mono text-[var(--docs-muted)]">
            Esc
          </kbd>
        </div>

        <ul id="docs-search-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2 [scrollbar-width:thin]">
          {q.trim() && results.length === 0 && (
            <li className="px-3 py-8 text-center text-[13.5px] text-[var(--docs-secondary)]">
              No results found for “{q}”.
            </li>
          )}
          {!q.trim() && (
            <li className="px-3 py-8 text-center text-[13.5px] text-[var(--docs-muted)]">
              Type to search all articles, headings, and guides.
            </li>
          )}
          {results.map((r, i) => {
            const Icon = getArticleIcon(r.slug);
            const isSelected = i === sel;

            return (
              <li key={`${r.slug}-${r.hash ?? ""}`} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onMouseEnter={() => setSel(i)}
                  onClick={() => go(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    isSelected ? "bg-[var(--docs-card-hover)] text-white" : "text-[var(--docs-secondary)] hover:bg-[var(--docs-card-hover)] hover:text-white"
                  }`}
                >
                  {r.heading ? (
                    <Hash className="h-4 w-4 shrink-0 text-[var(--docs-muted)]" strokeWidth={1.75} />
                  ) : (
                    <Icon className="h-4 w-4 shrink-0 text-[var(--docs-muted)]" strokeWidth={1.75} />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-[var(--docs-text)]">
                      {r.heading ?? r.title}
                    </span>
                    <span className="block truncate text-[11.5px] text-[var(--docs-muted)]">
                      {r.group}
                      {r.heading ? ` › ${r.title}` : ""}
                    </span>
                  </span>
                  {isSelected && <CornerDownLeft className="h-3.5 w-3.5 text-[var(--docs-muted)]" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
