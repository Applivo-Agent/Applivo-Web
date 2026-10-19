import { Camera, Play, Info, AlertTriangle, Construction, Network, Image as ImageIcon } from "lucide-react";

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
 * With `src` it renders the real image; without it, renders a crisp, monochrome placeholder.
 */
export function DocsFigure({ label, file, ratio = "16 / 9", alt, src, caption }: DocsFigureProps) {
  return (
    <figure className="docs-figure my-8 w-full max-w-full">
      <div className="docs-media relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c0e] shadow-sm" style={{ aspectRatio: ratio }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? label}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <DocsImagePlaceholder label={label} file={file} ratio={ratio} />
        )}
      </div>
      {(caption || label) && (
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
        className="docs-media relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c0e] shadow-sm"
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

export function DocsVideoPlaceholder({ label, file, duration, caption }: { label: string; file: string; duration?: string; caption?: string }) {
  const assetPath = file.startsWith("public/") ? file : `public/docs/videos/${file}`;

  return (
    <figure className="my-8 w-full max-w-full">
      <div
        className="docs-media relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c0e] shadow-sm"
        style={{ aspectRatio: "16 / 9" }}
      >
        <div
          role="img"
          aria-label={`Video tutorial: ${label}`}
          className="relative flex h-full w-full flex-col items-center justify-center gap-3.5 p-6 text-center bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:20px_20px]"
        >
          <div className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white shadow-lg transition-transform hover:scale-105">
            <Play className="ml-0.5 h-5 w-5 fill-white/80" strokeWidth={1.5} />
          </div>

          <div className="space-y-1">
            <p className="text-[13.5px] font-medium text-zinc-200 tracking-tight">{label}</p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-0.5 text-[11px] font-mono text-zinc-400">
              {duration && <span className="font-sans text-zinc-300">{duration} •</span>}
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
