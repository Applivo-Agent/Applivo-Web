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
    <div className="mx-auto flex w-full max-w-[1024px] justify-between gap-12 px-6 py-10 sm:px-10 md:py-14">
      {/* Main reading column */}
      <article className="min-w-0 max-w-[624px] flex-1">
        <h1 className="text-[28px] font-semibold tracking-tight text-[var(--docs-text)] sm:text-[30px]">
          {article.title}
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--docs-secondary)]">
          {article.description}
        </p>

        <DocsBlocks blocks={article.blocks} />

        {/* Section overviews */}
        {article.overview && group && group.articles.length > 1 && (
          <section className="mt-12 border-t border-[var(--docs-border)] pt-8">
            <h2 id="in-this-section" className="mb-4 text-[19px] font-medium tracking-tight text-[var(--docs-text)] sm:text-[20px]">
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
          className="mt-14 grid gap-4 border-t border-[var(--docs-border)] pt-8 sm:grid-cols-2"
        >
          {prev ? (
            <Link
              href={`/docs/${prev.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-[var(--docs-border)] bg-[var(--docs-card)] p-5 transition-colors hover:border-[var(--sx-bd-383838)] hover:bg-[var(--docs-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
            >
              <span className="flex items-center gap-1.5 text-[12px] text-[var(--docs-muted)] transition-colors group-hover:text-[var(--docs-secondary)]">
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </span>
              <span className="mt-2 block text-[15px] font-medium text-[var(--docs-text)]">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {next && (
            <Link
              href={`/docs/${next.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-[var(--docs-border)] bg-[var(--docs-card)] p-5 text-right transition-colors hover:border-[var(--sx-bd-383838)] hover:bg-[var(--docs-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
            >
              <span className="flex items-center justify-end gap-1.5 text-[12px] text-[var(--docs-muted)] transition-colors group-hover:text-[var(--docs-secondary)]">
                Next <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="mt-2 block text-[15px] font-medium text-[var(--docs-text)]">
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
