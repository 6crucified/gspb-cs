import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ensureProfile, findClassroomBySlug, joinClassroom } from "@/lib/classrooms";

type Params = { slug: string };

export const metadata: Metadata = { title: "Rejoindre une classe" };

export default async function JoinPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const classroom = await findClassroomBySlug(slug);
  if (!classroom) notFound();

  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-5xl font-semibold text-ink">{classroom.name}</h1>
        <p className="mt-4 text-ink-soft">Connectez-vous pour rejoindre cette classe.</p>
        <Link
          href={`/sign-in?redirect_url=${encodeURIComponent(`/join/${slug}`)}`}
          className="mt-8 inline-flex rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-[#1a1a1f]"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  const profile = await ensureProfile(userId);
  const joined = await joinClassroom(profile, slug);
  if (!joined) notFound();
  redirect(`/classes/${joined.id}`);
}
