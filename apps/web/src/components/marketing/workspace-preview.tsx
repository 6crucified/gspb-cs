const lines = [
  { n: "1", parts: [{ t: "def ", c: "text-[#c4b5fd]" }, { t: "passed", c: "text-[#93c5fd]" }, { t: "(score):" }] },
  { n: "2", parts: [{ t: "    return ", c: "text-[#c4b5fd]" }, { t: "score >= ", c: "text-ink-soft" }, { t: "60", c: "text-forest" }] },
  { n: "3", parts: [{ t: "" }] },
  { n: "4", parts: [{ t: "grades = [", c: "text-ink-soft" }, { t: "72, 91, 58", c: "text-forest" }, { t: "]" }] },
  {
    n: "5",
    parts: [{ t: "# Block B checks this function", c: "rounded bg-tomato/25 px-1 text-tomato" }],
  },
  { n: "6", parts: [{ t: "for ", c: "text-[#c4b5fd]" }, { t: "score ", c: "text-ink-soft" }, { t: "in ", c: "text-[#c4b5fd]" }, { t: "grades:" }] },
  { n: "7", parts: [{ t: "    print", c: "text-[#93c5fd]" }, { t: "(score, passed(score))" }] },
];

export function WorkspacePreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="pointer-events-none absolute -right-4 -top-10 h-28 w-28 rounded-full bg-[#c4a574]/50" aria-hidden />
      <div className="pointer-events-none absolute -right-8 top-6 h-16 w-16 rounded-2xl bg-tomato/80" aria-hidden />
      <figure className="relative overflow-hidden rounded-2xl border border-line bg-[#161513] shadow-2xl shadow-black/40">
        <figcaption className="sr-only">Preview of a class workspace with grades.py and a terminal.</figcaption>
        <div className="grid min-h-[300px] sm:grid-cols-[132px_1fr]">
          <div className="border-b border-white/10 p-3 text-xs sm:border-b-0 sm:border-r">
            <p className="mb-2 text-muted">▾ Lab 3</p>
            <p className="rounded-md bg-white/8 px-2 py-1 text-ink">grades.py</p>
            <p className="mt-1 px-2 py-1 text-muted">README.md</p>
          </div>
          <div className="font-mono text-[13px] leading-6">
            <pre className="overflow-x-auto px-3 py-3">
              <code>
                {lines.map((line) => (
                  <span key={line.n} className="flex gap-3">
                    <span className="w-4 select-none text-right text-white/25">{line.n}</span>
                    <span>
                      {line.parts.map((part, index) => (
                        <span key={`${line.n}-${index}`} className={part.c}>
                          {part.t || " "}
                        </span>
                      ))}
                    </span>
                  </span>
                ))}
              </code>
            </pre>
            <div className="border-t border-white/10 px-4 py-3 text-xs text-muted">
              <span className="text-forest">sam</span>
              <span>:~$ </span>
              <span className="inline-block h-3.5 w-1.5 translate-y-0.5 bg-ink/80" aria-hidden />
            </div>
          </div>
        </div>
      </figure>
    </div>
  );
}
