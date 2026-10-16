"use client";
import { useState } from "react";

const MAIL = "applivoagent@gmail.com";

function href(role: string) {
  return `mailto:${MAIL}?subject=${encodeURIComponent(`Application – ${role} – [Your Name]`)}`;
}

const items = [
  { text: "We're hiring at Applivo!", link: null },
  { text: "Full-Stack Engineer", link: href("Full-Stack Engineer") },
  { text: "Agentic AI Engineer", link: href("Agentic AI Engineer") },
  { text: `Send your resume to ${MAIL}`, link: href("Role Name") },
];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex items-center whitespace-nowrap px-6 text-[13px]">
          {it.link ? (
            <a href={it.link} className="text-white font-medium hover:underline">
              {it.text}
            </a>
          ) : (
            <span className="text-white font-semibold">{it.text}</span>
          )}
          <span className="ml-12 text-white/30">✦</span>
        </span>
      ))}
    </div>
  );
}

export function HiringTicker() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md">
      <style>{`
        @keyframes hiring-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .hiring-track { animation: hiring-scroll 28s linear infinite; }
        .hiring-wrap:hover .hiring-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .hiring-track { animation: none; } }
      `}</style>
      <div className="flex items-center h-10">
        <span className="shrink-0 flex items-center gap-2 pl-4 pr-3 text-[11px] font-bold uppercase tracking-[0.18em] text-black bg-white h-full">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Hiring
        </span>
        <div className="hiring-wrap flex-1 overflow-hidden">
          <div className="hiring-track flex w-max">
            <Row />
            <Row />
            <Row />
            <Row />
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Dismiss hiring banner"
          className="shrink-0 px-4 h-full text-white/50 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
