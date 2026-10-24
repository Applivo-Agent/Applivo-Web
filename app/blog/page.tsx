import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { BLOG_ARTICLES } from "@/lib/blog-data";

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-[var(--sx-bg-090909)] text-[var(--sx-tx-f5f5f5)] flex flex-col justify-between selection:bg-white/20">
      <NavBar />

      <main className="pt-24 sm:pt-28 md:pt-32 pb-20 px-4 sm:px-6 md:px-8 relative z-10 flex flex-col items-center flex-1">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
          <span className="text-[11px] sm:text-[11.5px] font-medium text-[var(--sx-tx-71717a)] uppercase tracking-[0.15em] block mb-3">
            INSIGHTS & GUIDES
          </span>
          <h1 className="text-[32px] sm:text-[36px] md:text-[40px] font-semibold tracking-tight mb-3 leading-[1.2]">
            <span className="text-[var(--sx-tx-a1a1a1)] block">Ideas for a</span>
            <span className="text-white font-semibold block">smarter job search</span>
          </h1>
          <p className="text-[14px] sm:text-[14.5px] text-[var(--sx-tx-a1a1aa)] leading-[1.6] max-w-lg mx-auto">
            Practical guides, career insights, and AI-powered strategies to help you discover opportunities and move forward with confidence.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="w-full max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5 lg:gap-5 items-stretch">
          {BLOG_ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group rounded-[12px] bg-[var(--sx-bg-111111)] border border-[var(--sx-bd-252525)] hover:border-[var(--sx-bd-383838)] p-4 sm:p-[18px] lg:p-[19px] flex flex-col justify-between transition-all duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            >
              <div className="flex flex-col">
                <div className="relative w-full aspect-[16/9] max-h-[168px] rounded-[8px] overflow-hidden bg-[var(--sx-bg-181818)] mb-3.5">
                  <Image
                    src={article.coverImage}
                    alt={article.altText}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="flex items-center gap-2 mb-2 text-[11.5px] text-[var(--sx-tx-71717a)] font-medium">
                  <span>{article.category}</span>
                  <span className="text-[var(--sx-tx-3f3f46)]">·</span>
                  <span>{article.readingTime}</span>
                </div>

                <h2 className="text-[17.5px] sm:text-[18px] font-medium text-[var(--sx-tx-f5f5f5)] leading-[1.3] mb-2 group-hover:text-white transition-colors">
                  {article.title}
                </h2>

                <p className="text-[13px] sm:text-[13.5px] text-[var(--sx-tx-a1a1aa)] leading-[1.55] font-normal line-clamp-3 mb-4">
                  {article.description}
                </p>
              </div>

              <div className="mt-auto pt-2 flex items-center gap-1.5 text-[12.5px] sm:text-[13px] font-medium text-[var(--sx-tx-e4e4e7)] group-hover:text-white transition-colors">
                <span>Read article</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
