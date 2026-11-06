"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent, type MutableRefObject } from "react";
import { useRouter } from "next/navigation";
import { File, FileCode, FileJson, FileText, Folder, Plus, Terminal, Upload, X } from "lucide-react";
import { fileHasTests, isSafeWorkspacePath } from "@/lib/workspace-path";
import type { WorkspaceFile, WorkspaceRun } from "@/lib/workspace";

type Node = { name: string; path?: string; folderPath: string; children: Map<string, Node> };

function treeFrom(files: WorkspaceFile[]) {
  const root: Node = { name: "", folderPath: "", children: new Map() };
  for (const file of files) {
    const parts = file.path.split("/");
    let cursor = root;
    parts.forEach((part, index) => {
      if (part === ".folder" && index === parts.length - 1) return;
      const folderPath = parts.slice(0, index + 1).join("/");
      const existing: Node = cursor.children.get(part) ?? { name: part, folderPath, children: new Map() };
      if (index === parts.length - 1) existing.path = file.path;
      else existing.folderPath = folderPath;
      cursor.children.set(part, existing);
      cursor = existing;
    });
  }
  return root;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path d="M4.2 2.6v10.8L13.2 8 4.2 2.6Z" fill="currentColor" />
    </svg>
  );
}

function TestsIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M3.2 2.4h6.2l3.4 3.4v7.8H3.2V2.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M5.2 9.1 7 10.8l3.8-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PromptIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path d="M3 4.2 6.6 8 3 11.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 12.2h5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "py") return <FileCode className="h-3.5 w-3.5 shrink-0 text-[#f0d56c]" />;
  if (ext === "js" || ext === "ts" || ext === "jsx" || ext === "tsx") return <FileCode className="h-3.5 w-3.5 shrink-0 text-[#7eb6ff]" />;
  if (ext === "json") return <FileJson className="h-3.5 w-3.5 shrink-0 text-[#e6c07b]" />;
  if (ext === "md" || ext === "txt") return <FileText className="h-3.5 w-3.5 shrink-0 text-[#9ecbff]" />;
  return <FileText className="h-3.5 w-3.5 shrink-0 text-muted" />;
}

function Tree({
  node,
  depth,
  active,
  dropTarget,
  onOpen,
  onMove,
  onContext,
  setDropTarget,
}: {
  node: Node;
  depth: number;
  active: string;
  dropTarget: string;
  onOpen: (path: string) => void;
  onMove: (raw: string, intoFolder: string) => void;
  onContext: (event: MouseEvent, kind: "file" | "folder", path: string) => void;
  setDropTarget: (path: string) => void;
}) {
  const entries = [...node.children.values()].sort((a, b) => Number(Boolean(a.path)) - Number(Boolean(b.path)) || a.name.localeCompare(b.name, "fr"));
  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.path ?? entry.folderPath}>
          {entry.path ? (
            <button
              type="button"
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/plain", `file:${entry.path}`)}
              onContextMenu={(event) => onContext(event, "file", entry.path!)}
              onClick={() => onOpen(entry.path!)}
              className={
                entry.path === active
                  ? "flex w-full items-center gap-2 rounded-lg border border-navy/30 bg-navy/10 px-2 py-1.5 text-left text-[13px] text-ink shadow-sm"
                  : "flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left text-[13px] text-muted hover:border-line hover:bg-paper/80 hover:text-ink"
              }
              style={{ paddingLeft: 8 + depth * 14 }}
            >
              <FileIcon name={entry.name} />
              <span className="truncate">{entry.name}</span>
            </button>
          ) : (
            <>
              <p
                draggable
                onDragStart={(event) => event.dataTransfer.setData("text/plain", `folder:${entry.folderPath}`)}
                onContextMenu={(event) => onContext(event, "folder", entry.folderPath)}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropTarget(entry.folderPath);
                }}
                onDragLeave={() => setDropTarget("")}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onMove(event.dataTransfer.getData("text/plain"), entry.folderPath);
                  setDropTarget("");
                }}
                className={
                  dropTarget === entry.folderPath
                    ? "flex cursor-grab items-center gap-2 rounded-lg border border-forest/40 bg-forest/15 py-1.5 text-[13px] text-ink"
                    : "flex cursor-grab items-center gap-2 rounded-lg border border-transparent py-1.5 text-[13px] text-muted hover:border-line hover:bg-paper/60 hover:text-ink-soft"
                }
                style={{ paddingLeft: 8 + depth * 14 }}
              >
                <Folder className="h-3.5 w-3.5 shrink-0 text-[#c4b58a]" />
                <span className="truncate">{entry.name}</span>
              </p>
              <Tree
                node={entry}
                depth={depth + 1}
                active={active}
                dropTarget={dropTarget}
                onOpen={onOpen}
                onMove={onMove}
                onContext={onContext}
                setDropTarget={setDropTarget}
              />
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

