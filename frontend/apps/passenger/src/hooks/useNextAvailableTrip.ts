import { useQuery } from "@tanstack/react-query";
import { fetchPublicTrips } from "@/api/trips.api";
import { queryKeys } from "@/constants/query-keys";
import { toParisDateKey } from "@/lib/format-date";
import { sortTripsByDeparture } from "@/lib/trip-availability";
import type { PublicTrip } from "@/types/trips.types";

const NEXT_TRIP_STALE_MS = 30_000;

/** Prochain trajet à venir (API `from=now`) — pour le filtre « Prochain départ ». */
export function useNextAvailableTrip() {
  return useQuery({
    queryKey: queryKeys.trips.list({ from: "next-available" }),
    queryFn: async (): Promise<PublicTrip | null> => {
      const response = await fetchPublicTrips({
        from: new Date().toISOString(),
        limit: 50,
      });
      const sorted = sortTripsByDeparture(response.trips);
      return sorted[0] ?? null;
    },
    staleTime: NEXT_TRIP_STALE_MS,
  });
}

export function nextTripDateKey(trip: PublicTrip | null | undefined): string | null {
  if (!trip) return null;
  return toParisDateKey(new Date(trip.departureTime));
}
