import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lessons",
  description: "Starter lessons you can publish into a class.",
};

const lessons = [
  { name: "Hello, functions", course: "Python", note: "Define a function, call it, and print the result." },
  { name: "Lists and loops", course: "Python", note: "Walk a list of scores and decide what passes." },
  { name: "Classes and objects", course: "Java", note: "A small type, a constructor, and a test the student can run." },
  { name: "Input and output", course: "Java", note: "Read a line, transform it, and match the expected output." },
  { name: "A page with a button", course: "Web", note: "HTML, a little CSS, and a script that updates the page." },
  { name: "A first notebook", course: "Python", note: "Three cells: data, a plot-less calculation, and a written answer." },
];

export default function LessonsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-5xl font-semibold text-ink">Lessons</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">
        Starters you can publish into a class. Each student gets their own copy.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <li key={lesson.name} className="rounded-2xl border border-line bg-paper-elevated p-5">
            <p className="text-xs tracking-wide text-muted uppercase">{lesson.course}</p>
            <h2 className="mt-2 text-lg font-medium text-ink">{lesson.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{lesson.note}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">
        Publishing a lesson into a class happens after you{" "}
        <Link href="/sign-up" className="text-navy hover:underline">
          create an account
        </Link>
        .
      </p>
    </div>
  );
}
