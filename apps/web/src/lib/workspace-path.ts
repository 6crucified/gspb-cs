export const WORKSPACE_TEXT_MAX_BYTES = 100_000;

const IGNORED_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".cache",
  "__pycache__",
  ".venv",
  "vendor",
  "coverage",
  ".turbo",
  ".output",
]);

const IGNORED_FILE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "ico",
  "pdf",
  "zip",
  "gz",
  "tar",
  "wasm",
  "bin",
  "exe",
  "dll",
  "so",
  "dylib",
  "mp3",
  "mp4",
  "avi",
  "mov",
  "woff",
  "woff2",
]);

export type WorkspaceFile = { path: string; text: string };

export function isSafeWorkspacePath(path: string) {
  if (!path || path.length > 180 || path.startsWith("/") || path.includes("\\") || path.includes("\0")) return false;
  const parts = path.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) return false;
  return parts.every((part) => part === ".folder" || /^[\p{L}\p{N}_ .()+.-]{1,80}$/u.test(part));
}

export function isIgnoredWorkspacePath(path: string) {
  if (!path) return true;
  const isFolderMarker = path === ".folder" || path.endsWith("/.folder");
  const parts = path.split("/");
  for (const part of parts) {
    if (part === ".folder") continue;
    if (IGNORED_DIR_NAMES.has(part)) return true;
    if (part.startsWith(".") && !isFolderMarker) return true;
  }
  if (isFolderMarker) return false;
  const ext = path.split(".").pop()?.toLowerCase();
  return Boolean(ext && IGNORED_FILE_EXTENSIONS.has(ext));
}

export function fileHasTests(path: string, text: string) {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "py") return /\bassert\b|\bunittest\b|\bpytest\b/.test(text);
  if (ext === "js" || ext === "jsx" || ext === "ts" || ext === "tsx") return /\b(describe|it|test)\s*\(/.test(text);
  if (ext === "java") return /@Test\b|\bassertEquals\b|\bassertTrue\b/.test(text);
  if (ext === "go") return /\bfunc Test[A-Z]/.test(text);
  if (ext === "cs") return /\[Test\]|\bAssert\./.test(text);
  return false;
}
