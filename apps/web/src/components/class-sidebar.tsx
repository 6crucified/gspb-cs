"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Student = { clerkUserId: string; displayName: string | null; email: string };

export function ClassSidebar({
  id,
  name,
  isTeacher,
  students,
}: {
  id: string;
  name: string;
  isTeacher: boolean;
  students: Student[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const eleve = searchParams.get("eleve") ?? "";
  const items = [
    { href: `/classes/${id}`, label: "Espace" },
    { href: `/classes/${id}/devoirs`, label: "Devoirs" },
    { href: `/classes/${id}/parametres`, label: "Paramètres" },
    { href: "/classes", label: "Classes" },
  ];

  function chooseStudent(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("eleve", value);
    else params.delete("eleve");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <aside className="flex w-48 shrink-0 flex-col border-r border-line bg-[#181714]">
      {isTeacher ? (
        <label className="px-3 pt-3 text-[11px] tracking-wide text-muted uppercase">
          Élève
          <select
            value={students.some((student) => student.clerkUserId === eleve) ? eleve : ""}
            onChange={(event) => chooseStudent(event.target.value)}
            className="mt-1 w-full rounded-md border border-line bg-black/30 px-2 py-1.5 text-xs tracking-normal text-ink normal-case outline-none"
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
      <p className="truncate px-4 pt-4 text-sm font-medium text-ink" title={name}>
        {name}
      </p>
      <nav className="mt-4 flex flex-col gap-1 px-2" aria-label="Classe">
        {items.map((item) => {
          const active =
            item.href === "/classes"
              ? false
              : item.href === `/classes/${id}`
                ? pathname === item.href
                : item.href.includes("/parametres")
                  ? pathname.includes(`/classes/${id}/parametres`)
                  : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href === "/classes" ? item.href : `${item.href}${eleve ? `?eleve=${eleve}` : ""}`}
              className={
                active
                  ? "rounded-lg bg-white/10 px-3 py-2 text-sm text-ink"
                  : "rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-ink"
              }
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
