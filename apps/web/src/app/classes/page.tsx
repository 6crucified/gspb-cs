import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Classes",
  description: "Sections you teach on GSPB.",
};

export default async function ClassesPage() {
  const { userId } = await auth();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-5xl font-semibold text-ink">Classes</h1>
        {userId ? (
          <span className="rounded-full border border-line px-3 py-1.5 text-sm text-muted">New class</span>
        ) : null}
      </div>
      <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-12">
        <h2 className="text-lg font-medium text-ink">No classes yet</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          A class is one section. Students join with a link, and the first class on your account is
          free. Creating and billing a class is not switched on in this build yet.
        </p>
        {userId ? (
          <p className="mt-6 text-sm text-muted">
            Your account is ready. Class creation will use the{" "}
            <Link href="/pricing" className="text-navy hover:underline">
              per-class rates
            </Link>
            .
          </p>
        ) : (
          <Link
            href="/sign-up"
            className="mt-6 inline-flex rounded-full bg-navy px-4 py-2 text-sm font-medium text-[#1a1a1f]"
          >
            Get started
          </Link>
        )}
      </div>
    </div>
  );
}
