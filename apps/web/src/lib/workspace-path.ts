export function isSafeWorkspacePath(path: string) {
  if (!path || path.length > 180 || path.startsWith("/") || path.includes("\\") || path.includes("\0")) return false;
  const parts = path.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) return false;
  return parts.every((part) => part === ".folder" || /^[\p{L}\p{N}_ .()+.-]{1,80}$/u.test(part));
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
