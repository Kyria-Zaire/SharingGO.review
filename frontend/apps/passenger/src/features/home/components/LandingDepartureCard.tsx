import { Armchair } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format-date";
import { isTripBookable, deriveTripAvailability } from "@/lib/trip-availability";
import { ROUTES } from "@/types/routes";
import type { PublicTrip } from "@/types/trips.types";
import {
  LANDING_TICKET_PRICE_LABEL,
  formatRemainingSeatsLabel,
  formatTripRouteShort,
  isTripToday,
} from "@/features/home/lib/landing-trip-utils";
import { landingCardClass, landingOutlineButtonClass } from "@/features/home/lib/landing-layout";

export interface LandingDepartureCardProps {
  trip: PublicTrip;
  variant?: "desktop" | "mobile";
}

export function LandingDepartureCard({ trip, variant = "desktop" }: LandingDepartureCardProps) {
  const availability = deriveTripAvailability(trip);
  const canBook = isTripBookable(availability);
  const route = formatTripRouteShort(trip);
  const seatsLabel = formatRemainingSeatsLabel(trip);
  const showTodayBadge = isTripToday(trip);

  if (variant === "mobile") {
    return (
      <article className={cn(landingCardClass, "flex items-stretch gap-4 p-4")}>
        <div className="min-w-0 flex-1">
          {showTodayBadge ? (
            <Badge variant="success" className="mb-2 text-[0.65rem]">
              Aujourd&apos;hui
            </Badge>
          ) : null}
          <p className="text-xl font-bold text-foreground">{formatTime(trip.departureTime)}</p>
          <p className="mt-1 text-sm text-foreground">
            <span className="text-primary">{route.split(" → ")[0]}</span>
            <span className="text-muted-foreground"> → </span>
            <span className="text-primary">{route.split(" → ")[1]}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{seatsLabel}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end justify-between">
          <Armchair className="h-5 w-5 text-muted-foreground/70" aria-hidden />
          <p className="text-base font-bold text-foreground">{LANDING_TICKET_PRICE_LABEL}</p>
        </div>
      </article>
    );
  }

  return (
    <article className={cn(landingCardClass, "flex h-full flex-col p-5")}>
      <div className="mb-4 flex items-start justify-between gap-2">
        {showTodayBadge ? (
          <Badge variant="success" className="text-[0.65rem]">
            Aujourd&apos;hui
          </Badge>
        ) : (
          <span />
        )}
        <Armchair className="h-5 w-5 text-muted-foreground/70" aria-hidden />
      </div>

      <p className="text-3xl font-bold tracking-tight text-foreground">
        {formatTime(trip.departureTime)}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">
        <span className="text-primary">{route.split(" → ")[0]}</span>
        <span className="text-muted-foreground"> → </span>
        <span className="text-primary">{route.split(" → ")[1]}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{seatsLabel}</p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <p className="text-lg font-bold text-foreground">{LANDING_TICKET_PRICE_LABEL}</p>
        {canBook ? (
          <Link
            to={ROUTES.tripDetail(trip.id)}
            className={cn(landingOutlineButtonClass, "shrink-0 px-5")}
          >
            Réserver
          </Link>
        ) : (
          <span
            className={cn(landingOutlineButtonClass, "cursor-not-allowed opacity-50")}
            aria-disabled
          >
            {availability.ctaLabel}
          </span>
        )}
      </div>
    </article>
  );
}
