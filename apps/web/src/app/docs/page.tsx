import type { Metadata } from "next";
import Link from "next/link";
import { docs } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Docs",
  description: "How to teach a class on GSPB.",
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-5xl font-semibold text-ink">Docs</h1>
      <p className="mt-4 text-lg text-ink-soft">How to teach and run a class on GSPB.</p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link href={`/docs/${doc.slug}`} className="block py-5 hover:bg-white/3">
              <h2 className="text-lg font-medium text-ink">{doc.title}</h2>
              <p className="mt-1 text-sm text-muted">{doc.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
