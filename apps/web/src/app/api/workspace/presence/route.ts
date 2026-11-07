import { auth } from "@clerk/nextjs/server";
import { readJsonBody, payloadTooLarge } from "@/lib/request-payload";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser } from "@/lib/classrooms";
import { getWorkspaceRev } from "@/lib/workspace-meta";
import {
  clearWorkspacePresence,
  getTeacherPresenceDetail,
  isTeacherPresentInWorkspace,
  touchWorkspacePresence,
  type WorkspaceCursor,
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
  const detail = teacherActive ? await getTeacherPresenceDetail(classroomId, ownerId) : null;
  const rev = await getWorkspaceRev(classroomId, ownerId);
  return Response.json({
    teacherActive,
    rev,
    cursor: detail
      ? {
          activePath: detail.activePath,
          headLine: detail.headLine,
          headCol: detail.headCol,
        }
      : null,
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Connexion requise." }, { status: 401 });
  const blocked = payloadTooLarge(request);
  if (blocked) return blocked;
  const parsed = await readJsonBody<{
    classroomId?: string;
    ownerId?: string;
    cursor?: WorkspaceCursor;
  }>(request);
  if (parsed instanceof Response) return parsed;
  const body = parsed;
  const classroomId = body?.classroomId ?? "";
  const ownerId = body?.ownerId ?? "";
  if (!body || !classroomId || !ownerId) return Response.json({ error: "Requête invalide." }, { status: 400 });

  const classroom = await getClassroomForUser(classroomId, userId);
  if (!classroom || !isClassroomTeacher(classroom, userId)) {
    return Response.json({ error: "Accès refusé." }, { status: 403 });
  }
  if (ownerId === userId) return Response.json({ ok: true });
  const student = classroom.members.some((m: { clerkUserId: string; role: string }) => m.clerkUserId === ownerId && m.role === "student");
  if (!student) return Response.json({ error: "Accès refusé." }, { status: 403 });

  const rev = body.cursor?.filesRev ?? (await getWorkspaceRev(classroomId, ownerId));
  await touchWorkspacePresence(classroomId, ownerId, userId, "teacher", body.cursor ? { ...body.cursor, filesRev: rev } : undefined);
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
