import { ApiError } from "@/api/http";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import {
  SUBSCRIPTION_CATALOG_PLANS,
  SUBSCRIPTIONS_EMPTY,
} from "@/features/subscriptions/constants/subscriptions-content";
import {
  SubscriptionsBillingToggle,
  type BillingPeriod,
} from "@/features/subscriptions/components/SubscriptionsBillingToggle";
import { SubscriptionsMosolfCodeDialog } from "@/features/subscriptions/components/SubscriptionsMosolfCodeDialog";
import { SubscriptionsPlanCard } from "@/features/subscriptions/components/SubscriptionsPlanCard";
import { SubscriptionsPromoBanner } from "@/features/subscriptions/components/SubscriptionsPromoBanner";
import { SubscriptionsEmptyState } from "@/features/subscriptions/components/SubscriptionsEmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionCheckout } from "@/hooks/useSubscriptionCheckout";
import type { SubscriptionType } from "@/types/subscriptions.types";
import { BadgePercent } from "lucide-react";
import { useState } from "react";

const MOSOLF_TYPE: SubscriptionType = "MOSOLF_MONTHLY";

export function SubscriptionsPlansSection({
  hasActiveSubscription,
  plansUnavailable,
}: {
  hasActiveSubscription: boolean;
  plansUnavailable?: boolean;
}) {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [selectedType, setSelectedType] = useState<SubscriptionType | null>(null);
  const [mosolfDialogOpen, setMosolfDialogOpen] = useState(false);
  const checkout = useSubscriptionCheckout();

  const startCheckout = (type: SubscriptionType) => {
    setSelectedType(type);
    checkout.mutate(type, {
      onSettled: () => setSelectedType(null),
    });
  };

  const handleSelect = (type: SubscriptionType) => {
    if (type === MOSOLF_TYPE) {
      setMosolfDialogOpen(true);
      return;
    }
    startCheckout(type);
  };

  const checkoutError =
    checkout.error instanceof ApiError
      ? formatUserFacingError(checkout.error, USER_MESSAGES.generic)
      : null;

  if (plansUnavailable) {
    return (
      <div className="pt-6">
        <SubscriptionsEmptyState
          title={SUBSCRIPTIONS_EMPTY.plansUnavailable.title}
          description={SUBSCRIPTIONS_EMPTY.plansUnavailable.description}
          icon={<BadgePercent className="h-7 w-7" aria-hidden />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      <SubscriptionsPromoBanner />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Deux formules mensuelles sur la ligne Châlons ↔ Vatry.
        </p>
        <SubscriptionsBillingToggle value={billingPeriod} onChange={setBillingPeriod} />
      </div>

      {hasActiveSubscription ? (
        <p className="rounded-xl border border-white/[0.08] bg-[#121212] px-4 py-3 text-sm text-muted-foreground">
          Vous avez déjà un abonnement actif. Consultez l&apos;onglet Mes abonnements.
        </p>
      ) : null}

      {checkoutError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {checkoutError}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {SUBSCRIPTION_CATALOG_PLANS.map((plan) => (
          <SubscriptionsPlanCard
            key={plan.id}
            plan={plan}
            billingPeriod={billingPeriod}
            onSelect={handleSelect}
            isLoading={checkout.isPending && selectedType === plan.apiType}
            disabled={hasActiveSubscription}
          />
        ))}
      </div>

      <SubscriptionsMosolfCodeDialog
        open={mosolfDialogOpen}
        userEmail={user?.email}
        onClose={() => setMosolfDialogOpen(false)}
        onContinueCheckout={() => startCheckout(MOSOLF_TYPE)}
      />
    </div>
  );
}
