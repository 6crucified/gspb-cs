import { auth } from "@clerk/nextjs/server";
import { isClassroomTeacher } from "@/lib/assignments";
import { getClassroomForUser } from "@/lib/classrooms";
import { readJsonBody, payloadTooLarge } from "@/lib/request-payload";
import {
  filterWorkspaceFiles,
  workspaceContentFiles,
  workspaceFolderMarkers,
} from "@/lib/workspace-sync-filter";
import { compactSessionFiles } from "@/lib/workspace-payload";
import { isIgnoredWorkspacePath, isSafeWorkspacePath } from "@/lib/workspace-path";
import {
  callSession,
  deleteWorkspaceFilesBatch,
  saveWorkspaceFilesBatch,
  type WorkspaceFile,
} from "@/lib/workspace";

async function targetUser(viewerId: string, classroomId: string, studentId: string | undefined) {
  const classroom = await getClassroomForUser(classroomId, viewerId);
  if (!classroom) return null;
  if (!studentId || studentId === viewerId) return { userId: viewerId, readOnly: false, classroomId };
  const teacher = isClassroomTeacher(classroom, viewerId);
  const student = classroom.members.some((member: { clerkUserId: string; role: string }) => member.clerkUserId === studentId && member.role === "student");
  if (!teacher || !student) return null;
  return { userId: studentId, readOnly: false, classroomId };
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Connexion requise." }, { status: 401 });
  const url = new URL(request.url);
  const target = await targetUser(userId, url.searchParams.get("classroomId") ?? "", url.searchParams.get("ownerId") ?? undefined);
  if (!target) return Response.json({ error: "Accès refusé." }, { status: 403 });
  const result = await callSession(target.userId, "/session/output", { session: url.searchParams.get("session") ?? "1" });
  return Response.json(result);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Connexion requise." }, { status: 401 });
  const blocked = payloadTooLarge(request);
  if (blocked) return blocked;

  const body = await readJsonBody<{
    op?: string;
    classroomId?: string;
    ownerId?: string;
    files?: WorkspaceFile[];
    command?: string;
    data?: string;
    session?: string;
    removed?: string[];
  }>(request);
  if (body instanceof Response) return body;

  if (!body?.classroomId || !body.op) return Response.json({ error: "Requête invalide." }, { status: 400 });
  const target = await targetUser(userId, body.classroomId, body.ownerId);
  if (!target) return Response.json({ error: "Accès refusé." }, { status: 403 });
  if (target.readOnly && body.op !== "output") return Response.json({ error: "Lecture seule." }, { status: 403 });

  const sessionId = body.session === "2" || body.session === "3" ? body.session : "1";
  const stored = filterWorkspaceFiles(body.files);
  const files = compactSessionFiles(workspaceContentFiles(stored));
  const markers = workspaceFolderMarkers(stored);
  const removed = (body.removed ?? []).filter((path) => isSafeWorkspacePath(path) && !isIgnoredWorkspacePath(path));
  if (body.op === "open" || body.op === "run" || body.op === "move") {
    await Promise.all([
      deleteWorkspaceFilesBatch(target.classroomId, target.userId, removed),
      saveWorkspaceFilesBatch(target.classroomId, target.userId, [...files, ...markers]),
    ]);
  }

  if (body.op === "input") {
    return Response.json(await callSession(target.userId, "/session/input", { data: String(body.data ?? "").slice(0, 8000), session: sessionId }));
  }
  if (body.op === "open" || body.op === "move") {
    return Response.json(await callSession(target.userId, "/session/open", { files, removed, session: sessionId }));
  }
  if (body.op === "run") {
    const command = String(body.command ?? "").slice(0, 400);
    return Response.json(await callSession(target.userId, "/session/run", { files, command, session: sessionId }));
  }
  return Response.json({ error: "Requête invalide." }, { status: 400 });
}
