import { auth } from "@clerk/nextjs/server";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser } from "@/lib/classrooms";
import { readWorkspaceFiles } from "@/lib/workspace";

async function assertWorkspaceAccess(classroomId: string, ownerId: string, userId: string) {
  const classroom = await getClassroomForUser(classroomId, userId);
  if (!classroom) return null;
  const isTeacher = isClassroomTeacher(classroom, userId);
  const isOwner = ownerId === userId;
  const watching =
    isTeacher &&
    classroom.members.some((m: { clerkUserId: string; role: string }) => m.clerkUserId === ownerId && m.role === "student");
  if (!isOwner && !watching) return null;
  return classroom;
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Connexion requise." }, { status: 401 });
  const url = new URL(request.url);
  const classroomId = url.searchParams.get("classroomId") ?? "";
  const ownerId = url.searchParams.get("ownerId") ?? "";
  const rawPaths = url.searchParams.get("paths") ?? "";
  if (!classroomId || !ownerId || !rawPaths) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (!(await assertWorkspaceAccess(classroomId, ownerId, userId))) {
    return Response.json({ error: "Accès refusé." }, { status: 403 });
  }

  const paths = rawPaths
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean)
    .slice(0, 64);
  const files = await readWorkspaceFiles(classroomId, ownerId, paths);
  return Response.json({ files });
}
