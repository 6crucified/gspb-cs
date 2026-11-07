export const MAX_ASSIGNMENT_FILES = 4;
/** D1 stores each file on one row, and a row stops at 2 Mo. */
export const MAX_ASSIGNMENT_FILE_BYTES = 1_500_000;

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "py",
  "ipynb",
  "js",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "jsx",
  "java",
  "c",
  "h",
  "cpp",
  "hpp",
  "cc",
  "cs",
  "go",
  "php",
  "html",
  "css",
  "json",
  "md",
  "txt",
  "sql",
  "rs",
  "rb",
  "sh",
  "xml",
  "yml",
  "yaml",
  "csv",
]);

export type AssignmentStatus = "todo" | "done";

export function assignmentExtension(name: string): string | null {
  const base = name.split(/[/\\]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) return null;
  return base.slice(dot + 1).toLowerCase();
}

export function isAllowedAssignmentFile(name: string): boolean {
  const extension = assignmentExtension(name);
  return extension !== null && ALLOWED_EXTENSIONS.has(extension);
}

export function assignmentContentType(name: string): string {
  return assignmentExtension(name) === "pdf" ? "application/pdf" : "text/plain; charset=utf-8";
}

export function safeAssignmentFileName(name: string): string {
  const base = (name.split(/[/\\]/).pop() ?? "fichier").trim();
  const cleaned = base.replace(/[^\w.\- ()]+/gu, "_").replace(/^\.+/, "").slice(0, 120);
  return cleaned || "fichier";
}

export function attachmentDisposition(name: string): string {
  const safe = safeAssignmentFileName(name);
  const ascii = safe.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}

export function parseDueDate(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 2000 || year > 2100) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

export function parseAssignmentStatus(value: string): AssignmentStatus | null {
  if (value === "todo" || value === "done") return value;
  return null;
}

export function statusLabel(status: AssignmentStatus): string {
  return status === "done" ? "Fait" : "À faire";
}

export function formatSeenAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDueDate(dueOn: string): string {
  const parsed = parseDueDate(dueOn);
  if (!parsed) return dueOn;
  const [year, month, day] = parsed.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function isPastDue(dueOn: string, today = new Date().toISOString().slice(0, 10)): boolean {
  return Boolean(parseDueDate(dueOn)) && dueOn < today;
}

const ERRORS: Record<string, string> = {
  titre: "Indiquez un titre d'au moins deux caractères.",
  consigne: "Ajoutez une courte consigne.",
  date: "Indiquez une date limite valide.",
  fichier: "Seuls les PDF et les fichiers de code sont acceptés.",
  taille: "Chaque fichier doit faire 1,5 Mo au maximum.",
  nombre: "Quatre pièces jointes au maximum.",
  droit: "Seul un enseignant peut publier un devoir.",
  eleve: "Seul un élève de la classe peut changer ce statut.",
  introuvable: "Ce devoir est introuvable.",
};

export function assignmentErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  return ERRORS[code] ?? null;
}
