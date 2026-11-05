import Link from "next/link";
import { HeroCtas } from "@/components/marketing/actions";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { WorkspacePreview } from "@/components/marketing/workspace-preview";

const setup = [
  {
    title: "Create a class",
    body: "Name the section. A second period of the same course is a second class, and that is the unit you pay for.",
  },
  {
    title: "Add an assignment",
    body: "Start from a lesson, upload a folder, or write the starter yourself. Publish it when the section should see it.",
  },
  {
    title: "Share the class link",
    body: "Turn the link on and paste it, or put the code on the projector. New students stop when you turn it off.",
  },
  {
    title: "Students start coding",
    body: "Each student gets a workspace with the assignment already in their files.",
  },
];

const studentFeatures = [
  {
    title: "Nine languages",
    body: "Python, Java, C, C++, C#, JavaScript, TypeScript, Go, and PHP, each with Run.",
  },
  {
    title: "Notebooks",
    body: "Open a notebook and run cells in the editor.",
  },
  {
    title: "Packages stay installed",
    body: "pip and npm install into that student's files and are still there next class.",
  },
  {
    title: "Windows beside the code",
    body: "Turtle, tkinter, and other programs that open a window show up next to the editor.",
  },
  {
    title: "A public address for a site",
    body: "A web server a student starts can get an address someone else can open.",
  },
  {
    title: "Work follows the login",
    body: "Files save as they type, on whichever computer they sign in from.",
  },
];

const grading = [
  { title: "Public and hidden tests", body: "Students run the public tests while they work. The grade adds the hidden ones." },
  { title: "Release on a date", body: "Write the assignment now. It appears on the day you choose." },
  { title: "Collected at the deadline", body: "At the due time, every copy is submitted and locked." },
  { title: "A note on a line", body: "Leave feedback on a specific line of a student's file." },
  { title: "Weights and overrides", body: "Weight each assignment, or change any score by hand." },
  { title: "Export", body: "Download the gradebook as a spreadsheet." },
];

const live = [
  { title: "See who is online", body: "A green dot marks every student working right now." },
  { title: "Edit together", body: "Open their workspace from the class page. Both cursors show, with names." },
  { title: "A terminal on their files", body: "You get a shell in the same folder, without walking to the desk." },
  { title: "Nicknames", body: "Call them what you call them in class. Only teachers see it." },
];

const moves = [
  { title: "Another hosted IDE", body: "Download the starter folder, create a class, and publish it as the first assignment." },
  { title: "Chromebooks", body: "The workspace is the browser. Students do not install a toolchain on the device." },
  { title: "A spreadsheet gradebook", body: "Export scores when the term needs them in the system you already use." },
];

const faqs = [
  {
    q: "What do I pay for?",
    a: "Classes. A class is one section. Students and extra teachers on that class are included. The first class is free. Each class after that is $9 / month, or $6 / month on the School plan when you run eight or more.",
  },
  {
    q: "How does a teacher account work?",
    a: "Create an account and open your first class. Students do not need a separate signup link from us. They use the class link you share.",
  },
  {
    q: "What do students need?",
    a: "A computer with a browser, and an email address to sign in. Nothing is installed on the machine.",
  },
  {
    q: "Does it run on Chromebooks?",
    a: "Yes. Editing, running, and submitting happen in the browser.",
  },
  {
    q: "Which languages can I teach?",
    a: "Python, Java, C, C++, C#, JavaScript, TypeScript, Go, and PHP, plus notebooks and HTML and CSS sites. Autograding can use input and output cases or a test command such as pytest.",
  },
  {
    q: "How big can a class be?",
    a: "A class holds the section you teach. Headcount is not capped by the price. If a roster needs a higher membership limit, write through Feedback.",
  },
  {
    q: "Does it connect to my LMS?",
    a: "Not as a live sync. Download the gradebook as a spreadsheet and import it.",
  },
];

function Eyebrow({ children }: { children: string }) {
  return <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{children}</p>;
}

