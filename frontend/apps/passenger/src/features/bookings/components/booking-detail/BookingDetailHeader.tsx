import { ChevronLeft, Download, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  BOOKING_DETAIL_BACK_LABEL,
  BOOKING_DETAIL_DOWNLOAD_PDF,
  BOOKING_DETAIL_TITLE,
  BOOKING_DETAIL_VIEW_QR,
} from "@/features/bookings/constants/booking-detail-content";
import { formatBookingReservedAt } from "@/features/bookings/lib/booking-detail-format";
import { formatBookingPublicReference } from "@/features/bookings/lib/booking-card-format";
import { ROUTES } from "@/types/routes";
import type { UserReservationDetail } from "@/types/reservations";
import { BookingDetailStatusBadge } from "./BookingDetailStatusBadge";

const actionBaseClass =
  "inline-flex min-h-[2.5rem] items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors";
const actionPrimaryClass =
  "border border-transparent bg-primary text-primary-foreground hover:bg-primary/90";
const actionSecondaryClass =
  "border border-white/20 bg-transparent text-foreground hover:bg-white/[0.04]";

export function BookingDetailHeader({
  reservation,
  isPastTrip,
  showQrAction,
  onViewQr,
}: {
  reservation: UserReservationDetail;
  isPastTrip: boolean;
  showQrAction: boolean;
  onViewQr: () => void;
}) {
  const reference = formatBookingPublicReference(reservation.id);

  return (
    <header className="space-y-4 lg:space-y-5">
      <Link
        to={ROUTES.bookings}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {BOOKING_DETAIL_BACK_LABEL}
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
              {BOOKING_DETAIL_TITLE}
            </h1>
            <BookingDetailStatusBadge
              status={reservation.status}
              isPastTrip={isPastTrip}
              refundStatus={reservation.refundStatus}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground/90">{reference}</span>
            <span className="mx-2 text-white/20" aria-hidden>
              ·
            </span>
            {formatBookingReservedAt(reservation.createdAt)}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          {showQrAction ? (
            <button
              type="button"
              onClick={onViewQr}
              className={cn(actionBaseClass, actionPrimaryClass)}
            >
              <QrCode className="h-4 w-4" aria-hidden />
              {BOOKING_DETAIL_VIEW_QR}
            </button>
          ) : null}
          <span
            className={cn(
              actionBaseClass,
              actionSecondaryClass,
              "cursor-not-allowed opacity-60"
            )}
            title="Téléchargement PDF — bientôt disponible"
          >
            <Download className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{BOOKING_DETAIL_DOWNLOAD_PDF}</span>
            <span className="sm:hidden">Télécharger le billet</span>
          </span>
        </div>
      </div>
    </header>
  );
}
