"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileNav({
  items,
  signedIn,
}: {
  items: { href: string; label: string }[];
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="rounded-md px-2 py-1 text-sm text-muted"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>
      {open ? (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-16 flex flex-col gap-3 border-b border-line bg-paper px-6 py-4"
          aria-label="Mobile"
        >
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="text-sm text-ink">
              {item.label}
            </Link>
          ))}
          {signedIn ? null : (
            <Link href="/sign-in" onClick={() => setOpen(false)} className="text-sm text-ink">
              Sign in
            </Link>
          )}
        </nav>
      ) : null}
    </div>
  );
}
