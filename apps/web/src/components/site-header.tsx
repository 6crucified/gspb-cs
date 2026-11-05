import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          GSPB CS
        </Link>
        <AuthNav />
      </div>
    </header>
  );
}
