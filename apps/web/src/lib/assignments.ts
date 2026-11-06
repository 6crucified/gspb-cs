import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getClassroomForUser, type ClassroomMemberRecord, type ClassroomRecord } from "@/lib/classrooms";
import type { AssignmentStatus } from "@/lib/assignment-files";

export type AssignmentFileRecord = {
  id: string;
  assignmentId: string;
  name: string;
  sizeBytes: number;
};

export type AssignmentStatusRecord = {
  assignmentId: string;
  clerkUserId: string;
  status: AssignmentStatus;
};

export type AssignmentRecord = {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  dueOn: string;
  createdAt: string;
  files: AssignmentFileRecord[];
  statuses: AssignmentStatusRecord[];
};

export type ClassroomWithMembers = ClassroomRecord & { members: ClassroomMemberRecord[] };

type AssignmentFileInput = {
  name: string;
  bytes: ArrayBuffer;
  contentType: string;
};

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_on TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS assignments_classroom_idx ON assignments (classroom_id, due_on)`,
  `CREATE TABLE IF NOT EXISTS assignment_files (
    id TEXT PRIMARY KEY,
    assignment_id TEXT NOT NULL,
    classroom_id TEXT NOT NULL,
    name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    bytes BLOB NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS assignment_files_assignment_idx ON assignment_files (assignment_id)`,
  `CREATE TABLE IF NOT EXISTS assignment_statuses (
    assignment_id TEXT NOT NULL,
    clerk_user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (assignment_id, clerk_user_id)
  )`,
];

let schemaReady: Promise<void> | null = null;

async function database() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) throw new Error("La base des classes n'est pas disponible.");
  return env.DB;
}

function blobBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  throw new Error("Pièce jointe illisible.");
}

export function ensureAssignmentSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = await database();
      await db.batch(SCHEMA.map((sql) => db.prepare(sql)));
    })().catch((error: unknown) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export function isClassroomTeacher(classroom: ClassroomWithMembers, userId: string) {
  return (
    classroom.clerkUserId === userId ||
    classroom.members.some((member) => member.clerkUserId === userId && member.role === "teacher")
  );
}

export async function summarizeClassrooms(classroomIds: string[]) {
  const empty = new Map<string, { total: number; nextDue: string | null }>();
  if (classroomIds.length === 0) return empty;
  await ensureAssignmentSchema();
  const db = await database();
  const today = new Date().toISOString().slice(0, 10);
  const marks = classroomIds.map(() => "?").join(", ");
  const rows = await db
    .prepare(
      `SELECT classroom_id, COUNT(*) AS total,
              MIN(CASE WHEN due_on >= ? THEN due_on END) AS next_due
       FROM assignments
       WHERE classroom_id IN (${marks})
       GROUP BY classroom_id`,
    )
    .bind(today, ...classroomIds)
    .all<Record<string, string | number | null>>();
  for (const row of rows.results ?? []) {
    empty.set(String(row.classroom_id), {
      total: Number(row.total ?? 0),
      nextDue: row.next_due ? String(row.next_due) : null,
    });
  }
  return empty;
}

export async function requireClassroom(classroomId: string, userId: string) {
  const classroom = await getClassroomForUser(classroomId, userId);
  return classroom;
}

export async function listAssignments(classroomId: string): Promise<AssignmentRecord[]> {
  await ensureAssignmentSchema();
  const db = await database();
  const [assignments, files, statuses] = await Promise.all([
    db
      .prepare(
        `SELECT id, classroom_id, title, description, due_on, created_at
         FROM assignments WHERE classroom_id = ? ORDER BY due_on ASC, created_at DESC`,
      )
      .bind(classroomId)
      .all<Record<string, string>>(),
    db
      .prepare(
        `SELECT id, assignment_id, name, size_bytes
         FROM assignment_files WHERE classroom_id = ? ORDER BY name`,
      )
      .bind(classroomId)
      .all<Record<string, string | number>>(),
    db
      .prepare(
        `SELECT s.assignment_id, s.clerk_user_id, s.status
         FROM assignment_statuses s
         JOIN assignments a ON a.id = s.assignment_id
         WHERE a.classroom_id = ?`,
      )
      .bind(classroomId)
      .all<Record<string, string>>(),
  ]);

  const filesByAssignment = new Map<string, AssignmentFileRecord[]>();
  for (const row of files.results ?? []) {
    const assignmentId = String(row.assignment_id);
    const list = filesByAssignment.get(assignmentId) ?? [];
    list.push({
      id: String(row.id),
      assignmentId,
      name: String(row.name),
      sizeBytes: Number(row.size_bytes),
    });
    filesByAssignment.set(assignmentId, list);
  }

  const statusesByAssignment = new Map<string, AssignmentStatusRecord[]>();
  for (const row of statuses.results ?? []) {
    const status = row.status === "done" ? "done" : "todo";
    const assignmentId = String(row.assignment_id);
    const list = statusesByAssignment.get(assignmentId) ?? [];
    list.push({ assignmentId, clerkUserId: String(row.clerk_user_id), status });
    statusesByAssignment.set(assignmentId, list);
  }

  return (assignments.results ?? []).map((row: Record<string, string>) => ({
    id: row.id,
    classroomId: row.classroom_id,
    title: row.title,
    description: row.description,
    dueOn: row.due_on,
    createdAt: row.created_at,
    files: filesByAssignment.get(row.id) ?? [],
    statuses: statusesByAssignment.get(row.id) ?? [],
  }));
}

export async function createAssignment(input: {
  classroomId: string;
  createdBy: string;
  title: string;
  description: string;
  dueOn: string;
  files: AssignmentFileInput[];
}) {
  await ensureAssignmentSchema();
  const db = await database();
  const assignmentId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO assignments (id, classroom_id, title, description, due_on, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(assignmentId, input.classroomId, input.title, input.description, input.dueOn, input.createdBy, createdAt)
    .run();

  try {
    for (const file of input.files) {
      await db
        .prepare(
          `INSERT INTO assignment_files
           (id, assignment_id, classroom_id, name, content_type, size_bytes, bytes, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          assignmentId,
          input.classroomId,
          file.name,
          file.contentType,
          file.bytes.byteLength,
          blobBytes(file.bytes),
          createdAt,
        )
        .run();
    }
  } catch (error) {
    await db.batch([
      db.prepare(`DELETE FROM assignment_files WHERE assignment_id = ?`).bind(assignmentId),
      db.prepare(`DELETE FROM assignments WHERE id = ?`).bind(assignmentId),
    ]);
    throw error;
  }

  return assignmentId;
}

