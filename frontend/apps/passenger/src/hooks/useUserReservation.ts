import { useQuery } from "@tanstack/react-query";
import { getUserReservation } from "@/api/reservations.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";

const RESERVATION_DETAIL_STALE_MS = 30_000;

export function useUserReservation(reservationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reservations.detail(reservationId ?? "unknown"),
    queryFn: () => getUserReservation(reservationId!),
    enabled: Boolean(reservationId),
    staleTime: RESERVATION_DETAIL_STALE_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.code === "RESERVATION_NOT_FOUND") {
        return false;
      }
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
