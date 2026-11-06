import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getClassroomForUser } from "@/lib/classrooms";

export default async function ClassLayout({
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
  return children;
}
