import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { groups } from "@/lib/docs/registry";
import { DocsCards } from "@/components/docs/docs-cards";

const POPULAR_SLUGS = [
  "quick-start",
  "automation-overview",
  "job-match-scores",
  "plans-overview",
];

export default function DocsHome() {
  return (
    <div className="mx-auto w-full max-w-[1140px] px-6 py-10 sm:px-10 md:py-14">
      {/* Linear Docs-style Header */}
      <div className="mb-12">
        <h1 className="text-[30px] font-semibold tracking-tight text-[var(--docs-text)] sm:text-[34px]">
          Applivo Docs
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--docs-secondary)] max-w-[640px]">
          Get an overview of Applivo&apos;s features, automated job applications, Chrome extension,
          and how to use them.
        </p>
      </div>

      {/* Popular section */}
      <section className="mb-14" aria-labelledby="section-popular">
        <h2 id="section-popular" className="mb-4 text-[20px] font-medium tracking-tight text-[var(--docs-text)] sm:text-[21px]">
          Popular
        </h2>
        <DocsCards slugs={POPULAR_SLUGS} />
      </section>

      {/* Topics sections */}
      <div className="space-y-14">
        {groups.map((g) => {
          const previewArticles = g.articles.slice(0, 4);
          if (!previewArticles.length) return null;

          return (
            <section key={g.id} aria-labelledby={`g-${g.id}`}>
              <div className="mb-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div>
                  <h2 id={`g-${g.id}`} className="text-[20px] font-medium tracking-tight text-[var(--docs-text)] sm:text-[21px]">
                    {g.title}
                  </h2>
                  {g.blurb && <p className="text-[14px] text-[var(--docs-secondary)] mt-1">{g.blurb}</p>}
                </div>
                {g.articles.length > 4 && (
                  <Link
                    href={`/docs/${g.articles[0]}`}
                    className="inline-flex items-center gap-1 text-[13.5px] text-[var(--docs-secondary)] transition-colors hover:text-white"
                  >
                    <span>View all {g.articles.length}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              <DocsCards slugs={previewArticles} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
