import { Headphones, Lock, Phone, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { BookingFormTripSummary } from "@/features/booking-form/components/BookingFormTripSummary";
import {
  BOOKING_FORM_PRICE_LABEL,
  BOOKING_FORM_REASSURANCE,
  BOOKING_FORM_SECURE_PAYMENT,
  BOOKING_FORM_SERVICE_FEE_LABEL,
  BOOKING_FORM_SUMMARY_TITLE,
  BOOKING_FORM_SUPPORT_CTA,
  BOOKING_FORM_SUPPORT_EMAIL,
  BOOKING_FORM_SUPPORT_PHONE,
  BOOKING_FORM_SUPPORT_TITLE,
  BOOKING_FORM_TOTAL_LABEL,
} from "@/features/booking-form/constants/booking-form-content";
import {
  BOOKING_SERVICE_FEE,
  BOOKING_TICKET_PRICE,
  formatBookingTotalPrice,
} from "@/features/booking-form/lib/booking-form-price";
import { formatTripRouteShort } from "@/features/home/lib/landing-trip-utils";
import { formatTime, formatTripCalendarDate } from "@/lib/format-date";
import {
  formatTripCityFull,
  formatTripCityShort,
} from "@/lib/trip-city-labels";
import type { PublicTrip } from "@/types/trips.types";

const CARD_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

const supportPhoneHref = BOOKING_FORM_SUPPORT_PHONE.replace(/\s/g, "");

function SummaryPriceRows() {
  return (
    <dl className="space-y-2.5 border-t border-white/[0.06] pt-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <dt className="text-muted-foreground">{BOOKING_FORM_PRICE_LABEL}</dt>
        <dd className="font-medium text-foreground">{BOOKING_TICKET_PRICE}</dd>
      </div>
      <div className="flex items-center justify-between gap-3">
        <dt className="text-muted-foreground">{BOOKING_FORM_SERVICE_FEE_LABEL}</dt>
        <dd className="font-medium text-foreground">{BOOKING_SERVICE_FEE}</dd>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-2.5">
        <dt className="font-semibold text-foreground">{BOOKING_FORM_TOTAL_LABEL}</dt>
        <dd className="text-lg font-bold text-primary">{formatBookingTotalPrice()}</dd>
      </div>
    </dl>
  );
}

export function BookingFormSummarySidebar({ trip }: { trip: PublicTrip }) {
  const routeLabel = formatTripRouteShort(trip);
  const dateLabel = formatTripCalendarDate(trip.departureTime);
  const timeRange = `${formatTime(trip.departureTime)} → ${
    trip.arrivalTime ? formatTime(trip.arrivalTime) : "—"
  }`;
  const startPlace = formatTripCityFull(trip.line.startCity);
  const endPlace = formatTripCityFull(trip.line.endCity);

  return (
    <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Récapitulatif de réservation">
      <div className={CARD_CLASS}>
        <h2 className="text-sm font-semibold text-foreground">{BOOKING_FORM_SUMMARY_TITLE}</h2>

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Route</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{routeLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Date</dt>
            <dd className="mt-0.5 font-medium text-foreground">{dateLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Horaires</dt>
            <dd className="mt-0.5 font-medium text-foreground">{timeRange}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Lieux</dt>
            <dd className="mt-0.5 text-foreground">
              {formatTripCityShort(trip.line.startCity)} — {startPlace}
              <br />
              {formatTripCityShort(trip.line.endCity)} — {endPlace}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Places</dt>
            <dd className="mt-0.5 font-medium text-foreground">1 place</dd>
          </div>
        </dl>

        <SummaryPriceRows />

        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-primary" aria-hidden />
          {BOOKING_FORM_SECURE_PAYMENT}
        </p>
      </div>

      <div className={CARD_CLASS}>
        <ul className="space-y-2.5">
          {BOOKING_FORM_REASSURANCE.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h3 className="text-sm font-semibold text-foreground">{BOOKING_FORM_SUPPORT_TITLE}</h3>
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="sr-only">Email</dt>
            <dd>
              <a
                href={`mailto:${BOOKING_FORM_SUPPORT_EMAIL}`}
                className="font-medium text-foreground transition-colors hover:text-primary"
              >
                {BOOKING_FORM_SUPPORT_EMAIL}
              </a>
            </dd>
          </div>
          <div>
            <dt className="sr-only">Téléphone</dt>
            <dd>
              <a
                href={`tel:${supportPhoneHref}`}
                className="inline-flex items-center gap-1.5 font-semibold text-foreground transition-colors hover:text-primary"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {BOOKING_FORM_SUPPORT_PHONE}
              </a>
            </dd>
          </div>
        </dl>
        <a
          href={`mailto:${BOOKING_FORM_SUPPORT_EMAIL}`}
          className={cn(
            "mt-4 inline-flex min-h-[2.375rem] w-full items-center justify-center rounded-lg",
            "border border-white/15 px-4 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.04]"
          )}
        >
          {BOOKING_FORM_SUPPORT_CTA}
        </a>
      </div>
    </aside>
  );
}

/** Récap mobile compact (prix + total) avant le CTA. */
export function BookingFormMobilePriceSummary() {
  return (
    <section
      className={cn(CARD_CLASS, "lg:hidden")}
      aria-label="Montant de la réservation"
    >
      <SummaryPriceRows />
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5 text-primary" aria-hidden />
        {BOOKING_FORM_SECURE_PAYMENT}
      </p>
    </section>
  );
}

/** Résumé trajet mobile — réutilise le composant trip summary */
export function BookingFormMobileTripSummary({ trip }: { trip: PublicTrip }) {
  return <BookingFormTripSummary trip={trip} className="lg:hidden" compact />;
}
