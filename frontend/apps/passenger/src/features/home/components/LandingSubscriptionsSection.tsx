import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/types/routes";
import {
  LANDING_SECTION_IDS,
  SUBSCRIPTION_BENEFITS,
  SUBSCRIPTION_PLANS,
} from "@/features/home/constants/landing-content";
import {
  landingCardClass,
  landingContainerClass,
  landingOutlineButtonClass,
  landingSectionClass,
} from "@/features/home/lib/landing-layout";
import { LandingSubscriptionVisual } from "./LandingSubscriptionVisual";

function SubscriptionPlanCard({
  plan,
  compact,
}: {
  plan: (typeof SUBSCRIPTION_PLANS)[number];
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        landingCardClass,
        "relative flex flex-col p-5",
        plan.popular && compact ? "border-primary/40" : ""
      )}
    >
      {plan.popular && compact ? (
        <Badge
          variant="success"
          className="absolute -top-3 left-4 rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase"
        >
          Populaire
        </Badge>
      ) : null}

      <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{plan.price}</span>
        <span className="text-sm text-muted-foreground">{plan.period}</span>
      </p>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <Link
        to={ROUTES.register}
        className={cn(landingOutlineButtonClass, compact ? "mt-4 w-full" : "mt-5 self-start px-6")}
      >
        Choisir
      </Link>
    </article>
  );
}

export function LandingSubscriptionsSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.pricing}
      className={cn(landingSectionClass, "border-t border-border/40")}
      aria-labelledby="landing-subscriptions-title"
    >
      <div className={landingContainerClass}>
        <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
          <h2 id="landing-subscriptions-title" className="text-xl font-bold text-foreground">
            Nos abonnements
          </h2>
          <a href={`#${LANDING_SECTION_IDS.pricing}`} className="text-sm font-medium text-primary">
            Voir tous
          </a>
        </div>

        <div className="hidden lg:block">
          <div
            className={cn(
              landingCardClass,
              "overflow-hidden border-primary/30 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
            )}
          >
            <div className="relative min-h-[20rem] p-6">
              <Badge
                variant="success"
                className="absolute left-8 top-8 z-10 rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase"
              >
                Populaire
              </Badge>
              <LandingSubscriptionVisual className="absolute inset-6 rounded-xl" />
            </div>

            <div className="border-l border-border/60 p-8">
              <h2 className="text-2xl font-bold text-foreground">
                Économisez avec nos abonnements
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Des formules adaptées à vos besoins
              </p>

              <div className="mt-8 grid grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] gap-8">
                <div className="grid grid-cols-2 gap-4">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <SubscriptionPlanCard key={plan.id} plan={plan} />
                  ))}
                </div>

                <ul className="space-y-4">
                  {SUBSCRIPTION_BENEFITS.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                        <Check className="h-3 w-3 text-primary" aria-hidden />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:hidden">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <SubscriptionPlanCard key={plan.id} plan={plan} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
