import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { SUBSCRIPTIONS_MOSOLF_CTA, SUBSCRIPTIONS_PLAN_CTA } from "@/features/subscriptions/constants/subscriptions-content";
import { resolvePlanPriceLabel } from "@/features/subscriptions/lib/subscription-format";
import type { BillingPeriod } from "@/features/subscriptions/components/SubscriptionsBillingToggle";
import type { SubscriptionType } from "@/types/subscriptions.types";

export function SubscriptionsPlanCard({
  plan,
  billingPeriod,
  onSelect,
  isLoading,
  disabled,
  ctaLabel,
}: {
  plan: {
    id: string;
    apiType: SubscriptionType;
    title: string;
    priceMonthly: number;
    description: string;
    features: readonly string[];
    popular: boolean;
  };
  billingPeriod: BillingPeriod;
  onSelect: (type: SubscriptionType) => void;
  isLoading: boolean;
  disabled?: boolean;
  ctaLabel?: string;
}) {
  const { price, period } = resolvePlanPriceLabel(plan.priceMonthly, billingPeriod);

  return (
    <article
      className={cn(
        landingCardClass,
        "relative flex h-full flex-col border-white/[0.08] bg-[#121212] p-5 sm:p-6",
        plan.popular ? "border-primary/35" : ""
      )}
    >
      {plan.popular ? (
        <span className="absolute -top-3 left-4 z-10 inline-flex rounded-md bg-primary px-2 py-0.5 text-[0.65rem] font-bold uppercase text-primary-foreground">
          Populaire
        </span>
      ) : null}

      <h3 className="text-lg font-semibold text-foreground">{plan.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

      <p className="mt-5 flex flex-wrap items-baseline gap-x-1">
        <span className="text-3xl font-bold text-foreground">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </p>

      <ul className="mt-5 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="mt-6 w-full"
        size="lg"
        onClick={() => onSelect(plan.apiType)}
        isLoading={isLoading}
        disabled={disabled || billingPeriod === "annual"}
      >
        {ctaLabel ?? (plan.id === "mosolf" ? SUBSCRIPTIONS_MOSOLF_CTA : SUBSCRIPTIONS_PLAN_CTA)}
      </Button>
    </article>
  );
}
