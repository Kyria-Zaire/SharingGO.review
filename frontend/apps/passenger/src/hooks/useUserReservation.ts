import { useQuery } from "@tanstack/react-query";
import { getUserReservation } from "@/api/reservations.api";
import { ApiError } from "@/api/http";
import { findUiDemoBooking } from "@/features/bookings/demo/demo-bookings";
import { queryKeys } from "@/constants/query-keys";
import { isDemoBookingId, isUiDemoTripsEnabled } from "@/lib/ui-demo-trips";

const RESERVATION_DETAIL_STALE_MS = 30_000;

export function useUserReservation(reservationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reservations.detail(reservationId ?? "unknown"),
    queryFn: async () => {
      if (
        reservationId &&
        isUiDemoTripsEnabled() &&
        isDemoBookingId(reservationId)
      ) {
        const demo = findUiDemoBooking(reservationId);
        if (demo) {
          return demo;
        }
      }
      return getUserReservation(reservationId!);
    },
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
