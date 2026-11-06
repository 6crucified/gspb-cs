import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { summarizeClassrooms } from "@/lib/assignments";
import { formatDueDate } from "@/lib/assignment-files";
import { listClassrooms } from "@/lib/classrooms";

export const metadata: Metadata = {
  title: "Classes",
  description: "Les sections que vous enseignez sur GSPB.",
};

export default async function ClassesPage() {
  const { userId } = await auth();
  const classes = userId ? await listClassrooms(userId) : [];
  const summaries = userId ? await summarizeClassrooms(classes.map((classroom: { id: string }) => classroom.id)) : new Map();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-5xl font-semibold text-ink">Classes</h1>
        {userId ? (
          <Link
            href="/classes/new"
            className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-[#1a1a1f]"
          >
            Nouvelle classe
          </Link>
        ) : null}
      </div>

      {classes.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-12">
          <h2 className="text-lg font-medium text-ink">Aucune classe</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            Une classe, c&apos;est une section. Les élèves la rejoignent avec un lien. La première
            classe du compte est gratuite.
          </p>
          {userId ? (
            <Link
              href="/classes/new"
              className="mt-6 inline-flex rounded-full bg-navy px-4 py-2 text-sm font-medium text-[#1a1a1f]"
            >
              Créer une classe
            </Link>
          ) : (
            <Link
              href="/sign-up"
              className="mt-6 inline-flex rounded-full bg-navy px-4 py-2 text-sm font-medium text-[#1a1a1f]"
            >
              Commencer
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {classes.map((classroom: { id: string; name: string }) => {
            const summary = summaries.get(classroom.id) ?? { total: 0, nextDue: null };
            return (
              <li key={classroom.id}>
                <Link
                  href={`/classes/${classroom.id}`}
                  className="flex items-center justify-between rounded-2xl border border-line bg-paper-elevated px-5 py-4 hover:border-navy/50"
                >
                  <span>
                    <span className="block font-medium text-ink">{classroom.name}</span>
                    <span className="mt-1 block text-sm text-muted">{classSummary(summary.total, summary.nextDue)}</span>
                  </span>
                  <span className="text-muted" aria-hidden>
                    ›
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function classSummary(total: number, nextDue: string | null) {
  if (total === 0) return "Aucun devoir";
  const count = total > 1 ? `${total} devoirs` : "1 devoir";
  if (!nextDue) return `${count} · Rien à rendre`;
  return `${count} · pour le ${formatDueDate(nextDue)}`;
}
