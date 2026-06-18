import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TripAvailabilityBadge } from "@/features/trips/components/TripAvailabilityBadge";
import { TICKET_PRICE_LABEL } from "@/constants/pricing";
import { deriveTripAvailability } from "@/lib/trip-availability";
import { formatDayLabel, formatTime } from "@/lib/format-date";
import type { PublicTrip } from "@/types/trips.types";

export interface TripCardProps {
  trip: PublicTrip;
}

export function TripCard({ trip }: TripCardProps) {
  const availability = deriveTripAvailability(trip);
  const routeLabel = `${trip.line.startCity} → ${trip.line.endCity}`;

  return (
    <Card
      className="p-4"
      data-trip-id={trip.id}
      aria-label={`Trajet ${formatTime(trip.departureTime)}`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">{formatDayLabel(trip.departureTime)}</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {formatTime(trip.departureTime)}
            {trip.arrivalTime ? (
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                → {formatTime(trip.arrivalTime)}
              </span>
            ) : null}
          </p>
        </div>
        <TripAvailabilityBadge label={availability.label} status={availability.status} />
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Trajet</dt>
          <dd className="font-medium text-foreground">{routeLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Places restantes</dt>
          <dd className="font-medium text-foreground">
            {trip.remainingSeats} / {trip.totalSeats}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Ticket</dt>
          <dd className="font-semibold text-primary">{TICKET_PRICE_LABEL}</dd>
        </div>
      </dl>

      <Button
        variant={availability.status === "available" || availability.status === "almost_full" ? "primary" : "secondary"}
        className="w-full"
        disabled={availability.ctaDisabled}
        aria-disabled={availability.ctaDisabled}
      >
        {availability.ctaLabel}
      </Button>
    </Card>
  );
}
