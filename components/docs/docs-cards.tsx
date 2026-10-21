import Link from "next/link";
import { getArticle, getArticleIcon } from "@/lib/docs/registry";
import { DocsImagePlaceholder } from "./docs-media";

interface DocsCardsProps {
  slugs: string[];
  cols?: string;
  visual?: boolean;
}

/**
 * Documentation index cards matching Linear Docs cards:
 * - Upper visual region (approx 148px) with small top-left icon and neutral background
 * - Thin horizontal border separator
 * - Lower content region with 16px title and 14px muted description
 * - 4-column responsive grid with consistent 16-20px gaps
 */
export function DocsCards({
  slugs,
  cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}: DocsCardsProps) {
  return (
    <div className={`grid gap-4 sm:gap-5 ${cols}`}>
      {slugs.map((s) => {
        const article = getArticle(s);
        if (!article) return null;
        const Icon = getArticleIcon(s, article.group);

        return (
          <Link
            key={s}
            href={`/docs/${s}`}
            className="group flex flex-col justify-between rounded-xl border border-[var(--docs-border)] bg-[var(--docs-card)] overflow-hidden transition-colors hover:border-[#383838] hover:bg-[var(--docs-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
          >
            {/* Upper visual region */}
            <div className="h-[148px] p-5 sm:p-5.5 flex items-start justify-start bg-[var(--docs-card)] transition-colors group-hover:bg-[var(--docs-card-hover)]">
              <Icon
                className="h-5 w-5 text-[var(--docs-text)] transition-colors group-hover:text-white"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>

            {/* Thin horizontal border separator */}
            <div className="border-t border-[var(--docs-border)]" />

            {/* Lower content region */}
            <div className="flex flex-1 flex-col justify-start p-5 sm:p-5.5 bg-[var(--docs-card)] transition-colors group-hover:bg-[var(--docs-card-hover)]">
              <h3 className="text-[16px] font-medium tracking-tight text-[var(--docs-text)] transition-colors group-hover:text-white">
                {article.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--docs-secondary)] line-clamp-3">
                {article.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export { DocsImagePlaceholder };
