import { isIgnoredWorkspacePath, isSafeWorkspacePath, WORKSPACE_TEXT_MAX_BYTES, type WorkspaceFile } from "@/lib/workspace-path";

export { WORKSPACE_TEXT_MAX_BYTES };

export function filterWorkspaceFiles(files: WorkspaceFile[] | undefined): WorkspaceFile[] {
  if (!files?.length) return [];
  return files.filter(
    (file) =>
      isSafeWorkspacePath(file.path) &&
      !isIgnoredWorkspacePath(file.path) &&
      file.text.length <= WORKSPACE_TEXT_MAX_BYTES,
  );
}

export function workspaceContentFiles(files: WorkspaceFile[]): WorkspaceFile[] {
  return files.filter((file) => file.path !== ".folder" && !file.path.endsWith("/.folder"));
}

export function workspaceFolderMarkers(files: WorkspaceFile[]): WorkspaceFile[] {
  return files.filter((file) => file.path === ".folder" || file.path.endsWith("/.folder"));
}
