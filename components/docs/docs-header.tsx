"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Copy, Check, Search } from "lucide-react";
import { DocArticle, Block } from "@/lib/docs/types";
import { getGroup } from "@/lib/docs/registry";
import { ThemeToggle } from "@/components/theme-toggle";

function toMarkdown(a: DocArticle) {
  const out = [`# ${a.title}`, "", a.description, ""];
  for (const b of a.blocks as Block[]) {
    if (b.t === "h2") out.push(`## ${b.text}`, "");
    else if (b.t === "h3") out.push(`### ${b.text}`, "");
    else if (b.t === "p") out.push(b.text, "");
    else if (b.t === "ul") out.push(...b.items.map((i) => `- ${i}`), "");
    else if (b.t === "ol") out.push(...b.items.map((i, n) => `${n + 1}. ${i}`), "");
    else if (b.t === "callout") out.push(`> ${b.title ?? b.tone}: ${b.text}`, "");
    else if (b.t === "code") out.push("```" + (b.lang ?? ""), b.code, "```", "");
    else if (b.t === "table") out.push(`| ${b.head.join(" | ")} |`, `| ${b.head.map(() => "---").join(" | ")} |`, ...b.rows.map((r) => `| ${r.join(" | ")} |`), "");
    else if (b.t === "img") out.push(`![${b.label}](/docs/images/${b.file})`, "");
    else if (b.t === "diagram") out.push(`<!-- Diagram: ${b.label} (/docs/images/${b.file}) -->`, "");
    else if (b.t === "video") out.push(`<!-- Video: ${b.label} (/docs/videos/${b.file}) -->`, "");
  }
  return out.join("\n");
}

interface DocsHeaderProps {
  article?: DocArticle;
  onMenu: () => void;
  onSearch: () => void;
}

export function DocsHeader({ article, onMenu, onSearch }: DocsHeaderProps) {
  const [copied, setCopied] = useState(false);
  const group = article ? getGroup(article.group) : undefined;

  const copyPage = async () => {
    if (!article) return;
    try {
      await navigator.clipboard.writeText(toMarkdown(article));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access might be restricted
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-[var(--docs-header-h)] items-center justify-between gap-4 border-b border-[var(--docs-border)] bg-[var(--docs-header-bg)]/95 px-6 backdrop-blur-md md:px-10">
      {/* Left side: Hamburger (mobile) + Breadcrumbs / Current Page Name */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open documentation navigation"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--docs-border)] text-[var(--docs-secondary)] hover:text-white hover:bg-[var(--docs-card-hover)] lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Mobile brand badge if sidebar drawer is hidden */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <Link href="/" title="Applivo Home" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Applivo"
              width={22}
              height={22}
              className="h-5.5 w-5.5 rounded-md object-contain"
            />
          </Link>
          <span aria-hidden className="h-3.5 w-px bg-[var(--docs-border)]" />
          <Link href="/docs" className="text-[14px] font-medium text-[var(--docs-text)]">
            Docs
          </Link>
        </div>

        {/* Desktop breadcrumb / Page name matching Linear Docs */}
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[14px] lg:flex">
          {article ? (
            <ol className="flex min-w-0 items-center gap-1.5 text-[var(--docs-secondary)]">
              <li className="shrink-0">
                <Link href="/docs" className="transition-colors hover:text-white">
                  Docs
                </Link>
              </li>
              <li aria-hidden className="text-zinc-600">/</li>
              {group && !article.overview && (
                <>
                  <li className="shrink-0">
                    <Link href={`/docs/${group.articles[0]}`} className="transition-colors hover:text-white">
                      {group.title}
                    </Link>
                  </li>
                  <li aria-hidden className="text-zinc-600">/</li>
                </>
              )}
              <li aria-current="page" className="truncate font-medium text-[var(--docs-text)]">
                {article.title}
              </li>
            </ol>
          ) : (
            <span className="text-[14px] font-medium text-[var(--docs-text)]">Home</span>
          )}
        </nav>
      </div>

      {/* Right side controls: Search + Copy page + Open Applivo */}
      <div className="flex shrink-0 items-center gap-2.5">
        <ThemeToggle />
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search documentation"
          className="hidden h-8 items-center gap-2 rounded-md border border-[var(--docs-border)] bg-[var(--docs-card)] px-3 text-[13px] text-[var(--docs-secondary)] transition-colors hover:border-[var(--docs-border-strong)] hover:text-white sm:flex"
        >
          <Search className="h-3.5 w-3.5 text-[var(--docs-muted)]" />
          <span>Search</span>
          <kbd className="ml-1 rounded border border-[var(--docs-border)] bg-[var(--sx-bg-1c1c1c)] px-1.5 py-0.5 text-[10px] text-[var(--docs-muted)]">⌘K</kbd>
        </button>

        {article && (
          <button
            type="button"
            onClick={copyPage}
            aria-label="Copy page as Markdown"
            className="hidden h-8 items-center gap-1.5 rounded-md border border-[var(--docs-border)] bg-[var(--docs-card)] px-3 text-[13px] text-[var(--docs-secondary)] transition-colors hover:border-[var(--docs-border-strong)] hover:text-white md:flex"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy page"}</span>
          </button>
        )}

        {/* Open App button matching Linear Docs "Open app" pill */}
        <Link
          href="/dashboard"
          className="flex h-8 items-center rounded-md border border-[var(--docs-border)] bg-[var(--docs-card)] px-3.5 text-[13.5px] font-medium text-[var(--docs-text)] transition-colors hover:bg-[var(--docs-card-hover)] hover:border-[var(--docs-border-strong)]"
        >
          Open Applivo
        </Link>
      </div>
    </header>
  );
}
