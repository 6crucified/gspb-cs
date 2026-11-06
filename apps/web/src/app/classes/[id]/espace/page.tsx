import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Ide } from "@/components/ide";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser, type ClassroomMemberRecord } from "@/lib/classrooms";
import { readWorkspace } from "@/lib/workspace";

export const metadata: Metadata = { title: "Espace" };

export default async function EspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ eleve?: string }>;
}) {
  const [{ id }, { eleve }, session] = await Promise.all([params, searchParams, auth()]);
  const { userId } = session;
  if (!userId) redirect("/sign-in");
  const classroom = await getClassroomForUser(id, userId);
  if (!classroom) notFound();
  const students = classroom.members.filter((member: ClassroomMemberRecord) => member.role === "student");
  const watching = Boolean(
    eleve && isClassroomTeacher(classroom, userId) && students.some((student: ClassroomMemberRecord) => student.clerkUserId === eleve),
  );
  const ownerId = watching ? eleve! : userId;
  const workspace = await readWorkspace(classroom.id, ownerId);

  return (
    <Ide
      key={ownerId}
      classroomId={classroom.id}
      ownerId={ownerId}
      readOnly={watching}
      isTeacher={isClassroomTeacher(classroom, userId)}
      students={students.map((student: ClassroomMemberRecord) => ({
        clerkUserId: student.clerkUserId,
        displayName: student.displayName,
        email: student.email,
      }))}
      initialFiles={workspace.files}
      initialRun={workspace.run}
    />
  );
}
