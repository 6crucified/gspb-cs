import type { Metadata } from "next";
import { PricingGrid } from "@/components/marketing/pricing-grid";

export const metadata: Metadata = {
  title: "Pricing",
  description: "GSPB is billed per class. Students and teachers on a class are included.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Pricing</p>
      <h1 className="mt-3 max-w-2xl font-display text-5xl leading-tight font-semibold text-ink">
        Per class. Not per student.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">
        A class is a section you teach. The people in it — students and the teachers who help — are
        included. The first class is free.
      </p>
      <div className="mt-10">
        <PricingGrid />
      </div>
      <div className="mt-14 max-w-2xl space-y-3 text-sm leading-relaxed text-muted">
        <p>School is $6 per class per month with an eight-class minimum, billed once a year.</p>
        <p>Teacher is month to month. Closing a class removes it from the next bill.</p>
        <p>There is no seat fee, no student fee, and no charge for a second teacher on a class.</p>
      </div>
    </div>
  );
}
