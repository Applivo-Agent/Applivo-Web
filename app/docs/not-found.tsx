import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DocsNotFound() {
  return (
    <div className="mx-auto max-w-[680px] px-6 py-24 sm:px-10">
      <h1 className="text-[32px] sm:text-[36px] font-semibold tracking-tight text-white">
        Page not found
      </h1>
      <p className="mt-2 text-[15.5px] leading-relaxed text-zinc-400">
        That documentation page does not exist or may have been moved.
      </p>
      <Link
        href="/docs"
        className="mt-8 inline-flex h-8 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-white/[0.08]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to documentation
      </Link>
    </div>
  );
}
