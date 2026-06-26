import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, QrCode, User, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  canAccessBoardingPass,
  getBookingActionButtonClass,
  getBookingPrimaryAction,
} from "@/features/bookings/lib/booking-actions";
import { formatPaymentAmount } from "@/lib/reservation-status";
import { ROUTES } from "@/types/routes";
import type { UserReservationListItem } from "@/types/reservations";
import type { BookingsFilter } from "@/hooks/useUserReservations";
import { BookingCardDateColumn } from "./BookingCardDateColumn";
import { BookingCardRouteBlock } from "./BookingCardRouteBlock";
import { BookingCardStatusBadge } from "./BookingCardStatusBadge";

function BookingCardTrailingIcon({
  reservation,
  filter,
}: {
  reservation: UserReservationListItem;
  filter: BookingsFilter;
}) {
  if (canAccessBoardingPass(reservation)) {
    return (
      <Link
        to={ROUTES.boardingPass(reservation.id)}
        className="flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
        aria-label="Voir le QR billet"
      >
        <QrCode className="h-8 w-8 text-primary" strokeWidth={1.5} aria-hidden />
      </Link>
    );
  }

  if (reservation.status === "PENDING") {
    return (
      <span
        className="flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400"
        aria-hidden
      >
        <Clock3 className="h-7 w-7" strokeWidth={1.5} />
      </span>
    );
  }

  if (reservation.status === "USED" && filter === "past") {
    return (
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20 text-muted-foreground"
        aria-hidden
      >
        <CheckCircle2 className="h-8 w-8" strokeWidth={1.25} />
      </span>
    );
  }

  return null;
}

const CARD_SHELL_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

export interface BookingCardMobileProps {
  reservation: UserReservationListItem;
  filter: BookingsFilter;
}

export function BookingCardMobile({ reservation, filter }: BookingCardMobileProps) {
  const { trip, payment } = reservation;
  const action = getBookingPrimaryAction(reservation);
  const paymentLabel = payment ? formatPaymentAmount(payment.amount, payment.currency) : "—";
  const highlightTime = filter === "upcoming";

  return (
    <article className={cn(CARD_SHELL_CLASS, "lg:hidden")} data-reservation-id={reservation.id}>
      <div className="flex gap-3 p-4">
        <BookingCardDateColumn
          departureTime={trip.departureTime}
          highlightTime={highlightTime}
          className="w-[3.25rem]"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <BookingCardRouteBlock
              trip={trip}
              reservationId={reservation.id}
              showReference={false}
              compact
            />
            {filter === "past" && reservation.status === "USED" ? (
              <BookingCardStatusBadge
                status={reservation.status}
                filter={filter}
                className="shrink-0"
              />
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" aria-hidden />
              1 passager
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
              <Wallet className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              {paymentLabel}
            </span>
          </div>
        </div>

        <BookingCardTrailingIcon reservation={reservation} filter={filter} />
      </div>

      {action.label ? (
        <div className="border-t border-white/[0.06] px-4 py-3">
          <Link
            to={action.href}
            className={cn(
              "inline-flex min-h-touch w-full items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-colors",
              getBookingActionButtonClass(action.variant)
            )}
          >
            {action.label}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
