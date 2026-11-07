import { auth } from "@clerk/nextjs/server";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser } from "@/lib/classrooms";
import { bumpWorkspaceRev, getWorkspaceRev } from "@/lib/workspace-meta";
import { isSafeWorkspacePath, readWorkspace, saveWorkspaceFile, type WorkspaceFile } from "@/lib/workspace";

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
  const clientRev = Number(url.searchParams.get("rev") ?? "0");
  if (!classroomId || !ownerId) return Response.json({ error: "Requête invalide." }, { status: 400 });
  if (!(await assertWorkspaceAccess(classroomId, ownerId, userId))) {
    return Response.json({ error: "Accès refusé." }, { status: 403 });
  }
  const rev = await getWorkspaceRev(classroomId, ownerId);
  if (rev <= clientRev) return Response.json({ unchanged: true, rev });
  const workspace = await readWorkspace(classroomId, ownerId);
  return Response.json({ rev, files: workspace.files });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Connexion requise." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    classroomId?: string;
    ownerId?: string;
    files?: WorkspaceFile[];
  } | null;
  const classroomId = body?.classroomId ?? "";
  const ownerId = body?.ownerId ?? "";
  if (!classroomId || !ownerId || !body?.files) return Response.json({ error: "Requête invalide." }, { status: 400 });
  if (!(await assertWorkspaceAccess(classroomId, ownerId, userId))) {
    return Response.json({ error: "Accès refusé." }, { status: 403 });
  }

  const stored = body.files.filter((file) => isSafeWorkspacePath(file.path) && file.text.length <= 100_000);
  for (const file of stored) {
    if (file.path.endsWith("/.folder") || file.path === ".folder") continue;
    await saveWorkspaceFile(classroomId, ownerId, file.path, file.text);
  }
  const rev = await bumpWorkspaceRev(classroomId, ownerId);
  return Response.json({ ok: true, rev });
}
