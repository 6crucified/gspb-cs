import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getClassroomForUser } from "@/lib/classrooms";

type Params = { id: string };

export const metadata: Metadata = { title: "Classe" };

export default async function ClassPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const classroom = await getClassroomForUser(id, userId);
  if (!classroom) notFound();

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "gspb-cs.askr.workers.dev";
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const joinUrl = `${proto}://${host}/join/${classroom.slug}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/classes" className="text-sm text-navy hover:underline">
        Toutes les classes
      </Link>
      <h1 className="mt-4 font-display text-5xl font-semibold text-ink">{classroom.name}</h1>
      <p className="mt-3 text-sm text-muted">
        {classroom.members.length} {classroom.members.length > 1 ? "personnes" : "personne"}
      </p>

      <section className="mt-8 rounded-2xl border border-line bg-paper-elevated p-5">
        <h2 className="font-medium text-ink">Lien d&apos;invitation</h2>
        <p className="mt-2 text-sm text-muted">Partagez ce lien. Un élève connecté rejoint cette classe.</p>
        <p className="mt-4 break-all rounded-lg bg-black/30 px-3 py-2 font-mono text-sm text-ink">{joinUrl}</p>
      </section>

      <section className="mt-8">
        <h2 className="font-medium text-ink">Membres</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {classroom.members.map((member: { clerkUserId: string; displayName: string | null; email: string; role: string }) => (
            <li key={member.clerkUserId} className="flex items-center justify-between py-3 text-sm">
              <span className="text-ink">{member.displayName || member.email}</span>
              <span className="text-muted">{member.role === "teacher" ? "Enseignant" : "Élève"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
