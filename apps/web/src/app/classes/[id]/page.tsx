import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isClassroomTeacher, listAssignments } from "@/lib/assignments";
import { formatDueDate, statusLabel, type AssignmentStatus } from "@/lib/assignment-files";
import { ConfirmLeave } from "@/components/confirm-leave";
import { getClassroomForUser, hasLeaveRequest, type ClassroomMemberRecord } from "@/lib/classrooms";

export const metadata: Metadata = { title: "Classe" };

export default async function ClassHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ depart?: string }>;
}) {
  const [{ id }, { depart }] = await Promise.all([params, searchParams]);
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const classroom = await getClassroomForUser(id, userId);
  if (!classroom) notFound();
  const leavePending = !isClassroomTeacher(classroom, userId) && (await hasLeaveRequest(classroom.id, userId));

  const isTeacher = isClassroomTeacher(classroom, userId);
  const students = classroom.members.filter((member: ClassroomMemberRecord) => member.role === "student");
  const teacher = classroom.members.find((member: ClassroomMemberRecord) => member.role === "teacher");
  const assignments = await listAssignments(classroom.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/classes" className="text-sm text-muted hover:text-ink">
        ‹ Classes
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-semibold text-ink">{classroom.name}</h1>
          <p className="mt-3 text-sm text-muted">
            Enseignée par {teacher?.displayName || teacher?.email || "l'enseignant"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/classes/${classroom.id}/espace`}
            className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-[#1a1a1f]"
          >
            Ouvrir l&apos;espace
          </Link>
          {isTeacher ? null : leavePending ? (
            <span className="rounded-full border border-line px-3 py-2 text-sm text-muted">Demande envoyée</span>
          ) : (
            <ConfirmLeave classroomId={classroom.id} className={classroom.name} />
          )}
          <Link
            href={`/classes/${classroom.id}/parametres`}
            className="rounded-full border border-line px-3 py-2 text-sm text-ink"
          >
            Paramètres
          </Link>
        </div>
      </div>
      {depart === "envoye" ? (
        <p className="mt-4 text-sm text-muted">Votre demande de départ a été envoyée à l&apos;enseignant.</p>
      ) : null}

      <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {assignments.length === 0 ? (
          <li className="px-5 py-8 text-sm text-muted">
            Aucun devoir.{" "}
            {isTeacher ? (
              <Link href={`/classes/${classroom.id}/devoirs`} className="text-navy hover:underline">
                En publier un
              </Link>
            ) : null}
          </li>
        ) : (
          assignments.map((assignment) => {
            const done = students.filter((student: ClassroomMemberRecord) => statusFor(assignment.statuses, student.clerkUserId) === "done").length;
            const mine = statusFor(assignment.statuses, userId);
            return (
              <li key={assignment.id}>
                <Link href={`/classes/${classroom.id}/devoirs`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/5">
                  <span>
                    <span className="block font-medium text-ink">{assignment.title}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {isTeacher ? `${done} sur ${students.length} ont marqué Fait` : statusLabel(mine)}
                    </span>
                  </span>
                  <span className="text-right text-sm text-muted">
                    {formatDueDate(assignment.dueOn)}
                    <span className="ml-3 text-ink">›</span>
                  </span>
                </Link>
              </li>
            );
          })
        )}
      </ul>
      {isTeacher && assignments.length > 0 ? (
        <Link href={`/classes/${classroom.id}/devoirs`} className="mt-4 inline-block text-sm text-navy hover:underline">
          Gérer les devoirs
        </Link>
      ) : null}
    </div>
  );
}

function statusFor(statuses: { clerkUserId: string; status: AssignmentStatus }[], clerkUserId: string): AssignmentStatus {
  return statuses.find((item) => item.clerkUserId === clerkUserId)?.status ?? "todo";
}
