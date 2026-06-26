import { Link } from "react-router-dom";
import { BadgePercent, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  landingCardClass,
  landingOutlineButtonClass,
  landingPrimaryButtonClass,
} from "@/features/home/lib/landing-layout";
import { PROFILE_SUBSCRIPTION } from "@/features/profile/constants/profile-content";
import {
  formatSubscriptionDate,
  formatSubscriptionStatusLabel,
  formatSubscriptionTypeLabel,
} from "@/features/subscriptions/lib/subscription-format";
import { resolveSubscriptionPlanPrice } from "@/features/profile/lib/profile-format";
import type { SubscriptionMeResponse } from "@/types/subscriptions.types";
import { ROUTES } from "@/types/routes";

const CARD_CLASS = cn(landingCardClass, "border-white/[0.08] bg-[#121212] p-5 sm:p-6");

export function ProfileSubscriptionCard({ me }: { me: SubscriptionMeResponse | undefined }) {
  const subscription = me?.subscription;
  const isActive = Boolean(me?.isActive && subscription);

  if (!isActive || !subscription) {
    return (
      <article className={CARD_CLASS} aria-label="Abonnement">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#161616] text-primary">
            <BadgePercent className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            {PROFILE_SUBSCRIPTION.emptyTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {PROFILE_SUBSCRIPTION.emptyDescription}
          </p>
          <Link to={ROUTES.subscriptions} className={cn(landingPrimaryButtonClass, "mt-6")}>
            {PROFILE_SUBSCRIPTION.discoverCta}
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className={CARD_CLASS} aria-label="Abonnement actif">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {PROFILE_SUBSCRIPTION.activeLabel}
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground">
            {formatSubscriptionTypeLabel(subscription.type)}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {resolveSubscriptionPlanPrice(subscription.type)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          {formatSubscriptionStatusLabel(subscription.status)}
        </span>
      </div>

      <dl className="mt-5">
        <div>
          <dt className="text-xs text-muted-foreground">{PROFILE_SUBSCRIPTION.nextBilling}</dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">
            {formatSubscriptionDate(subscription.currentPeriodEnd)}
          </dd>
        </div>
      </dl>

      <Link to={ROUTES.subscriptions} className={cn(landingOutlineButtonClass, "mt-6 inline-flex w-full")}>
        {PROFILE_SUBSCRIPTION.viewCta}
      </Link>
    </article>
  );
}
