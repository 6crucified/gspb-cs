import type { ReactNode } from "react";

export function ProsePage({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      {eyebrow ? (
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">{title}</h1>
      {lede ? <p className="mt-4 text-lg leading-relaxed text-ink-soft">{lede}</p> : null}
      <div className="mt-10 space-y-4 text-[15px] leading-relaxed text-ink-soft">{children}</div>
    </article>
  );
}
