import Link from "next/link";

export function ComingSoon({ title = "Coming soon" }: { title?: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(60% 50% at 50% 40%, rgba(255,255,255,0.06), transparent 70%)" }}
      />
      <div className="relative z-10 w-full max-w-[420px] text-center">
        <div className="p-[1px] rounded-[2.5rem] bg-gradient-to-b from-white/[0.10] to-transparent shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)]">
          <div className="bg-[#242424]/95 rounded-[2.5rem] p-10 space-y-5 border border-white/[0.07]">
            <span className="inline-block text-[11px] tracking-[0.2em] uppercase text-white/50 border border-white/10 rounded-full px-3 py-1">
              Applivo
            </span>
            <h1 className="text-3xl font-semibold text-white">{title}</h1>
            <p className="text-sm text-white/60 leading-relaxed">
              We&apos;re getting Applivo ready for launch. Sign-ups and logins will open soon.
              Thanks for your patience.
            </p>
            <Link
              href="/"
              className="inline-block w-full rounded-full bg-white text-black font-medium py-3 hover:bg-white/90 transition"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
