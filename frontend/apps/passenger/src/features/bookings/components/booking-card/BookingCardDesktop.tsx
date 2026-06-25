import { Baby, User } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  canAccessBoardingPass,
  getBookingPrimaryAction,
} from "@/features/bookings/lib/booking-actions";
import {
  formatPaymentAmount,
  getPaymentStatusLabel,
} from "@/lib/reservation-status";
import type { UserReservationListItem } from "@/types/reservations";
import type { BookingsFilter } from "@/hooks/useUserReservations";
import { BookingCardActionZone } from "./BookingCardActionZone";
import { BookingCardDateColumn } from "./BookingCardDateColumn";
import { BookingCardRouteBlock } from "./BookingCardRouteBlock";

const CARD_SHELL_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

export interface BookingCardDesktopProps {
  reservation: UserReservationListItem;
  filter: BookingsFilter;
}

export function BookingCardDesktop({ reservation, filter }: BookingCardDesktopProps) {
  const { trip, payment } = reservation;
  const action = getBookingPrimaryAction(reservation);
  const paymentLabel = payment ? formatPaymentAmount(payment.amount, payment.currency) : "—";
  const paymentStatus = getPaymentStatusLabel(payment?.status);
  const showQr = canAccessBoardingPass(reservation);
  const highlightTime = filter === "upcoming";
  const isCompletedPast = filter === "past" && reservation.status === "USED";

  return (
    <article
      className={cn(CARD_SHELL_CLASS, "hidden px-4 py-3.5 lg:block")}
      data-reservation-id={reservation.id}
    >
      <div className="flex items-center gap-4 xl:gap-5">
        <BookingCardDateColumn
          departureTime={trip.departureTime}
          highlightTime={highlightTime}
          dense
          className="w-[4rem] border-r border-white/[0.06] pr-4"
        />

        <BookingCardRouteBlock
          trip={trip}
          reservationId={reservation.id}
          dense
          className="min-w-0 flex-[1.4]"
        />

        <div className="flex w-[7rem] shrink-0 flex-col justify-center gap-2 border-l border-white/[0.06] pl-4">
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <User className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <span>1 passager</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Baby className="h-3.5 w-3.5" aria-hidden />
              <span>Siège auto</span>
            </div>
            <p className="mt-0.5 pl-5 text-sm text-muted-foreground">—</p>
          </div>
        </div>

        <div className="flex w-[5rem] shrink-0 flex-col justify-center border-l border-white/[0.06] pl-4">
          <p className="text-sm font-semibold text-foreground">{paymentLabel}</p>
          <p
            className={cn(
              "mt-0.5 text-xs font-medium",
              paymentStatus === "Payé" ? "text-primary" : "text-muted-foreground"
            )}
          >
            {paymentStatus}
          </p>
        </div>

        <BookingCardActionZone
          reservation={reservation}
          filter={filter}
          action={action}
          showQr={showQr}
          isCompletedPast={isCompletedPast}
        />
      </div>
    </article>
  );
}
