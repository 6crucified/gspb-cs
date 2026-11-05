import { pricingExample, pricingPlans } from "@/lib/pricing";
import { PlanCta } from "@/components/marketing/actions";

export function PricingGrid() {
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <article
            key={plan.name}
            className={
              plan.featured
                ? "flex flex-col rounded-2xl border border-navy/50 bg-paper-elevated p-6"
                : "flex flex-col rounded-2xl border border-line bg-paper-elevated/60 p-6"
            }
          >
            <h3 className="text-lg font-medium text-ink">{plan.name}</h3>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-5xl text-ink">{plan.price}</span>
              <span className="text-sm text-muted">{plan.unit}</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{plan.description}</p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-ink-soft">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-forest" aria-hidden>
                    ✓
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <PlanCta href={plan.href} featured={plan.featured}>
                {plan.cta}
              </PlanCta>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">{pricingExample}</p>
    </div>
  );
}
