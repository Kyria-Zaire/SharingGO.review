import { CalendarPlus, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { LANDING_TICKET_PRICE_LABEL } from "@/features/home/lib/landing-trip-utils";
import {
  landingCardClass,
  landingOutlineButtonClass,
  landingPrimaryButtonClass,
} from "@/features/home/lib/landing-layout";
import { TRIP_DETAIL_RESERVATION_TRUST } from "@/features/trips/constants/trip-detail-content";
import { downloadTripCalendarIcs } from "@/features/trips/lib/trip-detail-calendar";
import type { TripDetailReservationCta } from "@/lib/trip-availability";
import { formatRemainingSeatsLabel, normalizeTripSeats } from "@/lib/trip-availability";
import type { PublicTrip } from "@/types/trips.types";

export interface TripDetailReservationCardProps {
  trip: PublicTrip;
  cta: TripDetailReservationCta;
  errorMessage?: string | null;
  isLoading?: boolean;
  onReserveClick: () => void;
  className?: string;
}

export function TripDetailReservationCard({
  trip,
  cta,
  errorMessage,
  isLoading = false,
  onReserveClick,
  className,
}: TripDetailReservationCardProps) {
  const { remainingSeats, totalSeats } = normalizeTripSeats(trip);
  const seatsLabel = formatRemainingSeatsLabel(remainingSeats, totalSeats);
  const isDisabled = cta.disabled || isLoading;

  return (
    <aside
      className={cn(landingCardClass, "border-primary/20 bg-[#121212] p-5 sm:p-6", className)}
      aria-label="Réserver ce trajet"
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Réservation
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
        {LANDING_TICKET_PRICE_LABEL}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">par place — billet unitaire</p>

      <p className="mt-4 text-sm font-medium text-foreground">{seatsLabel}</p>

      <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
        {TRIP_DETAIL_RESERVATION_TRUST.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {item}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onReserveClick}
        disabled={isDisabled}
        className={cn(
          landingPrimaryButtonClass,
          "mt-6 w-full px-6 py-3.5 text-base font-bold",
          isDisabled && "cursor-not-allowed opacity-60"
        )}
      >
        {isLoading ? "Réservation…" : cta.label}
      </button>

      <button
        type="button"
        onClick={() => downloadTripCalendarIcs(trip)}
        className={cn(landingOutlineButtonClass, "mt-3 w-full gap-2")}
      >
        <CalendarPlus className="h-4 w-4" aria-hidden />
        Ajouter au calendrier
      </button>

      {errorMessage ? (
        <p className="mt-3 text-center text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </aside>
  );
}
