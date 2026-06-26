import { ROUTES } from "@/types/routes";
import type { UserReservationListItem } from "@/types/reservations";

export function formatBookingReference(reservationId: string): string {
  return reservationId.slice(0, 8).toUpperCase();
}

export function canAccessBoardingPass(reservation: UserReservationListItem): boolean {
  return reservation.status === "CONFIRMED";
}

export type BookingActionVariant = "ticket-green" | "ticket-muted" | "details-blue";

export interface BookingPrimaryAction {
  label: string;
  href: string;
  variant: BookingActionVariant;
}

export function getBookingActionButtonClass(variant: BookingActionVariant): string {
  switch (variant) {
    case "ticket-green":
      return "border-primary/70 text-primary hover:bg-primary/10";
    case "details-blue":
      return "border-sky-500/60 text-sky-400 hover:bg-sky-500/10";
    case "ticket-muted":
    default:
      return "border-white/30 bg-transparent text-foreground hover:bg-white/[0.04]";
  }
}

/** CTA principal — aligné maquette + logique existante (détail / boarding pass). */
export function getBookingPrimaryAction(reservation: UserReservationListItem): BookingPrimaryAction {
  const { status } = reservation;

  if (status === "CONFIRMED") {
    return {
      label: "Voir le billet",
      href: ROUTES.boardingPass(reservation.id),
      variant: "ticket-green",
    };
  }

  if (status === "USED") {
    return {
      label: "Voir le billet",
      href: ROUTES.bookingDetail(reservation.id),
      variant: "ticket-muted",
    };
  }

  return {
    label: "Voir les détails",
    href: ROUTES.bookingDetail(reservation.id),
    variant: status === "PENDING" ? "details-blue" : "ticket-muted",
  };
}
