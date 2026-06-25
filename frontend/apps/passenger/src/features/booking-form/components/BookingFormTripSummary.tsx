import { ArrowRight, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { TRIP_DETAIL_STOP_POINTS } from "@/features/trips/constants/trip-detail-content";
import {
  formatTime,
  formatTripCalendarDate,
  formatTripDuration,
} from "@/lib/format-date";
import {
  formatTripCityFull,
  formatTripCityShort,
  isChalonsCity,
  isVatryCity,
} from "@/lib/trip-city-labels";
import { formatRemainingSeatsLabel, normalizeTripSeats } from "@/lib/trip-availability";
import type { PublicTrip } from "@/types/trips.types";

const CARD_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:p-5";

function resolveStopPoint(city: string): string {
  if (isChalonsCity(city)) return TRIP_DETAIL_STOP_POINTS.chalons;
  if (isVatryCity(city)) return TRIP_DETAIL_STOP_POINTS.vatry;
  return "";
}

export function BookingFormTripSummary({
  trip,
  className,
  compact = false,
}: {
  trip: PublicTrip;
  className?: string;
  compact?: boolean;
}) {
  const duration = formatTripDuration(trip.departureTime, trip.arrivalTime);
  const { remainingSeats, totalSeats } = normalizeTripSeats(trip);
  const seatsLabel = formatRemainingSeatsLabel(remainingSeats, totalSeats);
  const startShort = formatTripCityShort(trip.line.startCity);
  const endShort = formatTripCityShort(trip.line.endCity);
  const startFull = formatTripCityFull(trip.line.startCity);
  const endFull = formatTripCityFull(trip.line.endCity);
  const startStop = resolveStopPoint(trip.line.startCity);
  const endStop = resolveStopPoint(trip.line.endCity);
  const dateLabel = formatTripCalendarDate(trip.departureTime);

  return (
    <section className={cn(CARD_CLASS, className)} aria-label="Résumé du trajet">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-semibold text-foreground">Votre trajet</h2>
      </div>

      <p className="mt-3 text-base font-semibold text-foreground">
        <span>{startShort}</span>
        <ArrowRight className="mx-1.5 inline h-4 w-4 text-primary" aria-hidden />
        <span>{endShort}</span>
      </p>

      <p className="mt-1 text-sm text-muted-foreground">{dateLabel}</p>

      <dl className={cn("mt-4 grid gap-3", compact ? "grid-cols-2" : "sm:grid-cols-2")}>
        <div>
          <dt className="text-xs text-muted-foreground">Départ</dt>
          <dd className="mt-0.5 text-sm font-semibold text-foreground">
            {formatTime(trip.departureTime)}
          </dd>
          <dd className="mt-0.5 text-xs text-muted-foreground">
            {startFull}
            {startStop ? ` · ${startStop}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Arrivée</dt>
          <dd className="mt-0.5 text-sm font-semibold text-foreground">
            {trip.arrivalTime ? formatTime(trip.arrivalTime) : "—"}
          </dd>
          <dd className="mt-0.5 text-xs text-muted-foreground">
            {endFull}
            {endStop ? ` · ${endStop}` : ""}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {duration ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            Durée estimée : <span className="font-medium text-foreground">{duration}</span>
          </span>
        ) : null}
        <span>{seatsLabel}</span>
      </div>
    </section>
  );
}
