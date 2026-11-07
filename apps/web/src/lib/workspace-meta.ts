import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureWorkspaceSchema } from "@/lib/workspace";

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS workspace_meta (
    classroom_id TEXT NOT NULL,
    clerk_user_id TEXT NOT NULL,
    files_rev INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (classroom_id, clerk_user_id)
  )`,
  `ALTER TABLE workspace_presence ADD COLUMN active_path TEXT`,
  `ALTER TABLE workspace_presence ADD COLUMN anchor_line INTEGER`,
  `ALTER TABLE workspace_presence ADD COLUMN anchor_col INTEGER`,
  `ALTER TABLE workspace_presence ADD COLUMN head_line INTEGER`,
  `ALTER TABLE workspace_presence ADD COLUMN head_col INTEGER`,
  `ALTER TABLE workspace_presence ADD COLUMN files_rev INTEGER`,
];

let migrated: Promise<void> | null = null;

async function db() {
  await ensureWorkspaceSchema();
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) throw new Error("La base des classes n'est pas disponible.");
  return env.DB;
}

export async function ensureWorkspaceMetaSchema() {
  if (!migrated) {
    migrated = (async () => {
      const conn = await db();
      for (const sql of MIGRATIONS) {
        try {
          await conn.prepare(sql).run();
        } catch {
          /* already applied */
        }
      }
    })().catch((error) => {
      migrated = null;
      throw error;
    });
  }
  await migrated;
}

export async function getWorkspaceRev(classroomId: string, clerkUserId: string): Promise<number> {
  await ensureWorkspaceMetaSchema();
  const conn = await db();
  const row = await conn
    .prepare(`SELECT files_rev FROM workspace_meta WHERE classroom_id = ? AND clerk_user_id = ?`)
    .bind(classroomId, clerkUserId)
    .first<{ files_rev: number }>();
  return row?.files_rev ?? 0;
}

export async function bumpWorkspaceRev(classroomId: string, clerkUserId: string): Promise<number> {
  await ensureWorkspaceMetaSchema();
  const conn = await db();
  await conn
    .prepare(
      `INSERT INTO workspace_meta (classroom_id, clerk_user_id, files_rev)
       VALUES (?, ?, 1)
       ON CONFLICT(classroom_id, clerk_user_id) DO UPDATE SET files_rev = files_rev + 1`,
    )
    .bind(classroomId, clerkUserId)
    .run();
  return getWorkspaceRev(classroomId, clerkUserId);
}
