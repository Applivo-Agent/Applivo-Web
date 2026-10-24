import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: {
    default: "Applivo | Apply to internships faster, without retyping every form",
    template: "%s | Applivo",
  },
  description:
    "Applivo scores Internshala listings against your resume, drafts answers to screening questions from your own profile, fills applications in your Chrome and tracks every one.",
  keywords: ["internship application tracker","Internshala auto apply","job application tracker","resume job match score","screening question answers","application autofill"],
  openGraph: {
    title: "Applivo | Apply to internships faster, without retyping every form",
    description: "Match scores, grounded answers to screening questions, Chrome autofill on Internshala and one tracker for every application.",
    type: "website",
  },
  icons: {
    icon: "/applivo-emblem.png",
    shortcut: "/applivo-emblem.png",
    apple: "/applivo-emblem.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground relative`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
