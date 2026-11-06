import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { WorkspacePreview } from "@/components/marketing/workspace-preview";
import { listClassrooms } from "@/lib/classrooms";

export const metadata: Metadata = {
  title: "Espace",
  description: "L'éditeur, le terminal et les fichiers d'une classe GSPB.",
};

export default async function WorkspacePage() {
  const { userId } = await auth();
  if (userId) {
    const classes = await listClassrooms(userId);
    if (classes[0]) redirect(`/classes/${classes[0].id}/espace`);
  }

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
