import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser } from "@/lib/classrooms";

export const metadata: Metadata = { title: "Paramètres — Classe" };

export default async function ParametresInvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const [classroom, headerList] = await Promise.all([getClassroomForUser(id, userId), headers()]);
  if (!classroom) notFound();
  if (!isClassroomTeacher(classroom, userId)) redirect(`/classes/${classroom.id}/parametres/membres`);
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "gspb.codes";
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const joinUrl = `${proto}://${host}/join/${classroom.slug}`;

  return (
    <section className="rounded-2xl border border-line bg-paper-elevated p-5">
      <h2 className="font-medium text-ink">Lien d&apos;invitation</h2>
      <p className="mt-2 text-sm text-muted">
        Partagez ce lien. L&apos;élève confirme avant de rejoindre la classe.
      </p>
      <p className="mt-4 break-all rounded-lg bg-black/30 px-3 py-2 font-mono text-sm text-ink">{joinUrl}</p>
    </section>
  );
}
