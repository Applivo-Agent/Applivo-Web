"use client";

import { useEffect, useState } from "react";
import { Heading } from "@/lib/docs/types";

export function DocsToc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[calc(var(--docs-header-h)+36px)] hidden max-h-[calc(100vh-var(--docs-header-h)-64px)] w-[220px] shrink-0 overflow-y-auto border-l border-[var(--docs-border)] pl-4 xl:block [scrollbar-width:none]"
    >
      <p className="mb-3 text-[12px] font-medium uppercase tracking-wider text-[var(--docs-muted)]">
        On this page
      </p>
      <ul className="space-y-1.5 text-[13px]">
        {headings.map((h) => {
          const isActive = active === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(h.id);
                  const el = document.getElementById(h.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    window.history.pushState(null, "", `#${h.id}`);
                  }
                }}
                className={`block py-0.5 leading-snug transition-colors hover:text-white ${
                  h.level === 3 ? "pl-3 text-[12.5px]" : ""
                } ${isActive ? "font-medium text-[var(--docs-text)]" : "text-[var(--docs-secondary)]"}`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
