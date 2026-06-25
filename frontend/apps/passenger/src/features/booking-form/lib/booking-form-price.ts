import { LANDING_TICKET_PRICE_LABEL } from "@/features/home/lib/landing-trip-utils";
import { BOOKING_FORM_SERVICE_FEE_VALUE } from "@/features/booking-form/constants/booking-form-content";

/** Tarif billet CDC V1 — pas de champ prix sur PublicTrip. */
export const BOOKING_TICKET_PRICE = LANDING_TICKET_PRICE_LABEL;

export const BOOKING_SERVICE_FEE = BOOKING_FORM_SERVICE_FEE_VALUE;

export function formatBookingTotalPrice(): string {
  return BOOKING_TICKET_PRICE;
}
