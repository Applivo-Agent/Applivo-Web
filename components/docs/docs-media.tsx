import { Camera, Play, Info, AlertTriangle, Construction, Network, Image as ImageIcon } from "lucide-react";

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

interface DocsFigureProps {
  label: string;
  file: string;
  ratio?: string;
  alt?: string;
  src?: string;
  caption?: string;
}

/**
 * Image slot matching Linear Docs media standards.
 * Renders verified documentation images at their intrinsic dimensions without distortion or cropping.
 * On narrow screens, responsive max-width: 100% and height: auto prevent overflow.
 * If no image exists, renders a crisp, monochrome placeholder.
 */
export function DocsFigure({ label, file, ratio = "16 / 9", alt, src, caption }: DocsFigureProps) {
  const isAvailable = Boolean(src || KNOWN_DOC_IMAGES.has(file) || file.startsWith("/") || file.startsWith("integrations/"));
  const resolvedSrc = src ?? (isAvailable ? (file.startsWith("/") ? file : `/docs/images/${file}`) : undefined);

  const isIntegrationHero = Boolean(
    file &&
    file.startsWith("integrations/") &&
    !file.includes("-flow") &&
    !file.includes("-queue") &&
    !file.includes("-infographic") &&
    !file.includes("-sites") &&
    !file.includes("-eligibility") &&
    !file.includes("-workflow")
  );

  return (
    <figure className={`docs-figure ${isIntegrationHero ? "my-6" : "my-8"} w-full max-w-full`}>
      {resolvedSrc ? (
        <div className="docs-media relative overflow-hidden rounded-xl border border-white/[0.08] bg-[var(--sx-bg-0c0c0e)] shadow-sm flex items-center justify-center p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedSrc}
            alt={alt ?? label}
            className="block max-w-full h-auto mx-auto object-contain"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className="docs-media relative overflow-hidden rounded-xl border border-white/[0.08] bg-[var(--sx-bg-0c0c0e)] shadow-sm"
          style={{ aspectRatio: ratio }}
        >
          <DocsImagePlaceholder label={label} file={file} ratio={ratio} />
        </div>
      )}
      {!isIntegrationHero && (caption || (!resolvedSrc && label)) && (
        <figcaption className="mt-2.5 text-center text-[12.5px] text-zinc-400">
          {caption ?? label}
        </figcaption>
      )}
    </figure>
  );
}

export function DocsImagePlaceholder({ label, file, ratio = "16 / 9" }: { label: string; file: string; ratio?: string }) {
  const assetPath = file.startsWith("public/") ? file : `public/docs/images/${file}`;

  return (
    <div
      role="img"
      aria-label={`Documentation preview: ${label}`}
      className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:20px_20px]"
      style={{ aspectRatio: ratio }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 shadow-inner">
        <Camera className="h-5 w-5" strokeWidth={1.5} />
      </div>

      <div className="space-y-1">
        <p className="text-[13.5px] font-medium text-zinc-200 tracking-tight">{label}</p>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-0.5 text-[11px] font-mono text-zinc-400">
          <span>{assetPath}</span>
        </div>
      </div>
    </div>
  );
}

export function DocsDiagramPlaceholder({ label, file, ratio = "16 / 9", caption }: { label: string; file: string; ratio?: string; caption?: string }) {
  const assetPath = file.startsWith("public/") ? file : `public/docs/images/${file}`;

  return (
    <figure className="my-8 w-full max-w-full">
      <div
        className="docs-media relative overflow-hidden rounded-xl border border-white/[0.08] bg-[var(--sx-bg-0c0c0e)] shadow-sm"
        style={{ aspectRatio: ratio }}
      >
        <div
          role="img"
          aria-label={`Architecture diagram: ${label}`}
          className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 shadow-inner">
            <Network className="h-5 w-5" strokeWidth={1.5} />
          </div>

          <div className="space-y-1">
            <p className="text-[13.5px] font-medium text-zinc-200 tracking-tight">{label}</p>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-0.5 text-[11px] font-mono text-zinc-400">
              <span>{assetPath}</span>
            </div>
          </div>
        </div>
      </div>
      {(caption || label) && (
        <figcaption className="mt-2.5 text-center text-[12.5px] text-zinc-400">
          {caption ?? label}
        </figcaption>
      )}
    </figure>
  );
}

export function DocsVideoPlaceholder({
  label,
  file,
  duration,
  caption,
  poster = "/docs/videos/docs-starting-run.png",
}: {
  label: string;
  file: string;
  duration?: string;
  caption?: string;
  poster?: string;
}) {
  const videoSrc = file.startsWith("/") ? file : `/docs/videos/${file}`;

  return (
    <figure className="docs-figure my-8 w-full max-w-full">
      <div className="docs-media relative overflow-hidden rounded-xl border border-white/[0.08] bg-[var(--sx-bg-0c0c0e)] shadow-sm">
        <video
          controls
          poster={poster}
          preload="metadata"
          className="block w-full max-w-full h-auto mx-auto"
          aria-label={label}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      {(caption || label) && (
        <figcaption className="mt-2.5 text-center text-[12.5px] text-zinc-400">
          {caption ?? label}
        </figcaption>
      )}
    </figure>
  );
}

const TONES = {
  note: { icon: Info, title: "Note" },
  warning: { icon: AlertTriangle, title: "Warning" },
  limitation: { icon: Construction, title: "Limitation" },
} as const;

export function DocsCallout({ tone, title, children }: { tone: keyof typeof TONES; title?: string; children: React.ReactNode }) {
  const { icon: Icon, title: def } = TONES[tone];
  return (
    <aside
      className="docs-callout my-6 flex gap-3 rounded-lg border border-[var(--docs-border)] bg-[var(--docs-card)] px-4 py-3.5 shadow-sm"
      data-tone={tone}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0 text-[14px] leading-relaxed text-zinc-300">
        <p className="font-medium text-white">{title ?? def}</p>
        <div className="mt-0.5 text-zinc-400">{children}</div>
      </div>
    </aside>
  );
}
