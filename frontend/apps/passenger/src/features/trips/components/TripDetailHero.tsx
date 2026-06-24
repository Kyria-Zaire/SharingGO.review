import { TripAvailabilityBadge } from "@/features/trips/components/TripAvailabilityBadge";
import { deriveTripAvailability } from "@/lib/trip-availability";
import { formatTripRouteFull } from "@/lib/trip-city-labels";
import { formatDayLabel } from "@/lib/format-date";
import type { PublicTrip } from "@/types/trips.types";

export interface TripDetailHeroProps {
  trip: PublicTrip;
}

export function TripDetailHero({ trip }: TripDetailHeroProps) {
  const availability = deriveTripAvailability(trip);
  const routeLabel = formatTripRouteFull(trip.line.startCity, trip.line.endCity);

  return (
    <section className="mb-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {formatDayLabel(trip.departureTime)}
        </p>
        <TripAvailabilityBadge label={availability.label} status={availability.status} />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{routeLabel}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{trip.line.name}</p>
    </section>
  );
}
