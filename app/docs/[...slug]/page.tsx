import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/lib/docs/registry";
import { DocsArticleView } from "@/components/docs/docs-article";

type Params = Promise<{ slug: string[] }>;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: [a.slug] }));
}

const resolve = (slug: string[]) => (slug.length === 1 ? getArticle(slug[0]) : undefined);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const a = resolve((await params).slug);
  return a ? { title: a.title, description: a.description } : { title: "Page not found" };
}

export default async function DocsArticlePage({ params }: { params: Params }) {
  const article = resolve((await params).slug);
  if (!article) notFound();
  return <DocsArticleView article={article} />;
}
