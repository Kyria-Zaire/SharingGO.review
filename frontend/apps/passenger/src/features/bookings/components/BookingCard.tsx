import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDayLabel, formatTime } from "@/lib/format-date";
import {
  formatPaymentAmount,
  getPaymentStatusLabel,
  getReservationStatusView,
} from "@/lib/reservation-status";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/types/routes";
import type { UserReservationListItem } from "@/types/reservations";

export interface BookingCardProps {
  reservation: UserReservationListItem;
}

export function BookingCard({ reservation }: BookingCardProps) {
  const { trip, payment } = reservation;
  const routeLabel = `${trip.line.startCity} → ${trip.line.endCity}`;
  const statusView = getReservationStatusView(reservation.status);
  const paymentLabel = payment
    ? formatPaymentAmount(payment.amount, payment.currency)
    : "—";

  return (
    <Card className="p-4" data-reservation-id={reservation.id}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{formatDayLabel(trip.departureTime)}</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {formatTime(trip.departureTime)}
            {trip.arrivalTime ? (
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                → {formatTime(trip.arrivalTime)}
              </span>
            ) : null}
          </p>
        </div>
        <Badge variant={statusView.badgeVariant}>{statusView.label}</Badge>
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="col-span-2">
          <dt className="text-muted-foreground">Ligne</dt>
          <dd className="font-medium text-foreground">{routeLabel}</dd>
          <dd className="text-xs text-muted-foreground">{trip.line.name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Montant</dt>
          <dd className="font-semibold text-primary">{paymentLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Paiement</dt>
          <dd className="font-medium text-foreground">
            {getPaymentStatusLabel(payment?.status)}
          </dd>
        </div>
      </dl>

      <Link
        to={ROUTES.bookingDetail(reservation.id)}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-md font-medium transition-colors",
          "min-h-touch px-4 text-sm",
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        Voir le billet
      </Link>
    </Card>
  );
}
