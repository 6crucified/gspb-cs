import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureWorkspaceMetaSchema } from "@/lib/workspace-meta";
import { ensureWorkspaceSchema } from "@/lib/workspace";

export type WorkspaceCursor = {
  activePath: string;
  anchorLine: number;
  anchorCol: number;
  headLine: number;
  headCol: number;
  filesRev?: number;
};

const STALE_MS = 90_000;
export const PRESENCE_ACTIVE_MS = 18_000;

async function db() {
  await ensureWorkspaceSchema();
  await ensureWorkspaceMetaSchema();
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) throw new Error("La base des classes n'est pas disponible.");
  return env.DB;
}

export async function touchWorkspacePresence(
  classroomId: string,
  workspaceOwnerId: string,
  viewerId: string,
  viewerRole: "teacher",
  cursor?: WorkspaceCursor,
) {
  const now = new Date().toISOString();
  const conn = await db();
  await conn
    .prepare(
      `INSERT INTO workspace_presence (
         classroom_id, workspace_owner_id, viewer_id, viewer_role, last_seen,
         active_path, anchor_line, anchor_col, head_line, head_col, files_rev
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(classroom_id, workspace_owner_id, viewer_id) DO UPDATE SET
         viewer_role = excluded.viewer_role,
         last_seen = excluded.last_seen,
         active_path = excluded.active_path,
         anchor_line = excluded.anchor_line,
         anchor_col = excluded.anchor_col,
         head_line = excluded.head_line,
         head_col = excluded.head_col,
         files_rev = excluded.files_rev`,
    )
    .bind(
      classroomId,
      workspaceOwnerId,
      viewerId,
      viewerRole,
      now,
      cursor?.activePath ?? null,
      cursor?.anchorLine ?? null,
      cursor?.anchorCol ?? null,
      cursor?.headLine ?? null,
      cursor?.headCol ?? null,
      cursor?.filesRev ?? null,
    )
    .run();
}

export async function getTeacherPresenceDetail(classroomId: string, workspaceOwnerId: string) {
  await pruneStalePresence();
  const since = new Date(Date.now() - PRESENCE_ACTIVE_MS).toISOString();
  const conn = await db();
  const row = await conn
    .prepare(
      `SELECT active_path, anchor_line, anchor_col, head_line, head_col, files_rev
       FROM workspace_presence
       WHERE classroom_id = ? AND workspace_owner_id = ? AND viewer_role = 'teacher' AND last_seen >= ?
       ORDER BY last_seen DESC
       LIMIT 1`,
    )
    .bind(classroomId, workspaceOwnerId, since)
    .first<{
      active_path: string | null;
      anchor_line: number | null;
      anchor_col: number | null;
      head_line: number | null;
      head_col: number | null;
      files_rev: number | null;
    }>();
  if (!row) return null;
  return {
    activePath: row.active_path ?? "",
    anchorLine: row.anchor_line ?? 0,
    anchorCol: row.anchor_col ?? 0,
    headLine: row.head_line ?? 0,
    headCol: row.head_col ?? 0,
    filesRev: row.files_rev ?? 0,
  };
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
