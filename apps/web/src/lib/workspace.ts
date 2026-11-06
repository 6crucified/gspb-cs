import { getCloudflareContext } from "@opennextjs/cloudflare";
import { isSafeWorkspacePath } from "@/lib/workspace-path";

export { isSafeWorkspacePath };

export type WorkspaceRun = {
  stdout: string;
  stderr: string;
  exitCode: number;
  ranAt: string;
};

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS workspace_files (
    classroom_id TEXT NOT NULL,
    clerk_user_id TEXT NOT NULL,
    path TEXT NOT NULL,
    text TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (classroom_id, clerk_user_id, path)
  )`,
  `CREATE TABLE IF NOT EXISTS workspace_runs (
    classroom_id TEXT NOT NULL,
    clerk_user_id TEXT NOT NULL,
    stdout TEXT NOT NULL,
    stderr TEXT NOT NULL,
    exit_code INTEGER NOT NULL,
    ran_at TEXT NOT NULL,
    PRIMARY KEY (classroom_id, clerk_user_id)
  )`,
];

let schemaReady: Promise<void> | null = null;

async function database() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) throw new Error("La base des classes n'est pas disponible.");
  return env.DB;
}

export function ensureWorkspaceSchema() {
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

export type WorkspaceFile = { path: string; text: string };

export async function readWorkspace(classroomId: string, clerkUserId: string) {
  await ensureWorkspaceSchema();
  const db = await database();
  const [files, run] = await Promise.all([
    db
      .prepare(
        `SELECT path, text FROM workspace_files WHERE classroom_id = ? AND clerk_user_id = ? ORDER BY path`,
      )
      .bind(classroomId, clerkUserId)
      .all<{ path: string; text: string }>(),
    db
      .prepare(
        `SELECT stdout, stderr, exit_code, ran_at FROM workspace_runs WHERE classroom_id = ? AND clerk_user_id = ?`,
      )
      .bind(classroomId, clerkUserId)
      .first<{ stdout: string; stderr: string; exit_code: number; ran_at: string }>(),
  ]);

  const stored = (files.results ?? []).map((row: { path: string; text: string }) => ({
    path: String(row.path),
    text: String(row.text),
  }));

  return {
    files: stored.length > 0 ? stored : [{ path: "main.py", text: 'print("Bonjour")\n' }],
    run: run
      ? { stdout: run.stdout, stderr: run.stderr, exitCode: Number(run.exit_code), ranAt: run.ran_at }
      : null,
  };
}

export async function saveWorkspaceFile(classroomId: string, clerkUserId: string, path: string, text: string) {
  await ensureWorkspaceSchema();
  const db = await database();
  await db
    .prepare(
      `INSERT INTO workspace_files (classroom_id, clerk_user_id, path, text, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(classroom_id, clerk_user_id, path) DO UPDATE SET
         text = excluded.text,
         updated_at = excluded.updated_at`,
    )
    .bind(classroomId, clerkUserId, path, text, new Date().toISOString())
    .run();
}

export async function saveWorkspaceRun(classroomId: string, clerkUserId: string, run: WorkspaceRun) {
  await ensureWorkspaceSchema();
  const db = await database();
  await db
    .prepare(
      `INSERT INTO workspace_runs (classroom_id, clerk_user_id, stdout, stderr, exit_code, ran_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(classroom_id, clerk_user_id) DO UPDATE SET
         stdout = excluded.stdout,
         stderr = excluded.stderr,
         exit_code = excluded.exit_code,
         ran_at = excluded.ran_at`,
    )
    .bind(classroomId, clerkUserId, run.stdout, run.stderr, run.exitCode, run.ranAt)
    .run();
}

export async function runWorkspace(userId: string, files: WorkspaceFile[], entry: string): Promise<WorkspaceRun> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.RUNNER || !env.RUNNER_SECRET) {
    return {
      stdout: "",
      stderr: "La machine de la classe n'est pas encore reliée.",
      exitCode: 1,
      ranAt: new Date().toISOString(),
    };
  }

  const response = await env.RUNNER.fetch("https://runner.internal/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gspb-runner-secret": env.RUNNER_SECRET,
    },
    body: JSON.stringify({ userId, entry, files }),
  });

  const payload = (await response.json().catch(() => null)) as {
    stdout?: string;
    stderr?: string;
    code?: number;
    error?: string;
  } | null;

  if (!response.ok || !payload) {
    return {
      stdout: "",
      stderr: payload?.error || "La machine n'a pas pu lancer le code.",
      exitCode: 1,
      ranAt: new Date().toISOString(),
    };
  }

  return {
    stdout: payload.stdout ?? "",
    stderr: payload.stderr ?? "",
    exitCode: Number(payload.code ?? 1),
    ranAt: new Date().toISOString(),
  };
}

export async function deleteWorkspaceFile(classroomId: string, clerkUserId: string, path: string) {
  await ensureWorkspaceSchema();
  const db = await database();
  await db
    .prepare(`DELETE FROM workspace_files WHERE classroom_id = ? AND clerk_user_id = ? AND path = ?`)
    .bind(classroomId, clerkUserId, path)
    .run();
}

export async function callSession(userId: string, path: "/session/open" | "/session/run" | "/session/input" | "/session/output", body?: Record<string, unknown>) {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.RUNNER || !env.RUNNER_SECRET) {
    return { ok: false, output: "", error: "La machine de la classe n'est pas encore reliée." };
  }
  const session = encodeURIComponent(String(body?.session ?? "1"));
  const response = await env.RUNNER.fetch(
    `https://runner.internal${path}?userId=${encodeURIComponent(userId)}&session=${session}`,
    {
    method: path === "/session/output" ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gspb-runner-secret": env.RUNNER_SECRET,
    },
    body: path === "/session/output" ? undefined : JSON.stringify({ ...body, userId, session: body?.session ?? "1" }),
  },
  );
  const payload = (await response.json().catch(() => null)) as { ok?: boolean; output?: string; error?: string } | null;
  if (!response.ok || !payload) {
    return { ok: false, output: "", error: payload?.error || "La machine n'a pas répondu." };
  }
  return { ok: true, output: payload.output ?? "", error: "" };
}
