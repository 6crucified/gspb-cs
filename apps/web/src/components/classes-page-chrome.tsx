import Link from "next/link";
import { Mark } from "@/components/marketing/mark";

export function ClassesPageChrome() {
  return (
    <div className="border-b border-line bg-paper-elevated/40">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 py-3 text-sm">
        <Link href="/" className="flex items-center gap-2 font-medium text-ink hover:text-navy">
          <Mark className="h-5 w-5" />
          GSPB
        </Link>
        <span className="text-line/60" aria-hidden>
          /
        </span>
        <span className="font-medium text-ink">Classes</span>
      </div>
    </div>
  );
}
