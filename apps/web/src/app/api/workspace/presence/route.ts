import { auth } from "@clerk/nextjs/server";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser } from "@/lib/classrooms";
import {
  clearWorkspacePresence,
  isTeacherPresentInWorkspace,
  touchWorkspacePresence,
} from "@/lib/workspace-presence";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Connexion requise." }, { status: 401 });
  const url = new URL(request.url);
  const classroomId = url.searchParams.get("classroomId") ?? "";
  const ownerId = url.searchParams.get("ownerId") ?? "";
  if (!classroomId || !ownerId) return Response.json({ error: "Requête invalide." }, { status: 400 });

  const classroom = await getClassroomForUser(classroomId, userId);
  if (!classroom) return Response.json({ error: "Accès refusé." }, { status: 403 });

  const isTeacher = isClassroomTeacher(classroom, userId);
  const isOwner = ownerId === userId;
  const watchingStudent =
    isTeacher &&
    classroom.members.some((m: { clerkUserId: string; role: string }) => m.clerkUserId === ownerId && m.role === "student");
  if (!isOwner && !watchingStudent && !isTeacher) {
    return Response.json({ error: "Accès refusé." }, { status: 403 });
  }

  const teacherActive = await isTeacherPresentInWorkspace(classroomId, ownerId);
  return Response.json({ teacherActive });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Connexion requise." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { classroomId?: string; ownerId?: string } | null;
  const classroomId = body?.classroomId ?? "";
  const ownerId = body?.ownerId ?? "";
  if (!classroomId || !ownerId) return Response.json({ error: "Requête invalide." }, { status: 400 });

  const classroom = await getClassroomForUser(classroomId, userId);
  if (!classroom || !isClassroomTeacher(classroom, userId)) {
    return Response.json({ error: "Accès refusé." }, { status: 403 });
  }
  if (ownerId === userId) return Response.json({ ok: true });
  const student = classroom.members.some((m: { clerkUserId: string; role: string }) => m.clerkUserId === ownerId && m.role === "student");
  if (!student) return Response.json({ error: "Accès refusé." }, { status: 403 });

  await touchWorkspacePresence(classroomId, ownerId, userId, "teacher");
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Connexion requise." }, { status: 401 });
  const url = new URL(request.url);
  const classroomId = url.searchParams.get("classroomId") ?? "";
  const ownerId = url.searchParams.get("ownerId") ?? "";
  if (!classroomId || !ownerId) return Response.json({ error: "Requête invalide." }, { status: 400 });

  const classroom = await getClassroomForUser(classroomId, userId);
  if (!classroom || !isClassroomTeacher(classroom, userId)) {
    return Response.json({ error: "Accès refusé." }, { status: 403 });
  }
  await clearWorkspacePresence(classroomId, ownerId, userId);
  return Response.json({ ok: true });
}