export async function deleteAssignment(classroomId: string, assignmentId: string) {
  await ensureAssignmentSchema();
  const db = await database();
  const removed = await db
    .prepare(`DELETE FROM assignments WHERE id = ? AND classroom_id = ?`)
    .bind(assignmentId, classroomId)
    .run();
  if (!removed.meta.changes) return false;

  await db.batch([
    db.prepare(`DELETE FROM assignment_files WHERE assignment_id = ?`).bind(assignmentId),
    db.prepare(`DELETE FROM assignment_statuses WHERE assignment_id = ?`).bind(assignmentId),
  ]);
  return true;
}

export async function setAssignmentStatus(input: {
  classroomId: string;
  assignmentId: string;
  clerkUserId: string;
  status: AssignmentStatus;
}) {
  await ensureAssignmentSchema();
  const db = await database();
  const assignment = await db
    .prepare(`SELECT id FROM assignments WHERE id = ? AND classroom_id = ?`)
    .bind(input.assignmentId, input.classroomId)
    .first<{ id: string }>();
  if (!assignment) return false;

  await db
    .prepare(
      `INSERT INTO assignment_statuses (assignment_id, clerk_user_id, status, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(assignment_id, clerk_user_id) DO UPDATE SET
         status = excluded.status,
         updated_at = excluded.updated_at`,
    )
    .bind(input.assignmentId, input.clerkUserId, input.status, new Date().toISOString())
    .run();
  return true;
}

export async function readAssignmentFile(input: {
  classroomId: string;
  assignmentId: string;
  fileId: string;
  clerkUserId: string;
}) {
  const classroom = await getClassroomForUser(input.classroomId, input.clerkUserId);
  if (!classroom) return null;

  await ensureAssignmentSchema();
  const db = await database();
  const row = await db
    .prepare(
      `SELECT f.name, f.content_type, f.bytes
       FROM assignment_files f
       JOIN assignments a ON a.id = f.assignment_id
       WHERE f.id = ? AND f.assignment_id = ? AND a.classroom_id = ?`,
    )
    .bind(input.fileId, input.assignmentId, input.classroomId)
    .first<{ name: string; content_type: string; bytes: unknown }>();
  if (!row) return null;

  const bytes = blobBytes(row.bytes);
  return {
    name: row.name,
    contentType: row.content_type,
    bytes,
    size: bytes.byteLength,
  };
}
