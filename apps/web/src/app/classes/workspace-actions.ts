"use server";

import { auth } from "@clerk/nextjs/server";
import { requireClassroom } from "@/lib/assignments";
import {
  isSafeWorkspacePath,
  runWorkspace,
  saveWorkspaceFile,
  saveWorkspaceRun,
  type WorkspaceFile,
  type WorkspaceRun,
} from "@/lib/workspace";

export async function runIde(input: {
  classroomId: string;
  entry: string;
  files: WorkspaceFile[];
}): Promise<WorkspaceRun> {
  const failed = (stderr: string): WorkspaceRun => ({
    stdout: "",
    stderr,
    exitCode: 1,
    ranAt: new Date().toISOString(),
  });

  const { userId } = await auth();
  if (!userId) return failed("Connexion requise.");

  const classroom = await requireClassroom(input.classroomId, userId);
  if (!classroom) return failed("Classe introuvable.");
  if (!isSafeWorkspacePath(input.entry) || !input.entry.endsWith(".py")) {
    return failed("Choisis un fichier Python à lancer.");
  }

  const files = input.files.filter((file) => isSafeWorkspacePath(file.path) && file.text.length <= 100_000);
  if (!files.some((file) => file.path === input.entry)) return failed("Fichier introuvable.");

  for (const file of files) {
    await saveWorkspaceFile(input.classroomId, userId, file.path, file.text);
  }

  const run = await runWorkspace(userId, files, input.entry);
  await saveWorkspaceRun(input.classroomId, userId, run);
  return run;
}
