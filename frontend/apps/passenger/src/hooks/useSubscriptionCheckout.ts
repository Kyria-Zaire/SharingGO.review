import { useMutation } from "@tanstack/react-query";
import { createSubscriptionCheckout } from "@/api/subscriptions.api";
import { queryKeys } from "@/constants/query-keys";
import type { SubscriptionType } from "@/types/subscriptions.types";

export function useSubscriptionCheckout() {
  return useMutation({
    mutationKey: queryKeys.subscriptions.checkout(),
    mutationFn: (type: SubscriptionType) => createSubscriptionCheckout(type),
    onSuccess: (data) => {
      window.location.assign(data.checkoutUrl);
    },
  });
}
