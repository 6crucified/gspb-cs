import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-widest text-[var(--muted)]">GSPB CS</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Coding classrooms for schools
        </h1>
        <p className="text-lg text-[var(--muted)]">
          Teachers manage classes and assignments. Students code in the browser. Identity is
          handled by Clerk; school membership and roles live in Supabase.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/sign-in"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium"
        >
          Sign up
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)]"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
