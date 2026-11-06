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

const LEAVE_SCHEMA = `CREATE TABLE IF NOT EXISTS leave_requests (
  classroom_id TEXT NOT NULL,
  clerk_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (classroom_id, clerk_user_id)
)`;

let leaveSchemaReady: Promise<void> | null = null;

function ensureLeaveSchema() {
  if (!leaveSchemaReady) {
    leaveSchemaReady = (async () => {
      const db = await database();
      await db.prepare(LEAVE_SCHEMA).run();
    })().catch((error: unknown) => {
      leaveSchemaReady = null;
      throw error;
    });
  }
  return leaveSchemaReady;
}

export async function findClassroomTeacher(classroomId: string) {
  const db = await database();
  const row = await db
    .prepare(
      `SELECT email, display_name FROM classroom_members
       WHERE classroom_id = ? AND role = 'teacher' ORDER BY email LIMIT 1`,
    )
    .bind(classroomId)
    .first<{ email: string; display_name: string | null }>();
  return row ? { email: row.email, displayName: row.display_name } : null;
}

export async function requestToLeave(classroomId: string, clerkUserId: string) {
  await ensureLeaveSchema();
  const classroom = await getClassroomForUser(classroomId, clerkUserId);
  const member = classroom?.members.find((item: ClassroomMemberRecord) => item.clerkUserId === clerkUserId);
  if (!classroom || member?.role !== "student") return false;
  const db = await database();
  await db
    .prepare(
      `INSERT INTO leave_requests (classroom_id, clerk_user_id, created_at)
       VALUES (?, ?, ?)
       ON CONFLICT(classroom_id, clerk_user_id) DO NOTHING`,
    )
    .bind(classroomId, clerkUserId, new Date().toISOString())
    .run();
  return true;
}

export async function hasLeaveRequest(classroomId: string, clerkUserId: string) {
  await ensureLeaveSchema();
  const db = await database();
  const row = await db
    .prepare(`SELECT 1 AS ok FROM leave_requests WHERE classroom_id = ? AND clerk_user_id = ?`)
    .bind(classroomId, clerkUserId)
    .first<{ ok: number }>();
  return Boolean(row);
}

export async function listLeaveRequests(classroomId: string) {
  await ensureLeaveSchema();
  const db = await database();
  const rows = await db
    .prepare(
      `SELECT r.clerk_user_id, r.created_at, m.email, m.display_name
       FROM leave_requests r
       JOIN classroom_members m ON m.classroom_id = r.classroom_id AND m.clerk_user_id = r.clerk_user_id
       WHERE r.classroom_id = ?
       ORDER BY r.created_at`,
    )
    .bind(classroomId)
    .all<Record<string, string>>();
  return (rows.results ?? []).map((row: Record<string, string>) => ({
    clerkUserId: row.clerk_user_id,
    createdAt: row.created_at,
    email: row.email,
    displayName: row.display_name,
  }));
}

async function ensureStudentDataTables() {
  const db = await database();
  await db.batch([
    db.prepare(
      `CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        classroom_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        due_on TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS assignment_statuses (
        assignment_id TEXT NOT NULL,
        clerk_user_id TEXT NOT NULL,
        status TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (assignment_id, clerk_user_id)
      )`,
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS workspace_files (
        classroom_id TEXT NOT NULL,
        clerk_user_id TEXT NOT NULL,
        path TEXT NOT NULL,
        text TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (classroom_id, clerk_user_id, path)
      )`,
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS workspace_runs (
        classroom_id TEXT NOT NULL,
        clerk_user_id TEXT NOT NULL,
        stdout TEXT NOT NULL,
        stderr TEXT NOT NULL,
        exit_code INTEGER NOT NULL,
        ran_at TEXT NOT NULL,
        PRIMARY KEY (classroom_id, clerk_user_id)
      )`,
    ),
  ]);
}

export async function removeStudentFromClass(classroomId: string, clerkUserId: string) {
  await ensureLeaveSchema();
  await ensureStudentDataTables();
  const db = await database();
  const member = await db
    .prepare(`SELECT role FROM classroom_members WHERE classroom_id = ? AND clerk_user_id = ?`)
    .bind(classroomId, clerkUserId)
    .first<{ role: string }>();
  if (!member || member.role === "teacher") return false;

  await db.batch([
    db
      .prepare(
        `DELETE FROM assignment_statuses
         WHERE clerk_user_id = ?
           AND assignment_id IN (SELECT id FROM assignments WHERE classroom_id = ?)`,
      )
      .bind(clerkUserId, classroomId),
    db
      .prepare(`DELETE FROM workspace_files WHERE classroom_id = ? AND clerk_user_id = ?`)
      .bind(classroomId, clerkUserId),
    db
      .prepare(`DELETE FROM workspace_runs WHERE classroom_id = ? AND clerk_user_id = ?`)
      .bind(classroomId, clerkUserId),
    db
      .prepare(`DELETE FROM leave_requests WHERE classroom_id = ? AND clerk_user_id = ?`)
      .bind(classroomId, clerkUserId),
    db
      .prepare(`DELETE FROM classroom_members WHERE classroom_id = ? AND clerk_user_id = ? AND role = 'student'`)
      .bind(classroomId, clerkUserId),
  ]);
  return true;
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
