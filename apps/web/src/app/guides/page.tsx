import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides",
  description: "Move a class onto GSPB and teach from a browser.",
};

const guides = [
  {
    title: "Bring a folder you already teach",
    body: "Zip the starter your students use today. Create a class, upload that folder as an assignment, and publish it. Share the join link. Scores from the old tool stay in the old tool — export them there if you still need them.",
  },
  {
    title: "Chromebooks",
    body: "Students open the class link in Chrome. They sign in, and the editor, terminal, and files are in the tab. There is no local install and no Linux container to turn on.",
  },
  {
    title: "Java for an AP-style course",
    body: "Publish a starter project with the files you want open first. Students run from the workspace. Autograding can call the test command you already use. Export the gradebook when the school system needs a spreadsheet.",
  },
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-5xl font-semibold text-ink">Guides</h1>
      <p className="mt-4 text-lg text-ink-soft">The first week on GSPB, without a long migration.</p>
      <div className="mt-10 space-y-8">
        {guides.map((guide) => (
          <section key={guide.title}>
            <h2 className="font-display text-3xl text-ink">{guide.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{guide.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
