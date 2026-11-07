import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ClassParametresTabs } from "@/components/class-parametres-tabs";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser } from "@/lib/classrooms";

export default async function ClassParametresLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const classroom = await getClassroomForUser(id, userId);
  if (!classroom) notFound();
  const isTeacher = isClassroomTeacher(classroom, userId);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href={`/classes/${classroom.id}`} className="text-sm text-muted hover:text-ink">
        ‹ {classroom.name}
      </Link>
      <h1 className="mt-4 font-display text-4xl font-semibold text-ink">{isTeacher ? "Paramètres" : "Membres"}</h1>
      {isTeacher ? <ClassParametresTabs classroomId={classroom.id} isTeacher /> : null}
      <div className="mt-8">{children}</div>
    </div>
  );
}
