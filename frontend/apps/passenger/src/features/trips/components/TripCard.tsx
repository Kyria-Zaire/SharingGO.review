import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TripAvailabilityBadge } from "@/features/trips/components/TripAvailabilityBadge";
import { TICKET_PRICE_LABEL } from "@/constants/pricing";
import { deriveTripAvailability, formatRemainingSeatsLabel, isTripBookable, normalizeTripSeats } from "@/lib/trip-availability";
import { formatDayLabel, formatTime } from "@/lib/format-date";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/types/routes";
import type { PublicTrip } from "@/types/trips.types";

export interface TripCardProps {
  trip: PublicTrip;
}

export function TripCard({ trip }: TripCardProps) {
  const availability = deriveTripAvailability(trip);
  const seats = normalizeTripSeats(trip);
  const routeLabel = `${trip.line.startCity} → ${trip.line.endCity}`;
  const canNavigate = isTripBookable(availability);
  const ctaVariant =
    availability.status === "available" || availability.status === "almost_full"
      ? "primary"
      : "secondary";

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
            {formatRemainingSeatsLabel(seats.remainingSeats, seats.totalSeats)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Ticket</dt>
          <dd className="font-semibold text-primary">{TICKET_PRICE_LABEL}</dd>
        </div>
      </dl>

      {canNavigate ? (
        <Link
          to={ROUTES.tripDetail(trip.id)}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-md font-medium transition-colors",
            "min-h-touch px-4 text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            ctaVariant === "primary"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80"
              : "border border-border bg-muted text-foreground hover:bg-muted/80 active:bg-muted/60"
          )}
        >
          {availability.ctaLabel}
        </Link>
      ) : (
        <Button variant={ctaVariant} className="w-full" disabled aria-disabled>
          {availability.ctaLabel}
        </Button>
      )}
    </Card>
  );
}
