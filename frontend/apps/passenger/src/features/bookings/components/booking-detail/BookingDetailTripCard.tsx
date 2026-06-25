import { Link } from "react-router-dom";
import { ArrowRight, Baby, Bus, Luggage, User } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  BOOKING_DETAIL_CAR_SEAT_LABEL,
  BOOKING_DETAIL_CAR_SEAT_VALUE,
  BOOKING_DETAIL_LUGGAGE_LABEL,
  BOOKING_DETAIL_PASSENGER_COUNT,
  BOOKING_DETAIL_PAYMENT_METHOD,
  BOOKING_DETAIL_VIEW_TRIP,
} from "@/features/bookings/constants/booking-detail-content";
import { TRIP_DETAIL_STOP_POINTS } from "@/features/trips/constants/trip-detail-content";
import { BookingCardDateColumn } from "@/features/bookings/components/booking-card/BookingCardDateColumn";
import { formatTripDuration } from "@/lib/format-date";
import {
  formatPaymentAmount,
  getPaymentStatusLabel,
} from "@/lib/reservation-status";
import {
  formatTripCityShort,
  isChalonsCity,
  isVatryCity,
} from "@/lib/trip-city-labels";
import { ROUTES } from "@/types/routes";
import type { UserReservationDetail } from "@/types/reservations";

const CARD_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

function resolveStopLabel(city: string): string {
  if (isChalonsCity(city)) {
    return `${TRIP_DETAIL_STOP_POINTS.chalons} ${formatTripCityShort(city)}`;
  }
  if (isVatryCity(city)) {
    return `${TRIP_DETAIL_STOP_POINTS.vatry} ${formatTripCityShort(city)}`;
  }
  return formatTripCityShort(city);
}

function TripRouteTimeline({
  startCity,
  endCity,
  compact = false,
}: {
  startCity: string;
  endCity: string;
  compact?: boolean;
}) {
  const startStop = resolveStopLabel(startCity);
  const endStop = resolveStopLabel(endCity);

  return (
    <div className={cn("flex gap-3", compact ? "min-w-0 flex-1" : "mt-3")}>
      <div className="flex flex-col items-center pt-1">
        <span className="h-2.5 w-2.5 rounded-full border border-white/30 bg-transparent" aria-hidden />
        <span className="my-1 min-h-[2.75rem] w-px border-l border-dashed border-white/25 lg:min-h-[3.25rem]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full border border-white/30 bg-transparent" aria-hidden />
      </div>
      <div className="min-w-0 space-y-4 lg:space-y-5">
        <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>{startStop}</p>
        <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>{endStop}</p>
      </div>
    </div>
  );
}

export function BookingDetailTripCard({
  reservation,
  isUpcoming,
}: {
  reservation: UserReservationDetail;
  isUpcoming: boolean;
}) {
  const { trip, payment } = reservation;
  const duration = formatTripDuration(trip.departureTime, trip.arrivalTime);
  const paymentLabel = payment ? formatPaymentAmount(payment.amount, payment.currency) : "—";
  const paymentStatus = getPaymentStatusLabel(payment?.status);
  const startCity = formatTripCityShort(trip.line.startCity);
  const endCity = formatTripCityShort(trip.line.endCity);

  return (
    <article className={cn(CARD_CLASS, "overflow-hidden")}>
      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-[auto_minmax(0,1fr)_12rem_11rem] lg:gap-0">
        <div className="border-r border-white/[0.06] px-5 py-4">
          <BookingCardDateColumn
            departureTime={trip.departureTime}
            highlightTime={isUpcoming}
            dense
            className="w-[4rem]"
          />
        </div>

        <div className="border-r border-white/[0.06] px-5 py-4">
          <p className="text-base font-semibold text-foreground">
            <span>{startCity}</span>
            <ArrowRight className="mx-1.5 inline h-4 w-4 text-primary" aria-hidden />
            <span>{endCity}</span>
          </p>
          <TripRouteTimeline startCity={trip.line.startCity} endCity={trip.line.endCity} />
          <Link
            to={ROUTES.tripDetail(trip.id)}
            className="mt-4 inline-flex min-h-[2.25rem] items-center justify-center rounded-lg border border-primary/60 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            {BOOKING_DETAIL_VIEW_TRIP}
          </Link>
        </div>

        <div className="space-y-4 border-r border-white/[0.06] px-5 py-4">
          {duration ? (
            <div className="flex items-start gap-3">
              <Bus className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <p className="text-sm font-bold text-foreground">{duration}</p>
                <p className="text-xs text-muted-foreground">Durée estimée</p>
              </div>
            </div>
          ) : null}
          <div className="flex items-start gap-3">
            <Baby className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm text-foreground">{BOOKING_DETAIL_CAR_SEAT_LABEL}</p>
              <p className="text-sm text-muted-foreground">{BOOKING_DETAIL_CAR_SEAT_VALUE}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Luggage className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <p className="text-sm text-foreground">{BOOKING_DETAIL_LUGGAGE_LABEL}</p>
          </div>
        </div>

        <div className="flex flex-col justify-between px-5 py-4">
          <div>
            <p className="text-xs text-muted-foreground">Prix total</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{paymentLabel}</p>
            <p className="mt-3 text-sm text-foreground">{BOOKING_DETAIL_PASSENGER_COUNT}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary/40 text-[0.625rem] text-primary">
                ✓
              </span>
              {BOOKING_DETAIL_PAYMENT_METHOD}
            </p>
            <p
              className={cn(
                "mt-2 text-sm font-semibold",
                paymentStatus === "Payé" ? "text-primary" : "text-muted-foreground"
              )}
            >
              {paymentStatus}
            </p>
          </div>
          <button
            type="button"
            disabled
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-60"
            title="Facture — bientôt disponible"
          >
            Voir la facture
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="flex gap-3 p-4">
          <BookingCardDateColumn
            departureTime={trip.departureTime}
            highlightTime={isUpcoming}
            className="w-[3.25rem] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-foreground">
              <span>{startCity}</span>
              <ArrowRight className="mx-1 inline h-3.5 w-3.5 text-primary" aria-hidden />
              <span>{endCity}</span>
            </p>
            <TripRouteTimeline
              startCity={trip.line.startCity}
              endCity={trip.line.endCity}
              compact
            />
          </div>
          {duration ? (
            <div className="flex shrink-0 flex-col items-center justify-center text-center">
              <Bus className="h-5 w-5 text-muted-foreground" aria-hidden />
              <p className="mt-1 text-sm font-bold text-foreground">{duration}</p>
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-3 border-t border-white/[0.06] px-4 py-3 text-center text-xs">
          <span className="inline-flex items-center justify-center gap-1.5 text-muted-foreground">
            <User className="h-3.5 w-3.5" aria-hidden />
            {BOOKING_DETAIL_PASSENGER_COUNT}
          </span>
          <span className="font-semibold text-foreground">{paymentLabel}</span>
          <span
            className={cn(
              "font-semibold",
              paymentStatus === "Payé" ? "text-primary" : "text-muted-foreground"
            )}
          >
            {paymentStatus}
          </span>
        </div>
      </div>
    </article>
  );
}
