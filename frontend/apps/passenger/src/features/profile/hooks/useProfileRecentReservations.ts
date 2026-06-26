import { useQuery } from "@tanstack/react-query";
import { listUserReservations } from "@/api/reservations.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";

const STALE_MS = 30_000;

export function useProfileRecentReservations() {
  return useQuery({
    queryKey: queryKeys.reservations.list({ profileRecent: true, limit: 3, offset: 0 }),
    queryFn: () => listUserReservations({ limit: 3, offset: 0 }),
    staleTime: STALE_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
