import type { WorkspaceFile } from "@/lib/workspace-path";

const MAX_SESSION_FILES = 40;
const MAX_SESSION_TEXT_BYTES = 350_000;
export const WORKSPACE_PATH_BATCH = 20;

export function chunkPaths(paths: string[], batchSize = WORKSPACE_PATH_BATCH) {
  const chunks: string[][] = [];
  for (let index = 0; index < paths.length; index += batchSize) {
    chunks.push(paths.slice(index, index + batchSize));
  }
  return chunks;
}

export function compactSessionFiles(files: WorkspaceFile[]): WorkspaceFile[] {
  const markers = files.filter((file) => file.path === ".folder" || file.path.endsWith("/.folder"));
  const content = files.filter((file) => file.path !== ".folder" && !file.path.endsWith("/.folder"));
  const kept: WorkspaceFile[] = [...markers];
  let used = 0;
  for (const file of content) {
    if (kept.length - markers.length >= MAX_SESSION_FILES) break;
    if (used + file.text.length > MAX_SESSION_TEXT_BYTES) break;
    used += file.text.length;
    kept.push(file);
  }
  return kept;
}
