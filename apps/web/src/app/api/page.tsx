import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API",
  description: "API GSPB — bientôt disponible.",
};

export default function ApiPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-xl flex-col items-start justify-center px-6 py-20">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Développeurs</p>
      <h1 className="mt-3 font-display text-6xl font-semibold tracking-tight text-ink">API</h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
        L&apos;accès programme aux classes et au carnet de notes arrive bientôt. En attendant, tout passe par
        l&apos;interface GSPB.
      </p>
      <Link href="/classes" className="mt-8 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-[#1a1a1f]">
        Retour aux classes
      </Link>
    </div>
  );
}
