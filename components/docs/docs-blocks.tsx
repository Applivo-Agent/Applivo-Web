import { Block, slugify, Heading } from "@/lib/docs/types";
import { DocsCallout, DocsFigure, DocsVideoPlaceholder, DocsDiagramPlaceholder } from "./docs-media";
import { DocsCodeBlock } from "./docs-code";
import Link from "next/link";
import { getArticle } from "@/lib/docs/registry";

function Inline({ text }: { text: string }) {
  return <>{text}</>;
}

export function DocsBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2":
            return (
              <h2 key={i} id={b.id ?? slugify(b.text)} className="docs-h2">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={b.id ?? slugify(b.text)} className="docs-h3">
                {b.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="docs-p">
                <Inline text={b.text} />
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="docs-list list-disc">
                {b.items.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="docs-list list-decimal">
                {b.items.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ol>
            );
          case "callout":
            return (
              <DocsCallout key={i} tone={b.tone} title={b.title}>
                {b.text}
              </DocsCallout>
            );
          case "code":
            return <DocsCodeBlock key={i} code={b.code} lang={b.lang} label={b.label} />;
          case "img":
            return (
              <DocsFigure
                key={i}
                label={b.label}
                file={b.file}
                ratio={b.ratio}
                alt={b.alt}
                src={b.src}
                caption={b.caption}
              />
            );
          case "diagram":
            return (
              <DocsDiagramPlaceholder
                key={i}
                label={b.label}
                file={b.file}
                ratio={b.ratio}
                caption={b.caption}
              />
            );
          case "video":
            return (
              <DocsVideoPlaceholder
                key={i}
                label={b.label}
                file={b.file}
                duration={b.duration}
                caption={b.caption}
              />
            );
          case "table":
            return (
              <div key={i} className="my-6 overflow-x-auto rounded-xl border border-[var(--docs-border)]">
                <table className="w-full min-w-[420px] border-collapse text-left text-[14px]">
                  <thead>
                    <tr className="bg-[var(--docs-card)]">
                      {b.head.map((h, j) => (
                        <th
                          key={j}
                          scope="col"
                          className="border-b border-[var(--docs-border)] px-4 py-2.5 font-medium text-white"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-b border-[var(--docs-border)] last:border-0 hover:bg-white/[0.02]">
                        {r.map((c, k) => (
                          <td
                            key={k}
                            className={
                              k === 0
                                ? "px-4 py-2.5 align-top font-medium text-white"
                                : "px-4 py-2.5 align-top text-zinc-300"
                            }
                          >
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </>
  );
}

export function RelatedList({ slugs }: { slugs: string[] }) {
  const items = slugs.map(getArticle).filter(Boolean);
  if (!items.length) return null;

  return (
    <section aria-labelledby="related" className="mt-12 border-t border-[var(--docs-border)] pt-8">
      <h2 id="related" className="text-[17px] font-semibold tracking-tight text-white">
        Related articles
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((a) => (
          <li key={a!.slug}>
            <Link
              href={`/docs/${a!.slug}`}
              className="block rounded-xl border border-[var(--docs-border)] bg-[var(--docs-card)] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
            >
              <span className="block text-[14px] font-medium text-white">{a!.title}</span>
              <span className="mt-1 block text-[12.5px] leading-relaxed text-zinc-400 line-clamp-2">
                {a!.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type { Heading };
