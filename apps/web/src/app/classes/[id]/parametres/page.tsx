import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser } from "@/lib/classrooms";

export default async function ParametresIndexPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const classroom = await getClassroomForUser(id, userId);
  if (!classroom) redirect("/classes");
  const dest = isClassroomTeacher(classroom, userId) ? "invitation" : "membres";
  redirect(`/classes/${id}/parametres/${dest}`);
}
