import { currentUser } from "@clerk/nextjs/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ClassroomRecord = {
  id: string;
  clerkUserId: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type ClassroomMemberRecord = {
  classroomId: string;
  clerkUserId: string;
  email: string;
  displayName: string | null;
  role: "teacher" | "student";
};

type Profile = {
  clerkUserId: string;
  email: string;
  displayName: string | null;
};

async function database() {
  const { env } = await getCloudflareContext({ async: true });
  const db = env.DB;
  if (!db) throw new Error("La base des classes n'est pas disponible.");
  return db;
}

export async function ensureProfile(clerkUserId: string): Promise<Profile> {
  const clerk = await currentUser();
  const email =
    clerk?.emailAddresses.find((item) => item.id === clerk.primaryEmailAddressId)?.emailAddress ??
    clerk?.emailAddresses[0]?.emailAddress ??
    `${clerkUserId}@users.gspb`;
  const displayName = [clerk?.firstName, clerk?.lastName].filter(Boolean).join(" ") || null;
  return { clerkUserId, email, displayName };
}

export function classroomSlug(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "classe"}-${suffix}`;
}

function mapClass(row: Record<string, string>): ClassroomRecord {
  return {
    id: row.id,
    clerkUserId: row.clerk_user_id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
  };
}

export async function listClassrooms(clerkUserId: string) {
  const db = await database();
  const result = await db
    .prepare(
      `SELECT c.id, c.clerk_user_id, c.name, c.slug, c.created_at
       FROM classrooms c
       LEFT JOIN classroom_members m ON m.classroom_id = c.id AND m.clerk_user_id = ?
       WHERE c.clerk_user_id = ? OR m.clerk_user_id IS NOT NULL
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
    )
    .bind(clerkUserId, clerkUserId)
    .all<Record<string, string>>();
  return (result.results ?? []).map((row: Record<string, string>) => mapClass(row));
}

export async function createClassroom(owner: Profile, name: string) {
  const db = await database();
  const classroom: ClassroomRecord = {
    id: crypto.randomUUID(),
    clerkUserId: owner.clerkUserId,
    name,
    slug: classroomSlug(name),
    createdAt: new Date().toISOString(),
  };
  await db.batch([
    db
      .prepare(
        `INSERT INTO classrooms (id, clerk_user_id, name, slug, created_at) VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(classroom.id, classroom.clerkUserId, classroom.name, classroom.slug, classroom.createdAt),
    db
      .prepare(
        `INSERT INTO classroom_members (classroom_id, clerk_user_id, email, display_name, role)
         VALUES (?, ?, ?, ?, 'teacher')`,
      )
      .bind(classroom.id, owner.clerkUserId, owner.email, owner.displayName),
  ]);
  return classroom;
}

export async function getClassroomForUser(id: string, clerkUserId: string) {
  const db = await database();
  const classroom = await db
    .prepare(
      `SELECT c.id, c.clerk_user_id, c.name, c.slug, c.created_at
       FROM classrooms c
       LEFT JOIN classroom_members m ON m.classroom_id = c.id AND m.clerk_user_id = ?
       WHERE c.id = ? AND (c.clerk_user_id = ? OR m.clerk_user_id IS NOT NULL)`,
    )
    .bind(clerkUserId, id, clerkUserId)
    .first<Record<string, string>>();
  if (!classroom) return null;

  const members = await db
    .prepare(
      `SELECT classroom_id, clerk_user_id, email, display_name, role
       FROM classroom_members WHERE classroom_id = ? ORDER BY role DESC, email`,
    )
    .bind(id)
    .all<Record<string, string>>();

  return {
    ...mapClass(classroom),
    members: (members.results ?? []).map((row: Record<string, string>): ClassroomMemberRecord => ({
        classroomId: row.classroom_id,
        clerkUserId: row.clerk_user_id,
        email: row.email,
        displayName: row.display_name,
        role: row.role === "teacher" ? "teacher" : "student",
      }),
    ),
  };
}

export async function findClassroomBySlug(slug: string) {
  const db = await database();
  const row = await db
    .prepare(`SELECT id, clerk_user_id, name, slug, created_at FROM classrooms WHERE slug = ?`)
    .bind(slug)
    .first<Record<string, string>>();
  return row ? mapClass(row) : null;
}

export async function joinClassroom(user: Profile, slug: string) {
  const classroom = await findClassroomBySlug(slug);
  if (!classroom) return null;
  const db = await database();
  await db
    .prepare(
      `INSERT INTO classroom_members (classroom_id, clerk_user_id, email, display_name, role)
       VALUES (?, ?, ?, ?, 'student')
       ON CONFLICT(classroom_id, clerk_user_id) DO NOTHING`,
    )
    .bind(classroom.id, user.clerkUserId, user.email, user.displayName)
    .run();
  return classroom;
}
