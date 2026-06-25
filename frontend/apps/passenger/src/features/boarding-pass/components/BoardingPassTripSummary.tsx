import { Bus, Calendar, Clock, Info, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  BOARDING_PASS_DRIVER_NOTE,
  BOARDING_PASS_MEETING_LABEL,
  BOARDING_PASS_TRIP_SUMMARY_TITLE,
  BOARDING_PASS_VIEW_TRIP_CTA,
} from "@/features/boarding-pass/constants/boarding-pass-content";
import { resolveBookingStopPoint } from "@/features/bookings/lib/booking-card-format";
import {
  formatTime,
  formatTripCalendarDate,
  formatTripDuration,
} from "@/lib/format-date";
import {
  formatTripCityFull,
  formatTripCityShort,
} from "@/lib/trip-city-labels";
import { ROUTES } from "@/types/routes";
import type { UserReservationTrip } from "@/types/reservations";

const CARD_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

function TripRouteTimeline({ trip }: { trip: UserReservationTrip }) {
  const startCity = formatTripCityFull(trip.line.startCity);
  const endCity = formatTripCityFull(trip.line.endCity);
  const startStop = resolveBookingStopPoint(trip.line.startCity);
  const endStop = resolveBookingStopPoint(trip.line.endCity);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1">
        <span className="h-2.5 w-2.5 rounded-full border border-primary/50 bg-transparent" aria-hidden />
        <span className="my-1 min-h-[3.5rem] w-px border-l border-dashed border-primary/35" aria-hidden />
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Bus className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="my-1 min-h-[3.5rem] w-px border-l border-dashed border-primary/35" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full border border-white/30 bg-transparent" aria-hidden />
      </div>
      <div className="min-w-0 space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground">{formatTripCityShort(trip.line.startCity)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {startCity}
            {startStop ? ` · ${startStop}` : ""}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{formatTripCityShort(trip.line.endCity)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {endCity}
            {endStop ? ` · ${endStop}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BoardingPassTripSummary({
  trip,
  className,
  showCta = true,
}: {
  trip: UserReservationTrip;
  className?: string;
  showCta?: boolean;
}) {
  const duration = formatTripDuration(trip.departureTime, trip.arrivalTime);
  const timeRange = `${formatTime(trip.departureTime)} → ${
    trip.arrivalTime ? formatTime(trip.arrivalTime) : "—"
  }${duration ? ` (${duration})` : ""}`;

  return (
    <aside className={cn(CARD_CLASS, className)} aria-label="Résumé du trajet">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-semibold text-foreground">{BOARDING_PASS_TRIP_SUMMARY_TITLE}</h2>
      </div>

      <div className="mt-4">
        <TripRouteTimeline trip={trip} />
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-start gap-2.5">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <dt className="sr-only">Date</dt>
            <dd className="font-medium text-foreground">
              {formatTripCalendarDate(trip.departureTime)}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <dt className="sr-only">Horaires</dt>
            <dd className="font-medium text-foreground">{timeRange}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <dt className="sr-only">Rendez-vous</dt>
            <dd className="text-foreground">{BOARDING_PASS_MEETING_LABEL}</dd>
            <dd className="mt-1 text-xs text-muted-foreground">{BOARDING_PASS_DRIVER_NOTE}</dd>
          </div>
        </div>
      </dl>

      {showCta ? (
        <Link
          to={ROUTES.tripDetail(trip.id)}
          className={cn(
            "mt-5 inline-flex min-h-[2.5rem] w-full items-center justify-center rounded-lg",
            "border border-white/15 px-4 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.04]"
          )}
        >
          {BOARDING_PASS_VIEW_TRIP_CTA}
        </Link>
      ) : null}
    </aside>
  );
}

/** CTA mobile pleine largeur en bas de parcours. */
export function BoardingPassMobileTripCta({ tripId }: { tripId: string }) {
  return (
    <Link
      to={ROUTES.tripDetail(tripId)}
      className={cn(
        "inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg bg-primary px-5",
        "text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 lg:hidden"
      )}
    >
      {BOARDING_PASS_VIEW_TRIP_CTA}
    </Link>
  );
}
