import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/docs-shell";

export const metadata: Metadata = {
  title: { default: "Applivo Documentation", template: "%s – Applivo Docs" },
  description: "Guides, references and troubleshooting for Applivo.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
