import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { SubscriptionsErrorCard } from "@/features/subscriptions/components/SubscriptionsErrorCard";
import { SubscriptionsFaqSection } from "@/features/subscriptions/components/SubscriptionsFaqSection";
import { SubscriptionsFilterTabs } from "@/features/subscriptions/components/SubscriptionsFilterTabs";
import { SubscriptionsHeroSection } from "@/features/subscriptions/components/SubscriptionsHeroSection";
import { SubscriptionsHistorySection } from "@/features/subscriptions/components/SubscriptionsHistorySection";
import { SubscriptionsMySection } from "@/features/subscriptions/components/SubscriptionsMySection";
import { SubscriptionsPlansSection } from "@/features/subscriptions/components/SubscriptionsPlansSection";
import { SubscriptionsSkeleton } from "@/features/subscriptions/components/SubscriptionsSkeleton";
import { SubscriptionsWhySection } from "@/features/subscriptions/components/SubscriptionsWhySection";
import { buildSubscriptionHistoryItems } from "@/features/subscriptions/lib/subscription-history";
import type { SubscriptionsFilter } from "@/features/subscriptions/lib/subscriptions-tabs";
import { useSubscriptionMe } from "@/hooks/useSubscriptionMe";
import { useSubscriptionPaymentHistory } from "@/hooks/useSubscriptionPaymentHistory";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";

export function SubscriptionsView() {
  const [filter, setFilter] = useState<SubscriptionsFilter>("plans");
  const meQuery = useSubscriptionMe();
  const historyQuery = useSubscriptionPaymentHistory();

  const isLoading = meQuery.isPending || historyQuery.isPending;
  const isError = meQuery.isError || historyQuery.isError;
  const errorMessage = formatUserFacingError(
    meQuery.error ?? historyQuery.error,
    USER_MESSAGES.subscriptionsLoad
  );

  const me = meQuery.data;
  const payments = useMemo(
    () => historyQuery.data?.payments ?? [],
    [historyQuery.data?.payments]
  );

  const tabCounts = useMemo(
    () => ({
      mine: me?.isActive ? 1 : 0,
      history: buildSubscriptionHistoryItems(payments, me).length,
    }),
    [me, payments]
  );

  const handleRetry = () => {
    void meQuery.refetch();
    void historyQuery.refetch();
  };

  return (
    <div className="w-full">
      <SubscriptionsHeroSection />

      <div className={landingContainerClass}>
        <div className={cn("relative z-20 -mt-4 sm:-mt-10 lg:-mt-12", "pb-8 pt-0 lg:pb-12")}>
          <SubscriptionsFilterTabs value={filter} onChange={setFilter} counts={tabCounts} />

          {isLoading ? <SubscriptionsSkeleton /> : null}

          {isError && !isLoading ? (
            <div className="pt-6">
              <SubscriptionsErrorCard message={errorMessage} onRetry={handleRetry} />
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <>
              {filter === "plans" ? (
                <>
                  <SubscriptionsPlansSection hasActiveSubscription={Boolean(me?.isActive)} />
                  <SubscriptionsWhySection />
                  <SubscriptionsFaqSection />
                </>
              ) : null}

              {filter === "mine" && me ? (
                <SubscriptionsMySection me={me} onExplorePlans={() => setFilter("plans")} />
              ) : null}

              {filter === "history" ? (
                <SubscriptionsHistorySection payments={payments} me={me} />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
