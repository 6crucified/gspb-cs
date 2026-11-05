import type { Metadata } from "next";
import { ProsePage } from "@/components/marketing/prose";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy" lede="What an account stores, and who on a class can see it.">
      <p>
        Sign-in is handled by Clerk. GSPB stores a profile, class membership, and the files and
        scores that belong to a class.
      </p>
      <p>
        Teachers on a class can see that class&apos;s roster, submissions, and gradebook. Students
        see their own files and the feedback left for them. Nicknames are visible to teachers only.
      </p>
      <p>We do not sell student rosters. A gradebook export is something a teacher downloads.</p>
    </ProsePage>
  );
}
