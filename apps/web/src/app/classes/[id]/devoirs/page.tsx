import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Devoirs } from "@/app/classes/[id]/devoirs-panel";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser, type ClassroomMemberRecord } from "@/lib/classrooms";

export const metadata: Metadata = { title: "Devoirs" };

export default async function DevoirsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string; publier?: string }>;
}) {
  const [{ id }, { erreur, publier }, session] = await Promise.all([params, searchParams, auth()]);
  const { userId } = session;
  if (!userId) redirect("/sign-in");
  const classroom = await getClassroomForUser(id, userId);
  if (!classroom) notFound();

  const isTeacher = isClassroomTeacher(classroom, userId);
  const showPublish = isTeacher && publier === "1";

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Devoirs
          classroomId={classroom.id}
          isTeacher={isTeacher}
          viewerId={userId}
          erreur={erreur}
          showPublish={showPublish}
          students={classroom.members.filter((member: ClassroomMemberRecord) => member.role === "student")}
        />
      </div>
    </div>
  );
}
