import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DocArticle, headingsOf } from "@/lib/docs/types";
import { getGroup, getArticle, prevNext } from "@/lib/docs/registry";
import { DocsBlocks, RelatedList } from "./docs-blocks";
import { DocsToc } from "./docs-toc";
import { DocsCards } from "./docs-cards";

export function DocsArticleView({ article }: { article: DocArticle }) {
  const headings = headingsOf(article);
  const { prev, next } = prevNext(article.slug);
  const group = getGroup(article.group);
  const tocHeadings = article.related?.length
    ? [...headings, { id: "related", text: "Related articles", level: 2 as const }]
    : headings;

  return (
    <div className="mx-auto flex w-full max-w-[1040px] justify-between gap-10 px-6 py-10 sm:px-10 md:py-14">
      {/* Main reading column */}
      <article className="min-w-0 max-w-[680px] flex-1">
        <h1 className="text-[32px] font-semibold tracking-tight text-white sm:text-[36px]">
          {article.title}
        </h1>
        <p className="mt-2 text-[15.5px] leading-relaxed text-zinc-400">
          {article.description}
        </p>

        <DocsBlocks blocks={article.blocks} />

        {/* Section overviews */}
        {article.overview && group && group.articles.length > 1 && (
          <section className="mt-12 border-t border-[var(--docs-border)] pt-8">
            <h2 id="in-this-section" className="mb-4 text-[19px] font-semibold tracking-tight text-white">
              In this section
            </h2>
            <DocsCards
              slugs={group.articles.filter((s) => s !== article.slug)}
              cols="grid-cols-1 sm:grid-cols-2"
            />
          </section>
        )}

        {article.related && <RelatedList slugs={article.related} />}

        {/* Previous and Next Navigation */}
        <nav
          aria-label="Previous and next articles"
          className="mt-14 grid gap-3 border-t border-[var(--docs-border)] pt-8 sm:grid-cols-2"
        >
          {prev ? (
            <Link
              href={`/docs/${prev.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-[var(--docs-border)] bg-[var(--docs-card)] p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.02]"
            >
              <span className="flex items-center gap-1.5 text-[12px] text-zinc-400 transition-colors group-hover:text-zinc-300">
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </span>
              <span className="mt-1.5 block text-[14px] font-medium text-white">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {next && (
            <Link
              href={`/docs/${next.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-[var(--docs-border)] bg-[var(--docs-card)] p-4 text-right transition-all duration-200 hover:border-white/20 hover:bg-white/[0.02]"
            >
              <span className="flex items-center justify-end gap-1.5 text-[12px] text-zinc-400 transition-colors group-hover:text-zinc-300">
                Next <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="mt-1.5 block text-[14px] font-medium text-white">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      </article>

      {/* Right side Table of Contents */}
      <div className="hidden xl:block">
        <DocsToc headings={tocHeadings} />
      </div>
    </div>
  );
}

export { getArticle };
