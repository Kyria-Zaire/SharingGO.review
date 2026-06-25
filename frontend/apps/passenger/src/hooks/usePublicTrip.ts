import { useQuery } from "@tanstack/react-query";
import { fetchPublicTrip } from "@/api/trips.api";
import { findUiDemoTrip, findUiDemoTripForDetail } from "@/features/trips/demo/demo-trips";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";
import { isUiDemoTripsEnabled } from "@/lib/ui-demo-trips";

const PUBLIC_TRIP_STALE_MS = 30_000;

export function usePublicTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.trips.detail(tripId ?? "unknown"),
    queryFn: async () => {
      if (isUiDemoTripsEnabled() && tripId) {
        const demoTrip = findUiDemoTrip(tripId) ?? findUiDemoTripForDetail(tripId);
        if (demoTrip) {
          return demoTrip;
        }
      }
      return fetchPublicTrip(tripId!);
    },
    enabled: Boolean(tripId),
    staleTime: PUBLIC_TRIP_STALE_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.code === "TRIP_NOT_FOUND") {
        return false;
      }
      return failureCount < 1;
    },
  });
}
