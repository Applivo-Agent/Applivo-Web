"use client";

/** Route content swaps instantly: the shell stays put and nothing fades out and back in (that read as a reload). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="w-full h-full flex-1 min-h-0 flex flex-col">{children}</div>;
}
