import { useState } from "react";
import { CalendarCheck, Check, PiggyBank, ShieldCheck, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/types/routes";
import {
  LANDING_SECTION_IDS,
  SUBSCRIPTION_BENEFITS,
  SUBSCRIPTION_PLANS,
} from "@/features/home/constants/landing-content";
import { LANDING_ASSETS } from "@/features/home/constants/landing-assets";
import {
  landingCardClass,
  landingContainerClass,
  landingPrimaryButtonClass,
  landingSectionClass,
} from "@/features/home/lib/landing-layout";
import { LandingSubscriptionVisual } from "./LandingSubscriptionVisual";

const BENEFIT_ICONS = [Ticket, CalendarCheck, ShieldCheck, PiggyBank] as const;

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
        "relative flex flex-col border-white/[0.05] bg-[#121212] p-5",
        plan.popular ? "border-primary/35" : ""
      )}
    >
      {plan.popular ? (
        <span className="absolute -top-3 left-4 z-10 inline-flex rounded-md bg-primary px-2 py-0.5 text-[0.65rem] font-bold uppercase text-primary-foreground">
          Populaire
        </span>
      ) : null}

      <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-1">
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
        className={cn(landingPrimaryButtonClass, compact ? "mt-5 w-full" : "mt-6 w-full")}
      >
        Choisir
      </Link>
    </article>
  );
}

export function LandingSubscriptionsSection() {
  const [desktopPhotoFailed, setDesktopPhotoFailed] = useState(false);

  return (
    <section
      id={LANDING_SECTION_IDS.pricing}
      className={cn(landingSectionClass, "relative overflow-hidden border-t border-white/[0.06]")}
      aria-labelledby="landing-subscriptions-title"
    >
      {/* Fond image — toute la section desktop (comme le hero) */}
      <div className="absolute inset-0 hidden lg:block" aria-hidden>
        {desktopPhotoFailed ? (
          <div className="h-full w-full bg-gradient-to-br from-[#14532d]/25 via-black to-black" />
        ) : (
          <img
            src={LANDING_ASSETS.subscriptionInterior}
            alt=""
            className="h-full w-full object-cover object-center"
            loading="lazy"
            onError={() => setDesktopPhotoFailed(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-l from-black/55 via-black/15 to-transparent" />
      </div>
      <span className="sr-only">
        Intérieur premium de la navette SharingGO, sièges cuir et éclairage vert
      </span>

      <div className={cn(landingContainerClass, "relative z-10")}>
        <div className="hidden lg:block">
          <div className="relative min-h-[24rem]">
            <div className="flex min-h-[24rem] justify-end">
              <div className="w-full max-w-[58%] py-2 pl-8">
                <div className="flex flex-col gap-6">
                  <div>
                    <h2
                      id="landing-subscriptions-title"
                      className="text-2xl font-bold tracking-tight text-foreground"
                    >
                      Économisez avec nos abonnements
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Des formules adaptées à vos besoins
                    </p>
                  </div>

                  <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,0.8fr)] items-start gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      {SUBSCRIPTION_PLANS.map((plan) => (
                        <SubscriptionPlanCard key={plan.id} plan={plan} />
                      ))}
                    </div>

                    <ul className="space-y-4">
                      {SUBSCRIPTION_BENEFITS.map((benefit, index) => {
                        const Icon = BENEFIT_ICONS[index] ?? Check;
                        return (
                          <li key={benefit} className="flex items-start gap-3 text-sm text-foreground">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#141414]">
                              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                            </span>
                            {benefit}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="mb-6 overflow-hidden rounded-2xl">
            <div className="relative h-44 w-full sm:h-52">
              <LandingSubscriptionVisual fill />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                <h2
                  id="landing-subscriptions-title"
                  className="text-lg font-bold text-foreground"
                >
                  Nos abonnements
                </h2>
                <p className="mt-1 text-sm text-foreground/80">
                  Économisez avec des formules adaptées à vos besoins
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <SubscriptionPlanCard key={plan.id} plan={plan} compact />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
