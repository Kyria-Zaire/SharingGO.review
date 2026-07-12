import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, QrCode } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  getBookingActionButtonClass,
  type BookingPrimaryAction,
} from "@/features/bookings/lib/booking-actions";
import { ROUTES } from "@/types/routes";
import type { UserReservationListItem } from "@/types/reservations";
import type { BookingsFilter } from "@/hooks/useUserReservations";
import { BookingCardStatusBadge } from "./BookingCardStatusBadge";

function actionZoneShellClass(
  showQr: boolean,
  isCompletedPast: boolean,
  status: string
): string {
  if (showQr) {
    return "border-primary/30 bg-primary/[0.04] shadow-[inset_0_0_0_1px_rgba(34,197,94,0.08)]";
  }
  if (isCompletedPast) {
    return "border-white/12 bg-white/[0.02]";
  }
  if (status === "PENDING") {
    return "border-sky-500/25 bg-sky-500/[0.06]";
  }
  return "border-white/10 bg-white/[0.02]";
}

export interface BookingCardActionZoneProps {
  reservation: UserReservationListItem;
  filter: BookingsFilter;
  action: BookingPrimaryAction;
  showQr: boolean;
  isCompletedPast: boolean;
}

export function BookingCardActionZone({
  reservation,
  filter,
  action,
  showQr,
  isCompletedPast,
}: BookingCardActionZoneProps) {
  const { status } = reservation;
  const showPendingIcon = !showQr && !isCompletedPast && status === "PENDING";

  return (
    <div
      className={cn(
        "flex w-[10.5rem] shrink-0 flex-col border-l border-white/[0.06] pl-4",
        isCompletedPast ? "items-center" : "items-stretch"
      )}
    >
      <BookingCardStatusBadge
        status={reservation.status}
        filter={filter}
        refundStatus={reservation.refundStatus}
        className={isCompletedPast ? undefined : "self-end"}
      />

      <div
        className={cn(
          "mt-2 flex w-full flex-col items-center gap-2 rounded-xl border p-2.5",
          actionZoneShellClass(showQr, isCompletedPast, status)
        )}
      >
        {showQr ? (
          <Link
            to={ROUTES.boardingPass(reservation.id)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/10 text-primary transition-colors hover:border-primary/45 hover:bg-primary/15"
            aria-label="Voir le QR billet"
          >
            <QrCode className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="text-xs font-semibold">QR billet</span>
          </Link>
        ) : null}

        {isCompletedPast ? (
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-muted-foreground"
            aria-hidden
          >
            <CheckCircle2 className="h-5 w-5" strokeWidth={1.25} />
          </span>
        ) : null}

        {showPendingIcon ? (
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400"
            aria-hidden
          >
            <Clock3 className="h-5 w-5" strokeWidth={1.5} />
          </span>
        ) : null}

        <Link
          to={action.href}
          className={cn(
            "inline-flex min-h-[2.125rem] w-full items-center justify-center rounded-lg border px-2.5 text-sm font-semibold transition-colors",
            getBookingActionButtonClass(action.variant)
          )}
        >
          {action.label}
        </Link>
      </div>
    </div>
  );
}
