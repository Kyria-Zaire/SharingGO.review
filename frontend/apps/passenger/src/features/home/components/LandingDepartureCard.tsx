import { Armchair } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format-date";
import { isTripBookable, deriveTripAvailability } from "@/lib/trip-availability";
import { ROUTES } from "@/types/routes";
import type { PublicTrip } from "@/types/trips.types";
import {
  LANDING_TICKET_PRICE_LABEL,
  formatRemainingSeatsLabel,
  formatTripDayBadgeLabel,
  isTripToday,
  isTripTomorrow,
  shortCityLabel,
} from "@/features/home/lib/landing-trip-utils";
import { formatTripCityShort } from "@/lib/trip-city-labels";
import {
  landingDepartureCardClass,
  landingReserveButtonClass,
} from "@/features/home/lib/landing-layout";

function RouteLabel({ from, to }: { from: string; to: string }) {
  return (
    <div className="space-y-0.5 text-sm font-semibold leading-snug text-foreground">
      <p>{from}</p>
      <p>
        <span className="text-primary">→</span> {to}
      </p>
    </div>
  );
}

function TodayBadge() {
  return (
    <span className="inline-flex rounded-md bg-primary px-2 py-0.5 text-[0.65rem] font-semibold leading-none text-primary-foreground">
      Aujourd&apos;hui
    </span>
  );
}

function TomorrowBadge() {
  return (
    <span className="inline-flex rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold leading-none text-primary">
      Demain
    </span>
  );
}

function DateBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[0.65rem] font-semibold leading-none text-foreground/85">
      {label}
    </span>
  );
}

function TripDayBadge({ trip }: { trip: PublicTrip }) {
  if (isTripToday(trip)) return <TodayBadge />;
  if (isTripTomorrow(trip)) return <TomorrowBadge />;
  return <DateBadge label={formatTripDayBadgeLabel(trip)} />;
}

export interface LandingDepartureCardProps {
  trip: PublicTrip;
}

export function LandingDepartureCard({ trip }: LandingDepartureCardProps) {
  const availability = deriveTripAvailability(trip);
  const canBook = isTripBookable(availability);
  const seatsLabel = formatRemainingSeatsLabel(trip);

  return (
    <article className={cn(landingDepartureCardClass, "flex min-h-[11.5rem] flex-col p-6")}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <TripDayBadge trip={trip} />
        <Armchair className="h-[1.125rem] w-[1.125rem] stroke-[1.5] text-foreground/45" aria-hidden />
      </div>

      <p className="text-[1.75rem] font-bold leading-none tracking-tight text-foreground">
        {formatTime(trip.departureTime)}
      </p>

      <div className="mt-2.5">
        <RouteLabel from={formatTripCityShort(trip.line.startCity)} to={shortCityLabel(trip.line.endCity)} />
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground">{seatsLabel}</p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <p className="text-base font-bold text-foreground">{LANDING_TICKET_PRICE_LABEL}</p>
        {canBook ? (
          <Link to={ROUTES.tripDetail(trip.id)} className={cn(landingReserveButtonClass, "shrink-0")}>
            Réserver
          </Link>
        ) : (
          <span className={cn(landingReserveButtonClass, "cursor-not-allowed opacity-50")} aria-disabled>
            {availability.ctaLabel}
          </span>
        )}
      </div>
    </article>
  );
}
