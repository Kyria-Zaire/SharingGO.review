import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatTripCityShort } from "@/lib/trip-city-labels";
import { formatTripDuration } from "@/lib/format-date";
import {
  formatTripDayBadgeLabel,
  isTripToday,
  isTripTomorrow,
} from "@/features/home/lib/landing-trip-utils";
import type { PublicTrip } from "@/types/trips.types";

export function TripRouteVisual({
  startCity,
  endCity,
  className,
}: {
  startCity: string;
  endCity: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center pt-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
          <span className="my-1 h-8 w-px border-l border-dashed border-white/25" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full border-2 border-foreground/80 bg-transparent" aria-hidden />
        </div>
        <div className="min-w-0 space-y-5">
          <p className="text-sm font-semibold text-foreground">{formatTripCityShort(startCity)}</p>
          <p className="text-sm font-semibold text-foreground">{formatTripCityShort(endCity)}</p>
        </div>
      </div>
    </div>
  );
}

export function TripDayChip({ trip }: { trip: PublicTrip }) {
  if (isTripToday(trip)) {
    return (
      <span className="inline-flex rounded-md bg-primary px-2 py-0.5 text-[0.65rem] font-semibold text-primary-foreground">
        Aujourd&apos;hui
      </span>
    );
  }

  if (isTripTomorrow(trip)) {
    return (
      <span className="inline-flex rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
        Demain
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[0.65rem] font-semibold text-foreground/85">
      {formatTripDayBadgeLabel(trip)}
    </span>
  );
}

export function TripDurationLabel({
  departureTime,
  arrivalTime,
}: {
  departureTime: string;
  arrivalTime: string | null;
}) {
  const duration = formatTripDuration(departureTime, arrivalTime);
  if (!duration) return null;

  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="h-3.5 w-3.5" aria-hidden />
      Durée {duration}
    </p>
  );
}
