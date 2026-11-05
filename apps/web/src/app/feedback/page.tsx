import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Tell GSPB what a class needs.",
};

export default async function FeedbackPage() {
  const { userId } = await auth();

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-5xl font-semibold text-ink">Feedback</h1>
      <p className="mt-4 text-ink-soft">
        Roster limits, a language you teach, or a class that needs a higher cap. Write from the
        account you teach with so we know which school it is.
      </p>
      {userId ? (
        <p className="mt-8 rounded-2xl border border-line bg-paper-elevated p-5 text-sm leading-relaxed text-ink-soft">
          You are signed in. Reply from the email on your profile for now — a mailbox inside the
          product is not wired up yet. Include the class name and what you need changed.
        </p>
      ) : (
        <p className="mt-8">
          <Link href="/sign-in" className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-[#1a1a1f]">
            Sign in to send feedback
          </Link>
        </p>
      )}
    </div>
  );
}
