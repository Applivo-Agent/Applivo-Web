"use client";

import { Search } from "lucide-react";

/** Opens the shared search dialog by dispatching the same shortcut the shell listens for. */
export function DocsSearchButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
      className="flex h-11 min-w-[280px] items-center gap-3 rounded-lg border border-[var(--docs-border-strong)] bg-[var(--docs-card)] px-4 text-[15px] text-[var(--docs-dim)] hover:text-white"
    >
      <Search className="h-4 w-4" /> Search the documentation
      <kbd className="ml-auto rounded border border-[var(--docs-border-strong)] px-1.5 text-[12px]">⌘K</kbd>
    </button>
  );
}
