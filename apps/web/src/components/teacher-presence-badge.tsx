import { BadgeCheck } from "lucide-react";

export function TeacherPresenceBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 border border-navy/35 bg-navy/12 px-2 py-0.5 text-[11px] font-medium text-ink"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest/70 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-forest" />
      </span>
      <BadgeCheck className="h-3.5 w-3.5 text-navy" aria-hidden />
      Professeur
    </span>
  );
}
