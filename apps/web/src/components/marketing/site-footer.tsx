import Link from "next/link";

const links = [
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/lessons", label: "Lessons" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#181714]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">GSPB · billed per class</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted" aria-label="Footer">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
