import type { Metadata } from "next";
import Link from "next/link";
import { createClassroomAction } from "@/app/classes/actions";

export const metadata: Metadata = { title: "Nouvelle classe" };

export default async function NewClassPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link href="/classes" className="text-sm text-navy hover:underline">
        Retour aux classes
      </Link>
      <h1 className="mt-4 font-display text-5xl font-semibold text-ink">Nouvelle classe</h1>
      <p className="mt-3 text-sm text-muted">
        Une classe correspond à une section. Les élèves ne sont pas facturés.
      </p>
      <form action={createClassroomAction} className="mt-8 space-y-4">
        <label className="block text-sm text-ink" htmlFor="name">
          Nom de la classe
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            placeholder="Algorithmique · Bloc B"
            className="mt-2 w-full rounded-xl border border-line bg-paper-elevated px-3 py-2 text-ink outline-none focus:border-navy"
          />
        </label>
        {error === "nom" ? (
          <p className="text-sm text-tomato">Indiquez un nom d&apos;au moins deux caractères.</p>
        ) : null}
        <button
          type="submit"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-[#1a1a1f]"
        >
          Créer la classe
        </button>
      </form>
    </div>
  );
}
