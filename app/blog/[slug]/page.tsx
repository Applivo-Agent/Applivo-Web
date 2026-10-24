import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { BLOG_ARTICLES } from "@/lib/blog-data";

export function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--sx-bg-090909)] text-[var(--sx-tx-f5f5f5)] flex flex-col justify-between selection:bg-white/20">
      <NavBar />

      <main className="pt-24 sm:pt-28 md:pt-32 pb-20 px-4 sm:px-6 md:px-8 relative z-10 flex flex-col items-center flex-1">
        <article className="w-full max-w-3xl mx-auto">
          {/* Breadcrumb / Back Link */}
          <div className="flex items-center gap-2 text-[12.5px] text-[var(--sx-tx-71717a)] mb-8">
            <Link
              href="/"
              className="hover:text-[var(--sx-tx-f5f5f5)] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[var(--sx-tx-f5f5f5)] transition-colors">
              Insights
            </Link>
          </div>

          {/* Eyebrow & Meta */}
          <div className="flex items-center gap-2.5 mb-4 text-[12px] text-[var(--sx-tx-a1a1aa)] font-medium">
            <span className="px-2.5 py-0.5 rounded-[3px] bg-[var(--sx-bg-181818)] border border-[var(--sx-bd-2b2b2b)] text-[var(--sx-tx-e4e4e7)]">
              {article.category}
            </span>
            <span className="text-[var(--sx-tx-3f3f46)]">·</span>
            <span className="flex items-center gap-1 text-[var(--sx-tx-71717a)]">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime}
            </span>
            <span className="text-[var(--sx-tx-3f3f46)]">·</span>
            <span className="flex items-center gap-1 text-[var(--sx-tx-71717a)]">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-semibold tracking-tight text-[var(--sx-tx-f5f5f5)] leading-[1.2] mb-5">
            {article.title}
          </h1>

          {/* Subtitle / Summary */}
          <p className="text-[15px] sm:text-[16px] text-[var(--sx-tx-a1a1aa)] leading-[1.6] mb-8">
            {article.summary}
          </p>

          {/* Cover Image */}
          <div className="relative w-full aspect-[16/9] rounded-[10px] overflow-hidden border border-[var(--sx-bd-262626)] bg-[var(--sx-bg-141414)] mb-12 shadow-lg">
            <Image
              src={article.coverImage}
              alt={article.altText}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>

          {/* Article Body Content */}
          <div className="space-y-10 border-t border-[var(--sx-bd-222222)] pt-10">
            {article.content.map((sec, i) => (
              <section key={i} className="space-y-4">
                <h2 className="text-[20px] sm:text-[22px] font-medium text-[var(--sx-tx-f5f5f5)] tracking-tight">
                  {sec.heading}
                </h2>
                {sec.body.map((p, pi) => (
                  <p
                    key={pi}
                    className="text-[14.5px] sm:text-[15px] text-[var(--sx-tx-a1a1aa)] leading-[1.7] font-normal"
                  >
                    {p}
                  </p>
                ))}
                {sec.list && sec.list.length > 0 && (
                  <ul className="space-y-2.5 pt-1 pl-1">
                    {sec.list.map((item, li) => (
                      <li
                        key={li}
                        className="flex items-start gap-3 text-[14px] sm:text-[14.5px] text-[var(--sx-tx-d4d4d8)] leading-[1.65]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#71717A] mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* Bottom Callout & Back to Articles */}
          <div className="mt-14 pt-8 border-t border-[var(--sx-bd-222222)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/blog"
              className="text-[13px] font-medium text-[var(--sx-tx-a1a1aa)] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Explore all articles</span>
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-[4px] bg-[var(--sx-bg-181818)] hover:bg-[var(--sx-bg-222222)] border border-[var(--sx-bd-2e2e2e)] text-[13px] font-medium text-[var(--sx-tx-f5f5f5)] transition-colors"
            >
              Start using Applivo free →
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
