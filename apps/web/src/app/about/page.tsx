import type { Metadata } from "next";
import { ProsePage } from "@/components/marketing/prose";

export const metadata: Metadata = {
  title: "About",
  description: "GSPB is a browser IDE for computer science classes, billed per class.",
};

export default function AboutPage() {
  return (
    <ProsePage
      title="About GSPB"
      lede="A coding classroom that lives in the browser. Teachers get classes, assignments, and a gradebook. Students get an editor, a terminal, and files that stay with their account."
    >
      <p>
        The bill follows the section, not the roster. One class is free. Another section is another
        class. Students and the teachers who help run a class are included.
      </p>
      <h2 className="pt-4 font-display text-3xl text-ink">Who it is for</h2>
      <p>Teachers running a coding section in a school, and the students in that section.</p>
      <h2 className="pt-4 font-display text-3xl text-ink">What a class includes</h2>
      <p>A join link, assignments with starter code, a workspace per student, tests, and a gradebook you can export.</p>
      <p>
        Questions about a school rollout start with the{" "}
        <a className="text-navy hover:underline" href="/pricing">
          pricing
        </a>{" "}
        page.
      </p>
    </ProsePage>
  );
}
