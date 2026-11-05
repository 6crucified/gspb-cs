import type { Metadata } from "next";
import { PricingGrid } from "@/components/marketing/pricing-grid";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "GSPB est facturé par classe. Les élèves et les enseignants d'une classe sont inclus.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Tarifs</p>
      <h1 className="mt-3 max-w-2xl font-display text-5xl leading-tight font-semibold text-ink">
        Par classe. Pas par élève.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">
        Une classe, c&apos;est une section. Les personnes dedans — élèves et enseignants — sont
        incluses. La première classe est gratuite.
      </p>
      <div className="mt-10">
        <PricingGrid />
      </div>
      <div className="mt-14 max-w-2xl space-y-3 text-sm leading-relaxed text-muted">
        <p>Établissement : 6 $ par classe et par mois, minimum huit classes, facturé une fois par an.</p>
        <p>Enseignant : au mois. Fermer une classe la retire de la facture suivante.</p>
        <p>Aucun tarif au siège, aucun tarif à l&apos;élève, aucun supplément pour un second enseignant.</p>
      </div>
    </div>
  );
}
