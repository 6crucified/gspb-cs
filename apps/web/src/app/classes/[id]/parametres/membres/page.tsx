import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { approveLeaveAction } from "@/app/classes/membership-actions";
import { ConfirmKick } from "@/components/confirm-kick";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser, listLeaveRequests, type ClassroomMemberRecord } from "@/lib/classrooms";

export const metadata: Metadata = { title: "Paramètres — Élèves" };

export default async function ParametresMembresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const classroom = await getClassroomForUser(id, userId);
  if (!classroom) notFound();
  const isTeacher = isClassroomTeacher(classroom, userId);
  const requests = isTeacher ? await listLeaveRequests(classroom.id) : [];

  return (
    <>
      {requests.length > 0 ? (
        <section>
          <h2 className="font-medium text-ink">Demandes de départ</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {requests.map((request: { clerkUserId: string; displayName: string | null; email: string }) => (
              <li key={request.clerkUserId} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-ink">{request.displayName || request.email}</span>
                <form action={approveLeaveAction}>
                  <input type="hidden" name="classroomId" value={classroom.id} />
                  <input type="hidden" name="studentId" value={request.clerkUserId} />
                  <button type="submit" className="rounded-full bg-navy px-3 py-1.5 text-sm font-medium text-[#1a1a1f]">
                    Accepter
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ul className={requests.length > 0 ? "mt-8 divide-y divide-line border-y border-line" : "divide-y divide-line border-y border-line"}>
        {classroom.members.map((member: ClassroomMemberRecord) => {
          const name = member.displayName || member.email;
          const student = member.role === "student";
          return (
            <li key={member.clerkUserId} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span>
                <span className="block text-ink">{name}</span>
                <span className="text-muted">{member.role === "teacher" ? "Enseignant" : member.email}</span>
              </span>
              {isTeacher && student ? (
                <span className="flex items-center gap-4">
                  <Link href={`/classes/${classroom.id}/espace?eleve=${member.clerkUserId}`} className="text-navy hover:underline">
                    Voir l&apos;espace
                  </Link>
                  <ConfirmKick classroomId={classroom.id} studentId={member.clerkUserId} studentName={name} />
                </span>
              ) : (
                <span className="text-muted">{member.role === "teacher" ? "" : "Élève"}</span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
