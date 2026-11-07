import { auth } from "@clerk/nextjs/server";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser } from "@/lib/classrooms";
import { readJsonBody, payloadTooLarge } from "@/lib/request-payload";
import {
  filterWorkspaceFiles,
  workspaceContentFiles,
  workspaceFolderMarkers,
} from "@/lib/workspace-sync-filter";
import { bumpWorkspaceRev, getWorkspaceRev } from "@/lib/workspace-meta";
import { listWorkspacePaths, readWorkspaceFiles, saveWorkspaceFilesBatch, type WorkspaceFile } from "@/lib/workspace";

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
  const includeContent = url.searchParams.get("content") === "1";
  if (!classroomId || !ownerId) return Response.json({ error: "Requête invalide." }, { status: 400 });
  if (!(await assertWorkspaceAccess(classroomId, ownerId, userId))) {
    return Response.json({ error: "Accès refusé." }, { status: 403 });
  }
  const rev = await getWorkspaceRev(classroomId, ownerId);
  if (rev <= clientRev) return Response.json({ unchanged: true, rev });
  const paths = await listWorkspacePaths(classroomId, ownerId);
  if (!includeContent) return Response.json({ rev, paths });
  const files = await readWorkspaceFiles(classroomId, ownerId, paths);
  return Response.json({ rev, paths, files });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Connexion requise." }, { status: 401 });
  const blocked = payloadTooLarge(request);
  if (blocked) return blocked;

  const body = await readJsonBody<{
    classroomId?: string;
    ownerId?: string;
    files?: WorkspaceFile[];
  }>(request);
  if (body instanceof Response) return body;

  const classroomId = body?.classroomId ?? "";
  const ownerId = body?.ownerId ?? "";
  if (!classroomId || !ownerId || !body?.files) return Response.json({ error: "Requête invalide." }, { status: 400 });
  if (!(await assertWorkspaceAccess(classroomId, ownerId, userId))) {
    return Response.json({ error: "Accès refusé." }, { status: 403 });
  }

  const stored = filterWorkspaceFiles(body.files);
  const toWrite = [...workspaceContentFiles(stored), ...workspaceFolderMarkers(stored)];
  await saveWorkspaceFilesBatch(classroomId, ownerId, toWrite);
  const rev = await bumpWorkspaceRev(classroomId, ownerId);
  return Response.json({ ok: true, rev });
}
