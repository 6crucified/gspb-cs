import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/marketing/mark";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-xl flex-col items-start justify-center px-6 py-20">
      <Mark className="h-10 w-10" />
      <p className="mt-8 font-mono text-sm text-navy">404</p>
      <h1 className="mt-3 font-display text-6xl font-semibold tracking-tight text-ink">Page introuvable</h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
        Ce lien ne mène nulle part. La page a été déplacée, ou elle n&apos;a jamais existé.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-[#1a1a1f]">
          Accueil
        </Link>
        <Link href="/classes" className="rounded-full border border-line px-5 py-2.5 text-sm text-ink">
          Classes
        </Link>
      </div>
    </div>
  );
}
