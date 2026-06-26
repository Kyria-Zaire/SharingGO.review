import { useQuery } from "@tanstack/react-query";
import { getSubscriptionMe } from "@/api/subscriptions.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";

const SUBSCRIPTION_STALE_MS = 30_000;

export function useSubscriptionMe() {
  return useQuery({
    queryKey: queryKeys.subscriptions.me(),
    queryFn: getSubscriptionMe,
    staleTime: SUBSCRIPTION_STALE_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
