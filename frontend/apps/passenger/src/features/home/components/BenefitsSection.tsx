import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/features/home/components/SectionHeading";
import { BENEFITS } from "@/features/home/constants/landing-content";

export function BenefitsSection() {
  return (
    <section className="border-t border-border py-8" aria-labelledby="landing-benefits-title">
      <SectionHeading
        id="landing-benefits-title"
        title="Pourquoi SharingGO"
        description="Conçu pour les convoyeurs qui ont besoin de fiabilité."
      />

      <ul className="grid gap-3 sm:grid-cols-2">
        {BENEFITS.map((benefit) => (
          <li
            key={benefit.id}
            className="rounded-xl border border-border bg-muted/20 p-4"
          >
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div>
                <h3 className="text-sm font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
