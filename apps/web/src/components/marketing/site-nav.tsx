"use client";

import { useAuth } from "@clerk/nextjs";
import { AccountChip } from "@/components/account-chip";
import Link from "next/link";
import { Mark } from "@/components/marketing/mark";
import { MobileNav } from "@/components/marketing/mobile-nav";

const signedOut = [
  { href: "/lessons", label: "Leçons" },
  { href: "/pricing", label: "Tarifs" },
];

const signedIn = [
  { href: "/workspace", label: "Espace" },
  { href: "/classes", label: "Classes" },
  { href: "/api", label: "API" },
];

export function SiteNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const items = isSignedIn ? signedIn : signedOut;

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
          {isLoaded && isSignedIn ? <AccountChip /> : null}
          {isLoaded && !isSignedIn ? (
            <>
              <Link href="/sign-in" className="hidden rounded-full px-3 py-1.5 text-sm text-ink-soft hover:bg-white/5 sm:inline">
                Connexion
              </Link>
              <Link href="/sign-up" className="rounded-full bg-navy px-3.5 py-1.5 text-sm font-medium text-[#1a1a1f]">
                Commencer
              </Link>
            </>
          ) : null}
          <MobileNav items={items} signedIn={Boolean(isSignedIn)} />
        </div>
      </div>
    </header>
  );
}
