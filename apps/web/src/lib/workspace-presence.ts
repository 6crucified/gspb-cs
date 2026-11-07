import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureWorkspaceSchema } from "@/lib/workspace";

const STALE_MS = 90_000;
export const PRESENCE_ACTIVE_MS = 18_000;

async function db() {
  await ensureWorkspaceSchema();
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) throw new Error("La base des classes n'est pas disponible.");
  return env.DB;
}

export async function touchWorkspacePresence(
  classroomId: string,
  workspaceOwnerId: string,
  viewerId: string,
  viewerRole: "teacher",
) {
  const now = new Date().toISOString();
  const conn = await db();
  await conn
    .prepare(
      `INSERT INTO workspace_presence (classroom_id, workspace_owner_id, viewer_id, viewer_role, last_seen)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(classroom_id, workspace_owner_id, viewer_id) DO UPDATE SET
         viewer_role = excluded.viewer_role,
         last_seen = excluded.last_seen`,
    )
    .bind(classroomId, workspaceOwnerId, viewerId, viewerRole, now)
    .run();
}

export async function clearWorkspacePresence(classroomId: string, workspaceOwnerId: string, viewerId: string) {
  const conn = await db();
  await conn
    .prepare(`DELETE FROM workspace_presence WHERE classroom_id = ? AND workspace_owner_id = ? AND viewer_id = ?`)
    .bind(classroomId, workspaceOwnerId, viewerId)
    .run();
}

export async function isTeacherPresentInWorkspace(classroomId: string, workspaceOwnerId: string): Promise<boolean> {
  await pruneStalePresence();
  const since = new Date(Date.now() - PRESENCE_ACTIVE_MS).toISOString();
  const conn = await db();
  const row = await conn
    .prepare(
      `SELECT 1 AS ok FROM workspace_presence
       WHERE classroom_id = ? AND workspace_owner_id = ? AND viewer_role = 'teacher' AND last_seen >= ?
       LIMIT 1`,
    )
    .bind(classroomId, workspaceOwnerId, since)
    .first<{ ok: number }>();
  return Boolean(row?.ok);
}

async function pruneStalePresence() {
  const before = new Date(Date.now() - STALE_MS).toISOString();
  const conn = await db();
  await conn.prepare(`DELETE FROM workspace_presence WHERE last_seen < ?`).bind(before).run();
}