async function session(body: Record<string, unknown>) {
  const response = await fetch("/api/workspace/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as { ok?: boolean; output?: string; error?: string };
}

type Student = { clerkUserId: string; displayName: string | null; email: string };

export function Ide({
  classroomId,
  ownerId,
  readOnly,
  isTeacher,
  students,
  initialFiles,
  initialRun,
}: {
  classroomId: string;
  ownerId: string;
  readOnly: boolean;
  isTeacher: boolean;
  students: Student[];
  initialFiles: WorkspaceFile[];
  initialRun: WorkspaceRun | null;
}) {
  const [files, setFiles] = useState(initialFiles);
  const [open, setOpen] = useState<string[]>([initialFiles[0]?.path ?? "main.py"]);
  const [active, setActive] = useState(initialFiles[0]?.path ?? "main.py");
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [menu, setMenu] = useState(false);
  const [dropTarget, setDropTarget] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; kind: "file" | "folder"; path: string } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ kind: "file" | "folder"; path: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");
  const [terms, setTerms] = useState<string[]>(["1"]);
  const [activeTerm, setActiveTerm] = useState("1");
  const router = useRouter();
  const uploadRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState("");
  const current = files.find((file) => file.path === active) ?? files[0];
  const tree = useMemo(() => treeFrom(files), [files]);
  const tests = current ? fileHasTests(current.path, current.text) : false;
  const writers = useRef<Record<string, (text: string) => void>>({});
  const filesRef = useRef(files);
  filesRef.current = files;

  function update(text: string) {
    if (!current || readOnly) return;
    setFiles((items) => items.map((file) => (file.path === current.path ? { ...file, text } : file)));
  }

  function openFile(path: string) {
    setActive(path);
    setOpen((tabs) => (tabs.includes(path) ? tabs : [...tabs, path]));
  }

  function add(kind: "file" | "folder") {
    const name = draft.trim().replace(/^\/+|\/+$/g, "");
    const path = kind === "folder" ? `${name}/.folder` : name;
    if (!isSafeWorkspacePath(path)) {
      setDraftError(kind === "folder" ? "Nom de dossier invalide." : "Nom de fichier invalide.");
      return;
    }
    setDraft("");
    setDraftError("");
    setCreating(null);
    if (files.some((file) => file.path === path)) return;
    const next = [...files, { path, text: "" }];
    setFiles(next);
    if (kind === "file") openFile(path);
    void session({ op: "move", classroomId, ownerId, files: next, removed: [], session: activeTerm });
  }

  async function upload(list: FileList | null) {
    const picked = [...(list ?? [])];
    const next: WorkspaceFile[] = [];
    for (const file of picked) {
      if (file.size > 100_000 || !isSafeWorkspacePath(file.name)) continue;
      next.push({ path: file.name, text: await file.text() });
    }
    if (next.length === 0) {
      setDraftError("Fichier trop lourd ou nom refusé.");
      return;
    }
    setDraftError("");
    setFiles((items) => {
      const map = new Map(items.map((item) => [item.path, item]));
      for (const file of next) map.set(file.path, file);
      return [...map.values()];
    });
    openFile(next[0].path);
  }

  function rewrite(from: string, dest: string, kind: "file" | "folder") {
    if (!from || !dest || dest === from || (kind === "folder" && dest.startsWith(`${from}/`))) return;
    if (kind === "file" && !isSafeWorkspacePath(dest)) return;
    if (kind === "folder" && !isSafeWorkspacePath(`${dest}/.folder`)) return;
    const removed: string[] = [];
    const next = files.map((file) => {
      const hit = kind === "folder" ? file.path === from || file.path.startsWith(`${from}/`) : file.path === from;
      if (!hit) return file;
      removed.push(file.path);
      return { ...file, path: kind === "folder" ? dest + file.path.slice(from.length) : dest };
    });
    if (removed.length === 0 || new Set(next.map((file) => file.path)).size !== next.length) return;
    const remap = (path: string) => {
      if (kind === "file") return path === from ? dest : path;
      if (path === from || path.startsWith(`${from}/`)) return dest + path.slice(from.length);
      return path;
    };
    setFiles(next);
    setOpen((tabs) => tabs.map(remap));
    setActive((path) => remap(path));
    void session({ op: "move", classroomId, ownerId, files: next, removed, session: activeTerm });
  }

  function relocate(raw: string, intoFolder: string) {
    const kind = raw.startsWith("folder:") ? "folder" : raw.startsWith("file:") ? "file" : "";
    const from = raw.slice(raw.indexOf(":") + 1);
    if (!kind || !from) return;
    const name = from.split("/").pop() ?? "";
    const dest = intoFolder ? `${intoFolder}/${name}` : name;
    if (!name || dest === from || intoFolder === from || intoFolder.startsWith(`${from}/`)) return;
    rewrite(from, dest, kind);
  }

  function openContext(event: MouseEvent, kind: "file" | "folder", path: string) {
    event.preventDefault();
    if (readOnly) return;
    setContextMenu({ x: Math.min(event.clientX, window.innerWidth - 220), y: Math.min(event.clientY, window.innerHeight - 240), kind, path });
  }

  useEffect(() => {
    if (!contextMenu && !renameTarget) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setContextMenu(null);
      setRenameTarget(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [contextMenu, renameTarget]);

  function deleteEntry(from: string, kind: "file" | "folder") {
    const removed = files
      .filter((file) => (kind === "folder" ? file.path === from || file.path.startsWith(`${from}/`) : file.path === from))
      .map((file) => file.path);
    let next = files.filter((file) => !removed.includes(file.path));
    const real = (path: string) => path !== ".folder" && !path.endsWith("/.folder");
    if (!next.some((file) => real(file.path))) next = [...next, { path: "main.py", text: "\n" }];
    const fallback = next.find((file) => real(file.path))?.path ?? "main.py";
    setFiles(next);
    setOpen((tabs) => {
      const kept = tabs.filter((tab) => !removed.includes(tab));
      return kept.length ? kept : [fallback];
    });
    setActive((path) => (removed.includes(path) ? fallback : path));
    setContextMenu(null);
    void session({ op: "move", classroomId, ownerId, files: next, removed, session: activeTerm });
  }

  function duplicateFile(path: string) {
    const file = files.find((item) => item.path === path);
    if (!file) return;
    const slash = path.lastIndexOf("/");
    const dir = slash === -1 ? "" : path.slice(0, slash + 1);
    const base = path.slice(slash + 1);
    const dot = base.lastIndexOf(".");
    const stem = dot > 0 ? base.slice(0, dot) : base;
    const ext = dot > 0 ? base.slice(dot) : "";
    let candidate = `${dir}${stem} copie${ext}`;
    let n = 2;
    while (files.some((item) => item.path === candidate)) {
      candidate = `${dir}${stem} copie ${n}${ext}`;
      n += 1;
    }
    if (!isSafeWorkspacePath(candidate)) return;
    const next = [...files, { path: candidate, text: file.text }];
    setFiles(next);
    openFile(candidate);
    setContextMenu(null);
    void session({ op: "move", classroomId, ownerId, files: next, removed: [], session: activeTerm });
  }

  function commitRename() {
    if (!renameTarget) return;
    const parent = renameTarget.path.includes("/") ? renameTarget.path.slice(0, renameTarget.path.lastIndexOf("/")) : "";
    const dest = parent ? `${parent}/${renameValue.trim()}` : renameValue.trim();
    const valid = renameTarget.kind === "file" ? isSafeWorkspacePath(dest) : isSafeWorkspacePath(`${dest}/.folder`);
    const collision = files.some((file) => {
      if (file.path === renameTarget.path || (renameTarget.kind === "folder" && file.path.startsWith(`${renameTarget.path}/`))) return false;
      return renameTarget.kind === "file" ? file.path === dest : file.path === dest || file.path.startsWith(`${dest}/`);
    });
    if (!valid || collision || dest === renameTarget.path || (renameTarget.kind === "folder" && dest.startsWith(`${renameTarget.path}/`))) {
      setRenameError(collision ? "Ce nom existe déjà." : "Nom invalide.");
      return;
    }
    setRenameError("");
    rewrite(renameTarget.path, dest, renameTarget.kind);
    setRenameTarget(null);
  }

  async function launch(asTest: boolean) {
    if (!current || readOnly) return;
    const quoted = `'${current.path.replaceAll("'", `'\\''`)}'`;
    const command = `python3 -u ${quoted}`;
    const result = await session({
      op: "run",
      classroomId,
      ownerId,
      files: filesRef.current,
      session: activeTerm,
      command: asTest ? `${command}` : command,
    });
    writers.current[activeTerm]?.((result.output || result.error || "").replace(/\n/g, "\r\n"));
  }

  function addTerminal() {
    setTerms((currentTerms) => {
      const next = ["1", "2", "3"].find((id) => !currentTerms.includes(id));
      if (!next) return currentTerms;
      setActiveTerm(next);
      return [...currentTerms, next];
    });
  }

  return (
    <>
    <div
      className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_minmax(10.5rem,32vh)] bg-paper text-ink"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 120% 80% at 0% -20%, rgba(169, 197, 227, 0.07), transparent 50%), radial-gradient(ellipse 80% 50% at 100% 100%, rgba(114, 192, 150, 0.05), transparent 45%)",
      }}
    >
      <div className="grid min-h-0 grid-cols-[minmax(13rem,17.5rem)_minmax(0,1fr)] gap-0 p-2 sm:p-3">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-paper-elevated/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
          <div className="border-b border-line px-3 pb-2 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Explorateur</p>
            <p className="mt-0.5 truncate text-xs text-ink-soft">Projet</p>
          </div>
          {isTeacher ? (
            <label className="border-b border-line px-3 py-3 text-[11px] font-medium uppercase tracking-wide text-muted">
              Élève
              <select
                value={readOnly ? ownerId : ""}
                onChange={(event) => {
                  const value = event.target.value;
                  router.push(value ? `/classes/${classroomId}/espace?eleve=${value}` : `/classes/${classroomId}/espace`);
                }}
                className="mt-1.5 w-full rounded-lg border border-line bg-paper px-2.5 py-2 text-xs font-normal normal-case tracking-normal text-ink shadow-sm outline-none transition hover:border-navy/40 focus:border-navy focus:ring-1 focus:ring-navy/30"
              >
                <option value="">Mon espace</option>
                {students.map((student) => (
                  <option key={student.clerkUserId} value={student.clerkUserId}>
                    {student.displayName || student.email}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="flex items-center justify-between gap-2 px-2 py-2">
            <span className="shrink-0 pl-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Fichiers</span>
            {readOnly ? null : (
              <span className="relative flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  title="Importer des fichiers"
                  className="inline-flex items-center gap-1 rounded-lg border border-transparent px-2 py-1.5 text-[11px] text-muted transition hover:border-line hover:bg-paper hover:text-ink"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">Importer</span>
                </button>
                <button
                  type="button"
                  aria-expanded={menu}
                  onClick={() => setMenu((open) => !open)}
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-paper px-2 py-1.5 text-[11px] font-medium text-ink shadow-sm transition hover:border-navy/35 hover:bg-paper-elevated"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Nouveau
                </button>
                {menu ? (
                  <div className="absolute right-0 top-9 z-10 w-40 rounded-xl border border-line bg-paper-elevated p-1 shadow-xl ring-1 ring-black/20">
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setCreating("file");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-white/5"
                    >
                      <File className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Fichier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setCreating("folder");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-white/5"
                    >
                      <Folder className="h-3.5 w-3.5 shrink-0 text-[#c9b896]" aria-hidden />
                      Dossier
                    </button>
                  </div>
                ) : null}
                <input
                  ref={uploadRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    void upload(event.target.files);
                    event.target.value = "";
                  }}
                />
              </span>
            )}
          </div>
          <div
            className="min-h-0 flex-1 overflow-auto px-2 pb-2"
            onDragOver={(event) => {
              event.preventDefault();
              setDropTarget("");
            }}
            onDrop={(event) => {
              event.preventDefault();
              relocate(event.dataTransfer.getData("text/plain"), "");
            }}
          >
            <Tree
              node={tree}
              depth={0}
              active={current?.path ?? ""}
              dropTarget={dropTarget}
              onOpen={openFile}
              onMove={relocate}
              onContext={openContext}
              setDropTarget={setDropTarget}
            />
          </div>
          {creating ? (
            <form
              className="border-t border-line bg-paper/50 p-2.5"
              onSubmit={(event) => {
                event.preventDefault();
                add(creating);
              }}
            >
              <input
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={creating === "folder" ? "dossier" : "dossier/fichier.py"}
                aria-label={creating === "folder" ? "Nom du dossier" : "Nom du fichier"}
                className="w-full rounded-lg border border-line bg-paper px-2.5 py-2 font-mono text-xs text-ink outline-none transition focus:border-navy focus:ring-1 focus:ring-navy/25"
              />
              {draftError ? <p className="mt-1.5 text-[11px] text-tomato">{draftError}</p> : null}
            </form>
          ) : null}
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-paper-elevated/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm">
          <header className="flex flex-wrap items-center gap-2 border-b border-line bg-gradient-to-b from-paper-elevated to-paper/80 px-3 py-2 sm:px-4">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold tracking-tight text-ink">Éditeur</h2>
              <p className="truncate font-mono text-[11px] text-muted">{current?.path ?? "main.py"}</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => launch(false)}
                disabled={readOnly || !current}
                className="inline-flex items-center gap-1.5 rounded-full border border-forest/40 bg-forest/20 px-3.5 py-1.5 text-sm font-medium text-ink transition hover:bg-forest/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <PlayIcon aria-hidden />
                Exécuter
              </button>
              {tests ? (
                <button
                  type="button"
                  onClick={() => launch(true)}
                  disabled={readOnly || !current}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy/45 bg-navy/15 px-3.5 py-1.5 text-sm font-medium text-ink transition hover:bg-navy/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <TestsIcon aria-hidden />
                  Tests
                </button>
              ) : null}
            </div>
          </header>
          <div className="flex min-h-0 min-w-0 shrink-0 items-center gap-1 overflow-x-auto border-b border-line bg-paper/40 px-1 py-1">
            {open.map((path) => {
              const fileName = path.split("/").pop() ?? path;
              const isActive = path === current?.path;
              return (
                <button
                  key={path}
                  type="button"
                  onContextMenu={(event) => openContext(event, "file", path)}
                  onClick={() => setActive(path)}
                  className={
                    isActive
                      ? "group inline-flex max-w-[11rem] shrink-0 items-center gap-1.5 rounded-lg border border-navy/35 bg-navy/12 px-2.5 py-1.5 text-left text-[13px] text-ink shadow-sm"
                      : "group inline-flex max-w-[11rem] shrink-0 items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-left text-[13px] text-muted hover:border-line hover:bg-white/5 hover:text-ink"
                  }
                >
                  <FileIcon name={fileName} />
                  <span className="min-w-0 flex-1 truncate">{fileName}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Fermer ${path}`}
                    className="shrink-0 rounded p-0.5 text-muted opacity-70 transition hover:bg-white/10 hover:text-ink group-hover:opacity-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpen((tabs) => {
                        const next = tabs.filter((tab) => tab !== path);
                        if (path === active) setActive(next[0] ?? files[0]?.path ?? "");
                        return next.length ? next : [files[0]?.path ?? path];
                      });
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpen((tabs) => {
                          const next = tabs.filter((tab) => tab !== path);
                          if (path === active) setActive(next[0] ?? files[0]?.path ?? "");
                          return next.length ? next : [files[0]?.path ?? path];
                        });
                      }
                    }}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                </button>
              );
            })}
          </div>
          <CodePane path={current?.path ?? "main.py"} text={current?.text ?? ""} readOnly={readOnly} onChange={update} />
        </section>
      </div>

      <section className="mx-2 mb-2 flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-[#141311] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:mx-3 sm:mb-3">
        <div className="flex items-center gap-2 border-b border-line/80 bg-[#1a1815] px-3 py-1.5">
          <Terminal className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Console</span>
        </div>
        <div className="flex items-stretch border-b border-line/80 bg-[#161412]">
          {terms.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTerm(id)}
              className={
                id === activeTerm
                  ? "flex min-h-9 items-center gap-1.5 border-b-2 border-navy bg-[#1c1a17] px-3 py-2 text-xs font-medium text-ink"
                  : "flex min-h-9 items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-xs text-muted hover:bg-white/[0.04] hover:text-ink-soft"
              }
            >
              <PromptIcon aria-hidden />
              {id}
              {terms.length > 1 ? (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Fermer le terminal ${id}`}
                  className="ml-0.5 rounded p-0.5 text-muted hover:bg-white/10 hover:text-ink"
                  onClick={(event) => {
                    event.stopPropagation();
                    setTerms((currentTerms) => currentTerms.filter((term) => term !== id));
                    setActiveTerm((currentId) => (currentId === id ? terms.find((term) => term !== id) ?? "1" : currentId));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      setTerms((currentTerms) => currentTerms.filter((term) => term !== id));
                      setActiveTerm((currentId) => (currentId === id ? terms.find((term) => term !== id) ?? "1" : currentId));
                    }
                  }}
                >
                  <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                </span>
              ) : null}
            </button>
          ))}
          {terms.length < 3 ? (
            <button
              type="button"
              aria-label="Nouveau terminal"
              onClick={addTerminal}
              className="px-2.5 text-lg font-light leading-none text-muted hover:text-ink"
            >
              +
            </button>
          ) : null}
        </div>
        <div className="relative min-h-0 flex-1">
          {terms.map((id) => (
            <TerminalView
              key={id}
              sessionId={id}
              classroomId={classroomId}
              ownerId={ownerId}
              readOnly={readOnly}
              active={id === activeTerm}
              showBanner={id === "1"}
              initialRun={initialRun}
              filesRef={filesRef}
              onReady={(write) => {
                writers.current[id] = write;
              }}
            />
          ))}
        </div>
      </section>
    </div>
      {contextMenu ? (
        <div className="fixed inset-0 z-50" onMouseDown={() => setContextMenu(null)} onContextMenu={(event) => event.preventDefault()}>
          <div
            role="menu"
            className="absolute w-52 rounded-xl border border-line bg-paper-elevated p-1.5 shadow-2xl ring-1 ring-black/25"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {contextMenu.kind === "file" ? (
              <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-white/8" onClick={() => { openFile(contextMenu.path); setContextMenu(null); }}>
                Ouvrir
              </button>
            ) : (
              <button
                type="button"
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-white/8"
                onClick={() => {
                  setCreating("file");
                  setDraft(`${contextMenu.path}/`);
                  setContextMenu(null);
                }}
              >
                Nouveau fichier ici
              </button>
            )}
            <button
              type="button"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-white/8"
              onClick={() => {
                setRenameTarget({ kind: contextMenu.kind, path: contextMenu.path });
                setRenameValue(contextMenu.path.split("/").pop() ?? "");
                setRenameError("");
                setContextMenu(null);
              }}
            >
              Renommer
            </button>
            {contextMenu.kind === "file" ? (
              <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-white/8" onClick={() => duplicateFile(contextMenu.path)}>
                Dupliquer
              </button>
            ) : null}
            <button
              type="button"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-white/8"
              onClick={() => {
                void navigator.clipboard.writeText(contextMenu.path);
                setContextMenu(null);
              }}
            >
              Copier le chemin
            </button>
            <div className="my-1.5 h-px bg-line" />
            <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-tomato hover:bg-tomato/10" onClick={() => deleteEntry(contextMenu.path, contextMenu.kind)}>
              Supprimer
            </button>
          </div>
        </div>
      ) : null}
      {renameTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <form
            className="w-full max-w-md rounded-2xl border border-line bg-paper-elevated p-6 shadow-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              commitRename();
            }}
          >
            <h2 className="text-lg font-medium text-ink">Renommer</h2>
            <input
              autoFocus
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              className="mt-4 w-full rounded-lg border border-line bg-paper px-3 py-2 font-mono text-sm text-ink outline-none focus:border-navy focus:ring-1 focus:ring-navy/25"
            />
            {renameError ? <p className="mt-2 text-sm text-tomato">{renameError}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setRenameTarget(null)} className="rounded-full px-4 py-2 text-sm text-ink">
                Annuler
              </button>
              <button type="submit" className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-[#1a1a1f]">
                Renommer
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function TerminalView({
  sessionId,
  classroomId,
  ownerId,
  readOnly,
  active,
  showBanner,
  initialRun,
  filesRef,
  onReady,
}: {
  sessionId: string;
  classroomId: string;
  ownerId: string;
  readOnly: boolean;
  active: boolean;
  showBanner: boolean;
  initialRun: WorkspaceRun | null;
  filesRef: MutableRefObject<WorkspaceFile[]>;
  onReady: (write: (text: string) => void) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    let disposed = false;
    let timer = 0;
    let term: { dispose: () => void } | undefined;
    void (async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([import("@xterm/xterm"), import("@xterm/addon-fit")]);
      await import("@xterm/xterm/css/xterm.css");
      if (disposed || !host.current) return;
      const instance = new Terminal({
        cursorBlink: !readOnly,
        disableStdin: readOnly,
        fontFamily: "var(--font-dm-mono), ui-monospace, monospace",
        fontSize: 13,
        theme: { background: "#141311", foreground: "#f2eee5", cursor: "#a9c5e3" },
      });
      const fit = new FitAddon();
      instance.loadAddon(fit);
      instance.open(host.current);
      fit.fit();
      term = instance;
      onReadyRef.current((text) => instance.write(text));
      if (showBanner && initialRun?.stdout) instance.write(initialRun.stdout.replace(/\n/g, "\r\n"));
      if (showBanner && initialRun?.stderr) instance.write(initialRun.stderr.replace(/\n/g, "\r\n"));
      if (!readOnly) {
        instance.onData((data) => {
          void session({ op: "input", classroomId, ownerId, session: sessionId, data });
        });
        void session({ op: "open", classroomId, ownerId, session: sessionId, files: filesRef.current });
      }
      timer = window.setInterval(() => {
        const query = new URLSearchParams({ classroomId, ownerId, session: sessionId });
        void fetch(`/api/workspace/session?${query}`)
          .then((response) => response.json())
          .then((payload: { output?: string }) => {
            if (payload.output) instance.write(payload.output);
          })
          .catch(() => undefined);
      }, 400);
    })();
    return () => {
      disposed = true;
      window.clearInterval(timer);
      term?.dispose();
    };
  }, [classroomId, filesRef, initialRun, ownerId, readOnly, sessionId, showBanner]);

  return <div ref={host} className={active ? "h-full px-2 py-1" : "hidden"} />;
}

function CodePane({
  path,
  text,
  readOnly,
  onChange,
}: {
  path: string;
  text: string;
  readOnly: boolean;
  onChange: (text: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const textRef = useRef(text);
  textRef.current = text;

  useEffect(() => {
    const parent = host.current;
    if (!parent) return;
    let view: { destroy: () => void } | null = null;
    let cancelled = false;
    void (async () => {
      const [{ EditorView }, { EditorState }, { basicSetup }, { oneDark }] = await Promise.all([
        import("@codemirror/view"),
        import("@codemirror/state"),
        import("codemirror"),
        import("@codemirror/theme-one-dark"),
      ]);
      const language = await languageFor(path);
      if (cancelled || !host.current) return;
      view = new EditorView({
        state: EditorState.create({
          doc: textRef.current,
          extensions: [
            basicSetup,
            oneDark,
            language,
            EditorView.editable.of(!readOnly),
            EditorView.theme({
              "&": { height: "100%", fontSize: "13px", backgroundColor: "#25231f" },
              ".cm-scroller": { fontFamily: "var(--font-dm-mono), ui-monospace, monospace" },
              ".cm-gutters": { backgroundColor: "#25231f", border: "none", color: "#a8a398" },
              ".cm-activeLineGutter": { backgroundColor: "rgba(169, 197, 227, 0.08)" },
            }),
            EditorView.updateListener.of((update) => {
              if (update.docChanged) onChangeRef.current(update.state.doc.toString());
            }),
          ],
        }),
        parent: host.current,
      });
    })();
    return () => {
      cancelled = true;
      view?.destroy();
    };
  }, [path, readOnly]);

  return <div ref={host} className="min-h-0 flex-1 overflow-hidden" />;
}

async function languageFor(path: string) {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "py") return (await import("@codemirror/lang-python")).python();
  if (ext === "js" || ext === "jsx") return (await import("@codemirror/lang-javascript")).javascript({ jsx: ext === "jsx" });
  if (ext === "ts" || ext === "tsx") return (await import("@codemirror/lang-javascript")).javascript({ typescript: true, jsx: ext === "tsx" });
  if (ext === "java") return (await import("@codemirror/lang-java")).java();
  if (ext === "c" || ext === "h" || ext === "cpp" || ext === "cc" || ext === "hpp") return (await import("@codemirror/lang-cpp")).cpp();
  if (ext === "css") return (await import("@codemirror/lang-css")).css();
  if (ext === "html") return (await import("@codemirror/lang-html")).html();
  if (ext === "json") return (await import("@codemirror/lang-json")).json();
  if (ext === "md") return (await import("@codemirror/lang-markdown")).markdown();
  return [];
}
