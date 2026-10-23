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
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] flex flex-col justify-between selection:bg-white/20">
      <NavBar />

      <main className="pt-24 sm:pt-28 md:pt-32 pb-20 px-4 sm:px-6 md:px-8 relative z-10 flex flex-col items-center flex-1">
        <article className="w-full max-w-3xl mx-auto">
          {/* Breadcrumb / Back Link */}
          <div className="flex items-center gap-2 text-[12.5px] text-[#71717A] mb-8">
            <Link
              href="/"
              className="hover:text-[#F5F5F5] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#F5F5F5] transition-colors">
              Insights
            </Link>
          </div>

          {/* Eyebrow & Meta */}
          <div className="flex items-center gap-2.5 mb-4 text-[12px] text-[#A1A1AA] font-medium">
            <span className="px-2.5 py-0.5 rounded-[3px] bg-[#181818] border border-[#2B2B2B] text-[#E4E4E7]">
              {article.category}
            </span>
            <span className="text-[#3F3F46]">·</span>
            <span className="flex items-center gap-1 text-[#71717A]">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime}
            </span>
            <span className="text-[#3F3F46]">·</span>
            <span className="flex items-center gap-1 text-[#71717A]">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[28px] sm:text-[34px] md:text-[40px] font-semibold tracking-tight text-[#F5F5F5] leading-[1.2] mb-5">
            {article.title}
          </h1>

          {/* Subtitle / Summary */}
          <p className="text-[15px] sm:text-[16px] text-[#A1A1AA] leading-[1.6] mb-8">
            {article.summary}
          </p>

          {/* Cover Image */}
          <div className="relative w-full aspect-[16/9] rounded-[10px] overflow-hidden border border-[#262626] bg-[#141414] mb-12 shadow-lg">
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
          <div className="space-y-10 border-t border-[#222222] pt-10">
            {article.content.map((sec, i) => (
              <section key={i} className="space-y-4">
                <h2 className="text-[20px] sm:text-[22px] font-medium text-[#F5F5F5] tracking-tight">
                  {sec.heading}
                </h2>
                {sec.body.map((p, pi) => (
                  <p
                    key={pi}
                    className="text-[14.5px] sm:text-[15px] text-[#A1A1AA] leading-[1.7] font-normal"
                  >
                    {p}
                  </p>
                ))}
                {sec.list && sec.list.length > 0 && (
                  <ul className="space-y-2.5 pt-1 pl-1">
                    {sec.list.map((item, li) => (
                      <li
                        key={li}
                        className="flex items-start gap-3 text-[14px] sm:text-[14.5px] text-[#D4D4D8] leading-[1.65]"
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
          <div className="mt-14 pt-8 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/blog"
              className="text-[13px] font-medium text-[#A1A1AA] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Explore all articles</span>
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-[4px] bg-[#181818] hover:bg-[#222222] border border-[#2E2E2E] text-[13px] font-medium text-[#F5F5F5] transition-colors"
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
