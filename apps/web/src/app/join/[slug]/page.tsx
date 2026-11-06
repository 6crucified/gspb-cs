import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { confirmJoinAction } from "@/app/classes/membership-actions";
import { findClassroomBySlug, findClassroomTeacher, getClassroomForUser } from "@/lib/classrooms";

type Params = { slug: string };

export const metadata: Metadata = { title: "Rejoindre une classe" };

export default async function JoinPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const classroom = await findClassroomBySlug(slug);
  if (!classroom) notFound();
  const teacher = await findClassroomTeacher(classroom.id);
  const teacherEmail = teacher?.email || "l'enseignant";

  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-5xl font-semibold text-ink">{classroom.name}</h1>
        <p className="mt-4 text-ink-soft">Connectez-vous pour voir l&apos;invitation.</p>
        <Link
          href={`/sign-in?redirect_url=${encodeURIComponent(`/join/${slug}`)}`}
          className="mt-8 inline-flex rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-[#1a1a1f]"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  const existing = await getClassroomForUser(classroom.id, userId);
  if (existing) redirect(`/classes/${classroom.id}`);

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <p className="text-sm text-muted">Invitation</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">Rejoindre cette classe ?</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        Voulez-vous rejoindre la classe « {classroom.name} » de {teacherEmail} ?
      </p>
      <div className="mt-8 flex gap-3">
        <form action={confirmJoinAction}>
          <input type="hidden" name="slug" value={slug} />
          <button type="submit" className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-[#1a1a1f]">
            Rejoindre
          </button>
        </form>
        <Link href="/classes" className="rounded-full border border-line px-5 py-2.5 text-sm text-ink">
          Annuler
        </Link>
      </div>
    </div>
  );
}
