import Link from "next/link";
import { getArticle, getArticleIcon } from "@/lib/docs/registry";
import { DocsImagePlaceholder } from "./docs-media";

interface DocsCardsProps {
  slugs: string[];
  cols?: string;
  visual?: boolean;
}

/**
 * Documentation index cards styled to match Linear Docs cards:
 * Dedicated icon or visual area, subtle surface, title and description in a responsive grid.
 */
export function DocsCards({
  slugs,
  cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  visual = false,
}: DocsCardsProps) {
  return (
    <div className={`grid gap-4 ${cols}`}>
      {slugs.map((s) => {
        const article = getArticle(s);
        if (!article) return null;
        const Icon = getArticleIcon(s, article.group);

        return (
          <Link
            key={s}
            href={`/docs/${s}`}
            className="group relative flex min-h-[170px] flex-col justify-between rounded-xl border border-[var(--docs-border)] bg-[var(--docs-card)] p-5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40 shadow-sm"
          >
            {/* Top icon area matching Linear Docs */}
            <div className="flex items-start justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-300 transition-colors group-hover:text-white">
                <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              </div>
            </div>

            {/* Bottom text block */}
            <div className="mt-6">
              <h3 className="text-[14px] font-medium tracking-tight text-white transition-colors group-hover:text-white">
                {article.title}
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-400 line-clamp-2">
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
