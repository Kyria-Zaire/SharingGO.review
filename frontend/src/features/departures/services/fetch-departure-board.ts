import { listAdminReservations } from "@/api/admin-reservations.api";
import { getAdminTripOccupancy, listAdminTrips } from "@/api/admin-trips.api";
import type { TripOccupancy } from "@/types/trips.types";
import type { DepartureBoardData, DepartureFilters } from "@/types/departures.types";
import {
  buildDepartureTripView,
  countReservationsByTrip,
  sortDepartureViews,
} from "@/features/departures/utils/departure-board";

export async function fetchDepartureBoard(filters: DepartureFilters): Promise<DepartureBoardData> {
  const nowIso = new Date().toISOString();

  const tripFilters = {
    lineId: filters.lineId,
    includeDisabled: filters.includeDisabled,
    from: filters.upcomingOnly !== false ? nowIso : undefined,
  };

  const [tripsResponse, reservationsResponse] = await Promise.all([
    listAdminTrips(tripFilters),
    listAdminReservations({
      lineId: filters.lineId,
      from: tripFilters.from,
      limit: 100,
      offset: 0,
    }),
  ]);

  countReservationsByTrip(reservationsResponse.reservations);

  const occupancyResults = await Promise.allSettled(
    tripsResponse.trips.map((trip) => getAdminTripOccupancy(trip.id))
  );

  const views = tripsResponse.trips.map((trip, index) => {
    const result = occupancyResults[index];
    let occupancy: TripOccupancy | null = null;
    let loaded = false;

    if (result && result.status === "fulfilled") {
      occupancy = result.value;
      loaded = true;
    }

    return buildDepartureTripView(trip, occupancy, loaded);
  });

  let filtered = views;

  if (filters.readiness) {
    filtered = filtered.filter((view) => view.readiness === filters.readiness);
  }

  return {
    departures: sortDepartureViews(filtered),
    fetchedAt: new Date().toISOString(),
  };
}
