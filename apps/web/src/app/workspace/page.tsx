import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePreview } from "@/components/marketing/workspace-preview";

export const metadata: Metadata = {
  title: "Espace",
  description: "L'éditeur, le terminal et les fichiers d'une classe GSPB.",
};

export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-semibold text-ink">Espace</h1>
          <p className="mt-3 max-w-xl text-ink-soft">
            Fichiers, éditeur et terminal de la classe ouverte. Cet écran est l&apos;aperçu. La
            session s&apos;ouvre depuis une classe.
          </p>
        </div>
        <Link href="/classes" className="text-sm text-navy hover:underline">
          Retour aux classes
        </Link>
      </div>
      <div className="mt-10">
        <WorkspacePreview />
      </div>
    </div>
  );
}
