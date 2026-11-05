"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

export function AuthNav() {
  return (
    <nav className="flex items-center gap-3 text-sm">
      <SignedOut>
        <SignInButton mode="redirect">
          <button type="button" className="rounded-lg px-3 py-1.5 hover:bg-white/5">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="redirect">
          <button
            type="button"
            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 font-medium text-white"
          >
            Sign up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard" className="rounded-lg px-3 py-1.5 hover:bg-white/5">
          Dashboard
        </Link>
        <Link href="/user-profile" className="rounded-lg px-3 py-1.5 hover:bg-white/5">
          Profile
        </Link>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </nav>
  );
}
