"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Copy, Check, Search } from "lucide-react";
import { DocArticle, Block } from "@/lib/docs/types";
import { getGroup } from "@/lib/docs/registry";

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
    <header className="sticky top-0 z-30 flex h-[var(--docs-header-h)] items-center justify-between gap-4 border-b border-[var(--docs-border)] bg-[var(--docs-bg)]/90 px-4 backdrop-blur-md md:px-8">
      {/* Left side: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open documentation navigation"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--docs-border)] text-zinc-400 hover:text-white lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Mobile brand badge if sidebar drawer is hidden */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <Link href="/" title="Applivo Home" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Applivo"
              width={26}
              height={26}
              className="h-6.5 w-6.5 rounded-md object-contain"
            />
          </Link>
          <span aria-hidden className="h-3.5 w-px bg-white/20" />
          <Link href="/docs" className="text-[14px] font-semibold text-white">
            Docs
          </Link>
        </div>

        {/* Desktop breadcrumb matching Linear Docs */}
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[13.5px] lg:flex">
          {article ? (
            <ol className="flex min-w-0 items-center gap-1.5 text-zinc-400">
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
              <li aria-current="page" className="truncate font-medium text-white">
                {article.title}
              </li>
            </ol>
          ) : (
            <span className="text-[13.5px] font-medium text-white">Home</span>
          )}
        </nav>
      </div>

      {/* Right side controls: Search + Copy page + Open Applivo */}
      <div className="flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search documentation"
          className="hidden h-7 items-center gap-2 rounded-md border border-[var(--docs-border)] px-2.5 text-[12.5px] text-zinc-400 transition-colors hover:border-white/20 hover:text-white sm:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="ml-1 rounded border border-white/10 px-1 py-0.2 text-[10px] text-zinc-500">⌘K</kbd>
        </button>

        {article && (
          <button
            type="button"
            onClick={copyPage}
            aria-label="Copy page as Markdown"
            className="hidden h-7 items-center gap-1.5 rounded-md border border-[var(--docs-border)] px-2.5 text-[12.5px] text-zinc-400 transition-colors hover:border-white/20 hover:text-white md:flex"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy page"}</span>
          </button>
        )}

        {/* Open App button matching Linear Docs "Open app" pill */}
        <Link
          href="/dashboard"
          className="flex h-7 items-center rounded-md border border-white/10 bg-white/[0.04] px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-white/[0.09]"
        >
          Open Applivo
        </Link>
      </div>
    </header>
  );
}
