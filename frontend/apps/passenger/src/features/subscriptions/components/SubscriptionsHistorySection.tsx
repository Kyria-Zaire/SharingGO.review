import { Clock3 } from "lucide-react";
import { SUBSCRIPTIONS_EMPTY } from "@/features/subscriptions/constants/subscriptions-content";
import { SubscriptionsEmptyState } from "@/features/subscriptions/components/SubscriptionsEmptyState";
import { SubscriptionsHistoryList } from "@/features/subscriptions/components/SubscriptionsHistoryList";
import { buildSubscriptionHistoryItems } from "@/features/subscriptions/lib/subscription-history";
import type { Payment } from "@/types/payments";
import type { SubscriptionMeResponse } from "@/types/subscriptions.types";

export function SubscriptionsHistorySection({
  payments,
  me,
}: {
  payments: Payment[];
  me: SubscriptionMeResponse | undefined;
}) {
  const items = buildSubscriptionHistoryItems(payments, me);

  if (items.length === 0) {
    return (
      <div className="pt-6">
        <SubscriptionsEmptyState
          title={SUBSCRIPTIONS_EMPTY.history.title}
          description={SUBSCRIPTIONS_EMPTY.history.description}
          icon={<Clock3 className="h-7 w-7" aria-hidden />}
        />
      </div>
    );
  }

  return (
    <div className="pt-6">
      <SubscriptionsHistoryList items={items} />
    </div>
  );
}