export function HomePage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-24">
        <div>
          <h1 className="font-display text-[3.25rem] leading-[1.02] font-semibold tracking-tight text-ink sm:text-6xl">
            The online IDE for your class
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Students code in the browser on any computer. Post assignments, follow their progress,
            and run the section from one place.
          </p>
          <p className="mt-5 text-sm text-muted">Unlimited students in every class. You pay per class.</p>
          <div className="mt-8">
            <HeroCtas />
          </div>
          <p className="mt-5 text-sm text-muted">The first class is free. Additional classes are billed monthly.</p>
        </div>
        <WorkspacePreview />
      </section>

      <section id="how-it-works" className="border-t border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div className="relative hidden min-h-64 lg:block" aria-hidden>
            <div className="absolute top-6 left-4 h-44 w-44 rounded-full bg-[#6e88ad]/35" />
            <div className="absolute top-24 left-16 w-80 rounded-2xl border border-line bg-[#2c3848] p-5 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-ink-soft">Algorithms · Block B</p>
                <span className="text-muted">×</span>
              </div>
              <p className="mt-16 font-mono text-sm text-white/75">/join/algorithms-block-b</p>
            </div>
          </div>
          <div>
            <Eyebrow>Setup</Eyebrow>
            <h2 className="mt-3 font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
              Students join with one link
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              There is nothing to install. Students sign in with the email they already use.
            </p>
            <ol className="mt-8 space-y-6">
              {setup.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8 text-sm text-ink">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Eyebrow>For students</Eyebrow>
          <h2 className="mt-3 max-w-xl font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
            Students can build the work
          </h2>
          <p className="mt-4 max-w-xl text-ink-soft">
            Each student gets a workspace with an editor, a terminal, and their own files.
          </p>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {studentFeatures.map((item) => (
              <li key={item.title}>
                <h3 className="font-medium text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Eyebrow>Autograding</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
            Your tests grade the section
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Write the tests once. At the due time, GSPB collects every student&apos;s work, runs your
            tests, and puts the scores in the gradebook.
          </p>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {grading.map((item) => (
              <li key={item.title}>
                <h3 className="font-medium text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Eyebrow>Live help</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
            Help a student without walking over
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Open a workspace from the class page and edit with them, the way a shared document works.
          </p>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {live.map((item) => (
              <li key={item.title}>
                <h3 className="font-medium text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <Eyebrow>A period</Eyebrow>
            <h2 className="mt-3 font-display text-4xl leading-tight font-semibold text-ink">
              From an empty class to a published project
            </h2>
          </div>
          <ol className="space-y-6 text-sm leading-relaxed text-ink-soft">
            <li>
              <span className="font-medium text-ink">You</span> create Block B, pick a lesson as starter
              code, and publish it with a due time.
            </li>
            <li>
              <span className="font-medium text-ink">Students</span> open the join link, run the public
              tests, and keep their files between bells.
            </li>
            <li>
              <span className="font-medium text-ink">You</span> open the one workspace that is stuck,
              leave a note on the line, and export the gradebook when the period ends.
            </li>
          </ol>
        </div>
      </section>

      <section id="pricing" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
            Priced per class, not per student
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Thirty students in a section cost the same as twelve. Add a class when you open another
            section. Drop it when the term ends.
          </p>
          <div className="mt-10">
            <PricingGrid />
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-4xl font-semibold text-ink">Moving a class here?</h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Bring the folder you already teach from. The guides cover the first week, not a long migration.
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {moves.map((item) => (
              <li key={item.title} className="rounded-2xl border border-line p-5">
                <h3 className="font-medium text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
          <Link href="/guides" className="mt-6 inline-block text-sm text-navy hover:underline">
            Read the guides
          </Link>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-4xl font-semibold text-ink">Questions teachers ask</h2>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {faqs.map((item) => (
              <div key={item.q} className="grid gap-2 py-5 md:grid-cols-[280px_1fr] md:gap-10">
                <dt className="font-medium text-ink">{item.q}</dt>
                <dd className="text-sm leading-relaxed text-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-4xl font-semibold text-ink">Set up your first class</h2>
            <p className="mt-3 text-ink-soft">Free for one section. Add another only when you teach it.</p>
          </div>
          <HeroCtas />
        </div>
      </section>
    </div>
  );
}
