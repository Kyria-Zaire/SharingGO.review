import { useQuery } from "@tanstack/react-query";
import { fetchPublicTrip } from "@/api/trips.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";

const PUBLIC_TRIP_STALE_MS = 30_000;

export function usePublicTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.trips.detail(tripId ?? "unknown"),
    queryFn: () => fetchPublicTrip(tripId!),
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
