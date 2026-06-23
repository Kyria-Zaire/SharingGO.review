import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/features/home/components/SectionHeading";
import { cn } from "@/lib/cn";
import {
  LANDING_SECTION_IDS,
  PRICING_PLANS,
} from "@/features/home/constants/landing-content";

export function PricingSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.pricing}
      className="scroll-mt-20 border-t border-border py-8"
      aria-labelledby="landing-pricing-title"
    >
      <SectionHeading
        id="landing-pricing-title"
        title="Tarifs"
        description="Des options claires selon votre usage."
      />

      <div className="space-y-3 sm:grid sm:grid-cols-1 sm:gap-3 sm:space-y-0 md:grid-cols-3">
        {PRICING_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "p-4",
              plan.highlight ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : ""
            )}
          >
            <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-foreground">{plan.price}</span>
              {plan.period ? (
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              ) : null}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {plan.description}
            </p>
          </Card>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Réservez et payez en ligne dès maintenant — billet 8 €, paiement sécurisé.
      </p>
    </section>
  );
}
