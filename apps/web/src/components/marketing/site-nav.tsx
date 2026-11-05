import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Mark } from "@/components/marketing/mark";
import { MobileNav } from "@/components/marketing/mobile-nav";

const signedOut = [
  { href: "/lessons", label: "Lessons" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
];

const signedIn = [
  { href: "/workspace", label: "Workspace" },
  { href: "/classes", label: "Classes" },
  { href: "/api", label: "API" },
  { href: "/docs", label: "Docs" },
  { href: "/feedback", label: "Feedback" },
];

export async function SiteNav() {
  const { userId } = await auth();
  const items = userId ? signedIn : signedOut;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-medium tracking-tight text-ink">
            <Mark />
            GSPB
          </Link>
          <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-muted hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {userId ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <>
              <Link href="/sign-in" className="hidden rounded-full px-3 py-1.5 text-sm text-ink-soft hover:bg-white/5 sm:inline">
                Sign in
              </Link>
              <Link href="/sign-up" className="rounded-full bg-navy px-3.5 py-1.5 text-sm font-medium text-[#1a1a1f]">
                Get started
              </Link>
            </>
          )}
          <MobileNav items={items} signedIn={Boolean(userId)} />
        </div>
      </div>
    </header>
  );
}
