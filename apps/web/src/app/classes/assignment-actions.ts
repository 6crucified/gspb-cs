"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  assignmentContentType,
  isAllowedAssignmentFile,
  MAX_ASSIGNMENT_FILE_BYTES,
  MAX_ASSIGNMENT_FILES,
  parseAssignmentStatus,
  parseDueDate,
  safeAssignmentFileName,
} from "@/lib/assignment-files";
import {
  createAssignment,
  deleteAssignment,
  isClassroomTeacher,
  requireClassroom,
  setAssignmentStatus,
} from "@/lib/assignments";
import type { ClassroomMemberRecord } from "@/lib/classrooms";

function classPath(classroomId: string, erreur?: string) {
  return erreur ? `/classes/${classroomId}/devoirs?erreur=${erreur}` : `/classes/${classroomId}/devoirs`;
}

export async function createAssignmentAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const classroomId = String(formData.get("classroomId") ?? "");
  const classroom = await requireClassroom(classroomId, userId);
  if (!classroom) redirect("/classes");
  if (!isClassroomTeacher(classroom, userId)) redirect(classPath(classroomId, "droit"));

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueOn = parseDueDate(String(formData.get("dueOn") ?? ""));
  if (title.length < 2 || title.length > 120) redirect(classPath(classroomId, "titre"));
  if (description.length < 2 || description.length > 2000) redirect(classPath(classroomId, "consigne"));
  if (!dueOn) redirect(classPath(classroomId, "date"));

  const uploads = formData
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0 && item.name.trim().length > 0);

  if (uploads.length > MAX_ASSIGNMENT_FILES) redirect(classPath(classroomId, "nombre"));
  if (uploads.some((file) => file.size > MAX_ASSIGNMENT_FILE_BYTES)) redirect(classPath(classroomId, "taille"));
  if (uploads.some((file) => !isAllowedAssignmentFile(file.name))) redirect(classPath(classroomId, "fichier"));

  const files = await Promise.all(
    uploads.map(async (file) => ({
      name: safeAssignmentFileName(file.name),
      bytes: await file.arrayBuffer(),
      contentType: assignmentContentType(file.name),
    })),
  );

  await createAssignment({
    classroomId,
    createdBy: userId,
    title,
    description,
    dueOn,
    files,
  });
  redirect(classPath(classroomId));
}

export async function deleteAssignmentAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const classroomId = String(formData.get("classroomId") ?? "");
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const classroom = await requireClassroom(classroomId, userId);
  if (!classroom) redirect("/classes");
  if (!isClassroomTeacher(classroom, userId)) redirect(classPath(classroomId, "droit"));

  const removed = await deleteAssignment(classroomId, assignmentId);
  redirect(classPath(classroomId, removed ? undefined : "introuvable"));
}

export async function setAssignmentStatusAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const classroomId = String(formData.get("classroomId") ?? "");
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const status = parseAssignmentStatus(String(formData.get("status") ?? ""));
  const classroom = await requireClassroom(classroomId, userId);
  if (!classroom) redirect("/classes");

  const member = classroom.members.find((item: ClassroomMemberRecord) => item.clerkUserId === userId);
  if (!status || member?.role !== "student") redirect(classPath(classroomId, "eleve"));

  const saved = await setAssignmentStatus({ classroomId, assignmentId, clerkUserId: userId, status });
  redirect(classPath(classroomId, saved ? undefined : "introuvable"));
}
