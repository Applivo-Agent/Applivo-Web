"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Dock configuration ─────────────────────────────────────
   Pointer-proximity magnification modelled directly on Lori (lori.sh)
   and macOS dock:
   - Peak magnification scale is 1.34x with bottom-anchoring.
   - Peak vertical lift is 10px (translateY(-10px)) for a restrained,
     luxurious floating motion that never collides with adjacent content.
   - Gaussian influence falloff produces a gentle wave through neighbors.
   - Spring damping ratio is critically balanced (~0.96) for buttery,
     jitter-free responsiveness.
─────────────────────────────────────────────────────────────── */
const MAX_SCALE = 1.34; // matches Lori peak magnification
const INFLUENCE = 85; // smooth proximity wave falloff
const PEAK_LIFT = 10; // matches Lori: translateY(-10px)
const SPRING = { stiffness: 240, damping: 22, mass: 0.55 };

/* Responsive tile metrics matching Lori's dock proportions:
   Desktop: 54px tile with 12px gap (Lori size-[3.5rem] = 56px, gap-3)
   Tablet:  48px tile with 10px gap (Lori size-[3.1rem] = 50px, gap-2.5)
   Mobile:  38px tile with 8px gap  (fits 360px screens cleanly) */
type DockMetrics = { size: number; gap: number; radius: string };
const METRICS: { min: number; value: DockMetrics }[] = [
  { min: 768, value: { size: 54, gap: 12, radius: "rounded-[1.05rem]" } },
  { min: 480, value: { size: 48, gap: 10, radius: "rounded-[0.95rem]" } },
  { min: 0, value: { size: 38, gap: 8, radius: "rounded-[0.85rem]" } },
];

function useDockMetrics(): DockMetrics {
  const [metrics, setMetrics] = useState<DockMetrics>(METRICS[0].value);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const found = METRICS.find((m) => w >= m.min) ?? METRICS[METRICS.length - 1];
      setMetrics(found.value);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return metrics;
}

export type DockItem = {
  /** Stable id */
  id: string;
  /** App / service name shown in the tooltip and read by screen readers */
  label: string;
  /** Logo path under /public */
  src: string;
  /** Accessible description of the item's role in the workflow */
  role: string;
  /** Optional destination — a real in-app route or #anchor. Omit for non-navigable items. */
  href?: string;
  /** Invert a monochrome white mark for use on a white tile */
  invert?: boolean;
  /** Renders the icon on a white tile with a subtle active indicator (featured app) */
  featured?: boolean;
};

export type DockEntry = DockItem | { separator: true; id: string };

type DockProps = {
  items: DockEntry[];
  className?: string;
  /** Optional aria-label for the nav landmark */
  ariaLabel?: string;
};

