"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isClassroomTeacher } from "@/lib/assignments";
import {
  ensureProfile,
  getClassroomForUser,
  joinClassroom,
  removeStudentFromClass,
  requestToLeave,
} from "@/lib/classrooms";

export async function confirmJoinAction(formData: FormData) {
  const { userId } = await auth();
  const slug = String(formData.get("slug") ?? "");
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/join/${slug}`)}`);

  const profile = await ensureProfile(userId);
  const joined = await joinClassroom(profile, slug);
  if (!joined) redirect("/classes");
  redirect(`/classes/${joined.id}`);
}

export async function requestLeaveAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const classroomId = String(formData.get("classroomId") ?? "");
  await requestToLeave(classroomId, userId);
  redirect(`/classes/${classroomId}?depart=envoye`);
}

export async function approveLeaveAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const classroomId = String(formData.get("classroomId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const classroom = await getClassroomForUser(classroomId, userId);
  if (!classroom || !isClassroomTeacher(classroom, userId)) redirect("/classes");
  await removeStudentFromClass(classroomId, studentId);
  redirect(`/classes/${classroomId}/parametres/membres`);
}

export async function kickStudentAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const classroomId = String(formData.get("classroomId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const classroom = await getClassroomForUser(classroomId, userId);
  if (!classroom || !isClassroomTeacher(classroom, userId)) redirect("/classes");
  await removeStudentFromClass(classroomId, studentId);
  redirect(`/classes/${classroomId}/parametres/membres`);
}
