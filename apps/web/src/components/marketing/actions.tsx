import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const primary =
  "inline-flex items-center justify-center rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-[#1a1a1f] transition hover:brightness-110";
const secondary =
  "inline-flex items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-white/5";

export async function HeroCtas() {
  const { userId } = await auth();

  if (userId) {
    return (
      <div className="flex flex-wrap gap-3">
        <Link href="/classes" className={primary}>
          Voir les classes
          <span aria-hidden className="ml-2">
            →
          </span>
        </Link>
        <Link href="/#how-it-works" className={secondary}>
          Comment ça marche
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/sign-up" className={primary}>
        Commencer
        <span aria-hidden className="ml-2">
          →
        </span>
      </Link>
      <Link href="/#how-it-works" className={secondary}>
        Comment ça marche
      </Link>
    </div>
  );
}

export async function PlanCta({
  href,
  children,
  featured,
}: {
  href: string;
  children: string;
  featured?: boolean;
}) {
  const { userId } = await auth();
  const className = `${featured ? primary : secondary} w-full`;

  if (userId) {
    return (
      <Link href="/classes" className={className}>
        Ouvrir les classes
      </Link>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
