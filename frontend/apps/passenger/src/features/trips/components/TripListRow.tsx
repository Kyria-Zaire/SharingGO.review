import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { LANDING_TICKET_PRICE_LABEL } from "@/features/home/lib/landing-trip-utils";
import {
  deriveTripAvailability,
  formatRemainingSeatsLabel,
  isTripBookable,
  normalizeTripSeats,
} from "@/lib/trip-availability";
import { formatTime } from "@/lib/format-date";
import { ROUTES } from "@/types/routes";
import type { PublicTrip } from "@/types/trips.types";
import {
  TripDayChip,
  TripDurationLabel,
  TripRouteVisual,
} from "./TripRouteVisual";

export interface TripListRowProps {
  trip: PublicTrip;
  highlighted?: boolean;
}

export function TripListRow({ trip, highlighted }: TripListRowProps) {
  const availability = deriveTripAvailability(trip);
  const canNavigate = isTripBookable(availability);
  const { remainingSeats, totalSeats } = normalizeTripSeats(trip);
  const seatsLabel = formatRemainingSeatsLabel(remainingSeats, totalSeats);

  return (
    <article
      className={cn(
        "relative grid grid-cols-[minmax(0,5.5rem)_minmax(0,1fr)_minmax(0,8rem)_minmax(0,9.5rem)] items-center gap-6 rounded-2xl border border-white/[0.08] bg-[#1a1d23] px-6 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.35)]",
        highlighted && "border-l-[3px] border-l-primary pl-[calc(1.5rem-3px)]"
      )}
      data-trip-id={trip.id}
      aria-label={`Trajet ${formatTime(trip.departureTime)}`}
    >
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {formatTime(trip.departureTime)}
        </p>
        <div className="mt-2">
          <TripDayChip trip={trip} />
        </div>
        <TripDurationLabel departureTime={trip.departureTime} arrivalTime={trip.arrivalTime} />
      </div>

      <TripRouteVisual startCity={trip.line.startCity} endCity={trip.line.endCity} />

      <p className="text-sm font-medium text-foreground">{seatsLabel}</p>

      <div className="flex flex-col items-end gap-3">
        <p className="text-xl font-bold text-foreground">{LANDING_TICKET_PRICE_LABEL}</p>
        {canNavigate ? (
          <Link
            to={ROUTES.tripDetail(trip.id)}
            className="inline-flex min-h-touch items-center gap-2 rounded-lg border border-primary/60 px-4 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {availability.ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span
            className="inline-flex min-h-touch items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-muted-foreground opacity-60"
            aria-disabled
          >
            {availability.ctaLabel}
          </span>
        )}
      </div>
    </article>
  );
}
