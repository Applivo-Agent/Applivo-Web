"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { DocsSidebar } from "./docs-sidebar";
import { DocsHeader } from "./docs-header";
import { DocsSearch } from "./docs-search";
import { getArticle } from "@/lib/docs/registry";

/** Documentation frame. It is separate from the marketing navbar and from the signed-in app shell. */
export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.startsWith("/docs/") ? pathname.slice(6).split("/")[0] : undefined;
  const article = slug ? getArticle(slug) : undefined;
  const [drawer, setDrawer] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => { setDrawer(false); }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearching((s) => !s); }
      if (e.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSearch = useCallback(() => { setDrawer(false); setSearching(true); }, []);

  return (
    <div className="docs min-h-screen bg-[var(--docs-bg)] text-[var(--docs-text)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--docs-sidebar-w)] border-r border-[var(--docs-border)] bg-[var(--docs-bg)] lg:block">
        <DocsSidebar slug={slug} onSearch={openSearch} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close navigation" className="absolute inset-0 bg-black/70" onClick={() => setDrawer(false)} />
          <aside role="dialog" aria-modal="true" aria-label="Documentation navigation" className="absolute inset-y-0 left-0 w-[min(320px,88vw)] border-r border-[var(--docs-border)] bg-[var(--docs-bg)]">
            <button onClick={() => setDrawer(false)} aria-label="Close" className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-[var(--docs-muted)] hover:text-white"><X className="h-4 w-4" /></button>
            <DocsSidebar slug={slug} inDrawer onNavigate={() => setDrawer(false)} onSearch={openSearch} />
          </aside>
        </div>
      )}

      <div className="lg:pl-[var(--docs-sidebar-w)]">
        <DocsHeader article={article} onMenu={() => setDrawer(true)} onSearch={openSearch} />
        <main id="docs-main">{children}</main>
      </div>
      <DocsSearch open={searching} onClose={() => setSearching(false)} />
    </div>
  );
}
