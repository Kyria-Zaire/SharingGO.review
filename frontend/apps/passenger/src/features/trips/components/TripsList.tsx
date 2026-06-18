import { TripCard } from "@/features/trips/components/TripCard";
import { sortTripsByDeparture } from "@/lib/trip-availability";
import type { PublicTrip } from "@/types/trips.types";

export function TripsList({ trips }: { trips: PublicTrip[] }) {
  const sorted = sortTripsByDeparture(trips);

  return (
    <ul className="space-y-3" aria-label="Liste des trajets">
      {sorted.map((trip) => (
        <li key={trip.id}>
          <TripCard trip={trip} />
        </li>
      ))}
    </ul>
  );
}

export function TripsListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {[1, 2, 3].map((key) => (
        <div key={key} className="h-44 animate-pulse rounded-xl border border-border bg-muted/30" />
      ))}
    </div>
  );
}
