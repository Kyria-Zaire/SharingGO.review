import { useQuery } from "@tanstack/react-query";
import { listPayments } from "@/api/payments.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";

const HISTORY_STALE_MS = 30_000;

export function useSubscriptionPaymentHistory() {
  return useQuery({
    queryKey: queryKeys.subscriptions.history(),
    queryFn: () => listPayments({ type: "SUBSCRIPTION", limit: 50, offset: 0 }),
    staleTime: HISTORY_STALE_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
