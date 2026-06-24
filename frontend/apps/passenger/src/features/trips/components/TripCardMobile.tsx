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
import { landingDepartureCardClass, landingReserveButtonClass } from "@/features/home/lib/landing-layout";
import {
  TripDayChip,
  TripDurationLabel,
  TripRouteVisual,
} from "./TripRouteVisual";

export function TripCardMobile({ trip }: { trip: PublicTrip }) {
  const availability = deriveTripAvailability(trip);
  const canNavigate = isTripBookable(availability);
  const { remainingSeats, totalSeats } = normalizeTripSeats(trip);
  const seatsLabel = formatRemainingSeatsLabel(remainingSeats, totalSeats);

  return (
    <article
      className={cn(landingDepartureCardClass, "flex flex-col p-5")}
      data-trip-id={trip.id}
      aria-label={`Trajet ${formatTime(trip.departureTime)}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[1.75rem] font-bold leading-none tracking-tight text-foreground">
            {formatTime(trip.departureTime)}
          </p>
          <div className="mt-2">
            <TripDayChip trip={trip} />
          </div>
          <TripDurationLabel departureTime={trip.departureTime} arrivalTime={trip.arrivalTime} />
        </div>
        <p className="text-lg font-bold text-foreground">{LANDING_TICKET_PRICE_LABEL}</p>
      </div>

      <TripRouteVisual startCity={trip.line.startCity} endCity={trip.line.endCity} className="mb-4" />

      <p className="text-sm text-muted-foreground">{seatsLabel}</p>

      <div className="mt-5">
        {canNavigate ? (
          <Link
            to={ROUTES.tripDetail(trip.id)}
            className={cn(landingReserveButtonClass, "w-full justify-center gap-2")}
          >
            {availability.ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span
            className={cn(landingReserveButtonClass, "w-full justify-center opacity-50")}
            aria-disabled
          >
            {availability.ctaLabel}
          </span>
        )}
      </div>
    </article>
  );
}
