import { ArrowRight, Diamond } from "lucide-react";
import { cn } from "@/lib/cn";
import { resolveBookingStopPoint } from "@/features/bookings/lib/booking-card-format";
import { formatTripCityShort } from "@/lib/trip-city-labels";
import type { UserReservationTrip } from "@/types/reservations";
import { BookingCardReferenceRow } from "./BookingCardReferenceRow";

export function BookingCardRouteBlock({
  trip,
  reservationId,
  showReference = true,
  compact = false,
  dense = false,
  className,
}: {
  trip: UserReservationTrip;
  reservationId: string;
  showReference?: boolean;
  compact?: boolean;
  dense?: boolean;
  className?: string;
}) {
  const startStop = resolveBookingStopPoint(trip.line.startCity);
  const endStop = resolveBookingStopPoint(trip.line.endCity);

  return (
    <div className={cn("min-w-0", className)}>
      <p
        className={cn(
          "font-semibold text-foreground",
          compact
            ? "text-sm leading-snug"
            : dense
              ? "text-sm leading-snug lg:text-[0.9375rem]"
              : "text-base lg:text-[1.05rem]"
        )}
      >
        <span>{formatTripCityShort(trip.line.startCity)}</span>
        <ArrowRight className="mx-1.5 inline h-4 w-4 text-primary" aria-hidden />
        <span>{formatTripCityShort(trip.line.endCity)}</span>
      </p>

      <ul
        className={cn(
          dense ? "mt-2 space-y-1" : "space-y-1.5",
          compact ? "mt-2" : dense ? undefined : "mt-3"
        )}
      >
        {startStop ? (
          <li
            className={cn(
              "flex items-start gap-2 text-muted-foreground",
              dense ? "text-xs" : "text-xs lg:text-sm"
            )}
          >
            <Diamond className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/80" aria-hidden />
            <span>{startStop}</span>
          </li>
        ) : null}
        {endStop ? (
          <li
            className={cn(
              "flex items-start gap-2 text-muted-foreground",
              dense ? "text-xs" : "text-xs lg:text-sm"
            )}
          >
            <Diamond className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/80" aria-hidden />
            <span>{endStop}</span>
          </li>
        ) : null}
      </ul>

      {showReference ? (
        <BookingCardReferenceRow reservationId={reservationId} dense={dense} />
      ) : null}
    </div>
  );
}
