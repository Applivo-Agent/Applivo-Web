import type { LucideIcon } from "lucide-react";

/** A block of article content. Articles are data, so every page renders through the same components. */
export type Block =
  | { t: "h2"; text: string; id?: string }
  | { t: "h3"; text: string; id?: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "callout"; tone: "note" | "warning" | "limitation"; title?: string; text: string }
  | { t: "code"; lang?: string; code: string; label?: string }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "img"; label: string; file: string; alt?: string; ratio?: string; src?: string; caption?: string }
  | { t: "video"; label: string; file: string; duration?: string; caption?: string }
  | { t: "diagram"; label: string; file: string; ratio?: string; caption?: string; src?: string };

export const KNOWN_DOC_IMAGES = new Set([
  "docs-dashboard-overview.png",
  "docs-applivo-pipeline.png",
  "docs-sidebar-features.png",
  "docs-account-setup.png",
  "docs-auth-verification.png",
  "docs-extension-architecture.png",
  "docs-extension-installation.png",
  "docs-subscription-eligibility.png",
  "docs-supported-portals.png",
  "docs-run-queue-stages.png",
  "docs-ai-form-filling.png",
  "docs-resume-attachment.png",
  "docs-portal-confirmation.png",
  "docs-captcha-alert.png",
  "docs-unsupported-form.png",
  "docs-starting-run.png",
  // Integrations hero & flow assets
  "integrations/adzuna.png",
  "integrations/ashby.png",
  "integrations/calendly.png",
  "integrations/github.png",
  "integrations/glassdoor.png",
  "integrations/gmail.png",
  "integrations/google-calendar.png",
  "integrations/google-drive.png",
  "integrations/indeed.png",
  "integrations/internshala.png",
  "integrations/internshala-flow.png",
  "integrations/lever.png",
  "integrations/linkedin.png",
  "integrations/make.png",
  "integrations/microsoft-onedrive.png",
  "integrations/microsoft-outlook.png",
  "integrations/outlook-calendar.png",
  "integrations/n8n.png",
  "integrations/notion.png",
  "integrations/openrouter.png",
  "integrations/overleaf.png",
  "integrations/remotive.png",
  "integrations/ats-resume-intelligence.png",
  "integrations/slack.png",
  "integrations/telegram.png",
  "integrations/zapier.png",
  "integrations/applivo-companion.png",
  "integrations/extension-supported-sites.png",
  "integrations/lumi.png",
  "integrations/integrations-overview.png",
  "integrations/app-run-queue.png",
  "integrations/app-submission-flow.png",
  "integrations/captcha-attention-flow.png",
  "integrations/form-validation-flow.png",
  "integrations/subscription-eligibility.png",
  "integrations/ai-job-workflow.png",
  "integrations/app-flow-infographic.png",
]);

export interface DocArticle {
  slug: string;
  title: string;
  description: string;
  group: string;
  blocks: Block[];
  /** Slugs of related articles. */
  related?: string[];
  /** Overview pages show their group's articles as cards. */
  overview?: boolean;
}

export interface DocGroup {
  id: string;
  title: string;
  icon: LucideIcon;
  blurb: string;
  /** Article slugs, in navigation order. The first one is the group's landing article. */
  articles: string[];
}

export interface Heading { id: string; text: string; level: 2 | 3 }

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const headingsOf = (a: DocArticle): Heading[] =>
  a.blocks
    .filter((b): b is Extract<Block, { t: "h2" | "h3" }> => b.t === "h2" || b.t === "h3")
    .map((b) => ({ id: b.id ?? slugify(b.text), text: b.text, level: b.t === "h2" ? 2 : 3 }));

// Authoring helpers keep article files short and uniform.
export const h2 = (text: string): Block => ({ t: "h2", text });
export const h3 = (text: string): Block => ({ t: "h3", text });
export const p = (text: string): Block => ({ t: "p", text });
export const ul = (...items: string[]): Block => ({ t: "ul", items });
export const ol = (...items: string[]): Block => ({ t: "ol", items });
export const note = (text: string, title?: string): Block => ({ t: "callout", tone: "note", text, title });
export const warn = (text: string, title?: string): Block => ({ t: "callout", tone: "warning", text, title });
export const limit = (text: string): Block => ({ t: "callout", tone: "limitation", title: "Current limitation", text });
export const code = (codeText: string, lang = "bash", label?: string): Block => ({ t: "code", lang, code: codeText, label });
export const table = (head: string[], ...rows: string[][]): Block => ({ t: "table", head, rows });
export const img = (label: string, file: string, ratio = "16 / 9", alt?: string, src?: string): Block => {
  const isAvailable = Boolean(src || KNOWN_DOC_IMAGES.has(file) || file.startsWith("/") || file.startsWith("integrations/"));
  const resolvedSrc = src ?? (isAvailable ? (file.startsWith("/") ? file : `/docs/images/${file}`) : undefined);
  return { t: "img", label, file, ratio, alt, src: resolvedSrc };
};
export const vid = (label: string, file: string): Block => ({ t: "video", label, file });
export const diagram = (label: string, file: string, ratio = "16 / 9", caption?: string, src?: string): Block => {
  const isAvailable = Boolean(src || KNOWN_DOC_IMAGES.has(file) || file.startsWith("/") || file.startsWith("integrations/"));
  const resolvedSrc = src ?? (isAvailable ? (file.startsWith("/") ? file : `/docs/images/${file}`) : undefined);
  return { t: "diagram", label, file, ratio, caption, src: resolvedSrc };
};
