import { CreditCard } from "lucide-react";
import { SUBSCRIPTIONS_EMPTY } from "@/features/subscriptions/constants/subscriptions-content";
import { SubscriptionsEmptyState } from "@/features/subscriptions/components/SubscriptionsEmptyState";
import { SubscriptionsMyActiveCard } from "@/features/subscriptions/components/SubscriptionsMyActiveCard";
import type { SubscriptionMeResponse } from "@/types/subscriptions.types";

export function SubscriptionsMySection({
  me,
  onExplorePlans,
}: {
  me: SubscriptionMeResponse;
  onExplorePlans: () => void;
}) {
  if (me.isActive && me.subscription) {
    return (
      <div className="pt-6">
        <SubscriptionsMyActiveCard subscription={me.subscription} />
      </div>
    );
  }

  return (
    <div className="pt-6">
      <SubscriptionsEmptyState
        title={SUBSCRIPTIONS_EMPTY.mine.title}
        description={SUBSCRIPTIONS_EMPTY.mine.description}
        icon={<CreditCard className="h-7 w-7" aria-hidden />}
        onExplorePlans={onExplorePlans}
      />
    </div>
  );
}
