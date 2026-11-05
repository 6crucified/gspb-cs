"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClassroom, ensureProfile } from "@/lib/classrooms";

export async function createClassroomAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) {
    redirect("/classes/new?error=nom");
  }

  const profile = await ensureProfile(userId);
  const classroom = await createClassroom(profile, name);
  redirect(`/classes/${classroom.id}`);
}
