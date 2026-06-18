import { useQuery } from "@tanstack/react-query";
import { getPendingReservation } from "@/api/reservations.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";

const PENDING_POLL_MS = 15_000;

export function usePendingReservation(pendingReservationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reservations.pending(pendingReservationId ?? "unknown"),
    queryFn: () => getPendingReservation(pendingReservationId!),
    enabled: Boolean(pendingReservationId),
    staleTime: 5_000,
    refetchInterval: (query) => {
      const error = query.state.error;
      if (error instanceof ApiError) {
        if (error.status === 410 || error.code === "PENDING_EXPIRED") {
          return false;
        }
        if (error.code === "PENDING_NOT_FOUND" || error.code === "FORBIDDEN") {
          return false;
        }
      }
      const data = query.state.data;
      if (data?.isExpired) {
        return false;
      }
      return PENDING_POLL_MS;
    },
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error instanceof ApiError) {
        if (
          error.status === 410 ||
          error.code === "PENDING_EXPIRED" ||
          error.code === "PENDING_NOT_FOUND" ||
          error.code === "FORBIDDEN"
        ) {
          return false;
        }
      }
      return failureCount < 1;
    },
  });
}
