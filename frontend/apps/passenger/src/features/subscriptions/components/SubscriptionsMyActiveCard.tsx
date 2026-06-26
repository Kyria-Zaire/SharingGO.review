import { CalendarClock, RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import {
  SUBSCRIPTIONS_MANAGE_CTA,
  SUBSCRIPTIONS_MANAGE_TITLE,
} from "@/features/subscriptions/constants/subscriptions-content";
import {
  formatSubscriptionDate,
  formatSubscriptionStatusLabel,
  formatSubscriptionTypeLabel,
} from "@/features/subscriptions/lib/subscription-format";
import type { SafeSubscription } from "@/types/subscriptions.types";

const CARD_CLASS = cn(
  landingCardClass,
  "border-white/[0.08] bg-[#121212] p-5 sm:p-6"
);

export function SubscriptionsMyActiveCard({
  subscription,
}: {
  subscription: SafeSubscription;
}) {
  const renewalLabel = formatSubscriptionDate(subscription.currentPeriodEnd);
  const startLabel = subscription.currentPeriodStart
    ? formatSubscriptionDate(subscription.currentPeriodStart)
    : formatSubscriptionDate(subscription.createdAt);

  return (
    <article className={CARD_CLASS} aria-label="Abonnement actif">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Abonnement actif
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground">
            {formatSubscriptionTypeLabel(subscription.type)}
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          {formatSubscriptionStatusLabel(subscription.status)}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div>
            <dt className="text-xs text-muted-foreground">Date de début</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">{startLabel}</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div>
            <dt className="text-xs text-muted-foreground">Date d&apos;expiration</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">{renewalLabel}</dd>
          </div>
        </div>
        <div className="flex items-start gap-3 sm:col-span-2">
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div>
            <dt className="text-xs text-muted-foreground">Renouvellement</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">
              Renouvellement prévu le {renewalLabel}
            </dd>
          </div>
        </div>
      </dl>

      <Button
        variant="secondary"
        className="mt-6"
        disabled
        title={SUBSCRIPTIONS_MANAGE_TITLE}
      >
        {SUBSCRIPTIONS_MANAGE_CTA}
      </Button>
    </article>
  );
}
