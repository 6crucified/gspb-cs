"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: (id: string) => `/classes/${id}/parametres/invitation`, label: "Gestion de la classe", segment: "invitation" },
  { href: (id: string) => `/classes/${id}/parametres/membres`, label: "Élèves", segment: "membres" },
] as const;

export function ClassParametresTabs({ classroomId }: { classroomId: string }) {
  const pathname = usePathname();
  return (
    <nav className="mt-6 flex gap-1 border-b border-line" aria-label="Paramètres de la classe">
      {tabs.map((tab) => {
        const href = tab.href(classroomId);
        const active = pathname.includes(`/parametres/${tab.segment}`);
        return (
          <Link
            key={tab.segment}
            href={href}
            className={
              active
                ? "border-b-2 border-navy px-4 py-2.5 text-sm font-medium text-ink -mb-px"
                : "border-b-2 border-transparent px-4 py-2.5 text-sm text-muted hover:text-ink -mb-px"
            }
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
