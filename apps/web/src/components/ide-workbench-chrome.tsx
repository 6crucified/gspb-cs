"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AccountChip } from "@/components/account-chip";

function NavTab({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="border border-transparent px-2.5 py-1 text-[11px] text-muted transition hover:border-line hover:bg-white/[0.05] hover:text-ink"
    >
      {children}
    </Link>
  );
}

export function IdeWorkbenchChrome({ classroomId, className }: { classroomId: string; className: string }) {
  return (
    <header className="col-span-2 flex h-10 shrink-0 items-center gap-2 border-b border-line bg-[#161412] px-2 sm:gap-3 sm:px-3">
      <Link
        href="/classes"
        className="group inline-flex shrink-0 items-center gap-0.5 border border-line bg-[#1c1b18] px-2 py-1 text-[11px] font-medium text-ink transition hover:border-navy/40 hover:bg-[#25231f]"
        title="Retour à la liste des classes"
      >
        <ChevronLeft className="h-3.5 w-3.5 text-muted transition group-hover:-translate-x-px group-hover:text-ink" aria-hidden />
        Classes
      </Link>
      <nav className="flex min-w-0 items-center gap-1.5 text-[11px]" aria-label="Fil d'Ariane">
        <span className="text-line/50" aria-hidden>
          /
        </span>
        <Link href={`/classes/${classroomId}`} className="max-w-[9rem] truncate font-medium text-ink-soft hover:text-navy sm:max-w-[14rem]">
          {className}
        </Link>
        <span className="text-line/50" aria-hidden>
          /
        </span>
        <span className="truncate text-muted">Espace</span>
      </nav>
      <nav className="hidden items-center gap-0.5 sm:ml-auto sm:flex" aria-label="Classe">
        <NavTab href={`/classes/${classroomId}`}>Classe</NavTab>
        <NavTab href={`/classes/${classroomId}/devoirs`}>Devoirs</NavTab>
        <NavTab href={`/classes/${classroomId}/parametres`}>Paramètres</NavTab>
      </nav>
      <div className="ml-auto shrink-0 sm:ml-2">
        <AccountChip />
      </div>
    </header>
  );
}

export function editorLanguageLabel(path: string) {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "py") return "Python";
  if (ext === "js" || ext === "jsx") return "JavaScript";
  if (ext === "ts" || ext === "tsx") return "TypeScript";
  if (ext === "java") return "Java";
  if (ext === "json") return "JSON";
  if (ext === "md") return "Markdown";
  return ext?.toUpperCase() ?? "Texte";
}
