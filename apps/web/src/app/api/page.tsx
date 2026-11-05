import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API",
  description: "Roster and gradebook API included with the School plan.",
};

const routes = [
  { method: "GET", path: "/v1/classes", note: "List classes on the school." },
  { method: "POST", path: "/v1/classes", note: "Open a class. Counts toward the class total." },
  { method: "GET", path: "/v1/classes/:id/gradebook", note: "Scores for one class, the same grid as the export." },
];

export default function ApiPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">School plan</p>
      <h1 className="mt-3 font-display text-5xl font-semibold text-ink">API</h1>
      <p className="mt-4 text-lg text-ink-soft">
        The School plan includes a token for roster and gradebook calls. It is billed with your
        classes, not per request. Tokens are not issued in this build yet.
      </p>
      <ul className="mt-10 divide-y divide-line border-y border-line text-sm">
        {routes.map((route) => (
          <li key={route.method + route.path} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <span className="font-mono text-navy">
              {route.method} {route.path}
            </span>
            <span className="text-muted">{route.note}</span>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">
        Eight or more classes use the{" "}
        <Link href="/pricing" className="text-navy hover:underline">
          School rate
        </Link>
        .
      </p>
    </div>
  );
}