/* ─── Single dock icon ─────────────────────────────────────── */
function DockIcon({
  item,
  mouseX,
  reducedMotion,
  size,
  radius,
}: {
  item: DockItem;
  mouseX: MotionValue<number>;
  reducedMotion: boolean;
  size: number;
  radius: string;
}) {
  // Measured on the unscaled wrapper so distance never feeds back into
  // the icon's own transform (eliminates jitter / wobble).
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds || val === Infinity) return INFLUENCE * 4;
    return val - (bounds.left + bounds.width / 2);
  });

  // Gaussian weight → smooth magnifying wave rather than a hard hover toggle.
  const weight = useTransform(distance, (d) => {
    const x = d / INFLUENCE;
    return Math.exp(-(x * x));
  });

  const scale = useTransform(weight, [0, 1], [1, MAX_SCALE]);
  const lift = useTransform(weight, [0, 1], [0, -PEAK_LIFT]);

  const scaleSpring = useSpring(scale, SPRING);
  const liftSpring = useSpring(lift, SPRING);

  const tile = (
    <motion.span
      style={{
        width: size,
        height: size,
        transformOrigin: "bottom center",
        scale: reducedMotion ? 1 : scaleSpring,
        y: reducedMotion ? 0 : liftSpring,
      }}
      className={cn(
        "relative flex items-center justify-center will-change-transform transition-[border-color,box-shadow] duration-200",
        radius,
        item.featured
          ? "bg-white border border-white/95 shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
          : "border border-white/[0.08] bg-[linear-gradient(180deg,#242427_0%,#1c1c1f_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_0_0_1px_rgba(255,255,255,0.04),0_1px_3px_-1px_rgba(0,0,0,0.5)] group-hover/item:border-white/[0.18]",
      )}
    >
      <span className="relative block h-[56%] w-[56%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={cn(
            "pointer-events-none h-full w-full select-none object-contain",
            item.invert && "invert",
          )}
        />
      </span>
    </motion.span>
  );

  const label = (
    <motion.span
      role="tooltip"
      initial={false}
      animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-8 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/[0.12] bg-[color-mix(in_srgb,var(--sx-bg-1a1a1e)_95%,transparent)] backdrop-blur-md px-2.5 py-1 text-[11px] font-medium leading-none tracking-tight text-zinc-200 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.9)]"
    >
      {item.label}
    </motion.span>
  );

  const common = {
    ref,
    "aria-label": `${item.label} — ${item.role}`,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
    className:
      "group/item relative flex flex-col items-center outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141416]",
  };

  return (
    <li className="relative flex flex-col items-center">
      {label}
      {item.href ? (
        <Link href={item.href} {...common} draggable={false}>
          {tile}
        </Link>
      ) : (
        <button type="button" {...common} aria-haspopup="true">
          {tile}
        </button>
      )}
      {/* Active dot alignment indicator underneath matching Lori */}
      <span
        className="mt-1.5 flex h-1 items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <span
          className={cn(
            "size-1 rounded-full transition-opacity duration-200",
            item.featured ? "bg-white/90" : "bg-transparent",
          )}
        />
      </span>
    </li>
  );
}

/* ─── Dock container ───────────────────────────────────────── */
export function AppDock({ items, className, ariaLabel = "Applivo workflow apps" }: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const prefersReduced = useReducedMotion() ?? false;
  const { size, gap, radius } = useDockMetrics();

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (prefersReduced) return;
      mouseX.set(e.clientX);
    },
    [mouseX, prefersReduced],
  );

  const handleLeave = useCallback(() => {
    mouseX.set(Infinity);
  }, [mouseX]);

  // Reset magnification if reduced motion is toggled on mid-session.
  useEffect(() => {
    if (prefersReduced) mouseX.set(Infinity);
  }, [prefersReduced, mouseX]);

  return (
    <div className={cn("mx-auto w-full max-w-full overflow-visible", className)}>
      <div className="relative mx-auto w-fit">
        {/* Subtle floor shadow matching Lori's dock-floor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 -bottom-1 h-4 blur-[8px] bg-[radial-gradient(50%_100%_at_50%_0%,rgba(0,0,0,0.8),transparent_70%)]"
        />

        {/* Stationary translucent dock pill matching Lori's dock-panel */}
        <nav
          aria-label={ariaLabel}
          className="relative rounded-[1.35rem] sm:rounded-[1.65rem] border border-white/[0.12] bg-[color-mix(in_srgb,var(--sx-bg-141416)_85%,transparent)] backdrop-blur-xl px-2.5 pb-2 pt-2.5 sm:px-3.5 sm:pb-2.5 sm:pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_-2px_rgba(0,0,0,0.5),0_24px_48px_-20px_rgba(0,0,0,0.85)]"
        >
          {/* Animation layer: allows tiles to rise above the surface */}
          <ul
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="relative flex items-end"
            style={{ gap: `${gap}px` }}
          >
            {items.map((entry) =>
              "separator" in entry ? (
                <li
                  key={entry.id}
                  aria-hidden="true"
                  className="mx-1 mb-3.5 h-8 w-px shrink-0 self-end bg-white/[0.16] sm:h-9"
                />
              ) : (
                <DockIcon
                  key={entry.id}
                  item={entry}
                  mouseX={mouseX}
                  reducedMotion={prefersReduced}
                  size={size}
                  radius={radius}
                />
              ),
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default AppDock;

