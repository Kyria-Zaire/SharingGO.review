import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format-date";
import { formatShortId } from "@/lib/format-id";
import type { AdminReservation } from "@/types/reservations.types";
import { formatPassengerLabel } from "@/features/reservations/utils/passenger-label";
import { AccessTypeBadge } from "./AccessTypeBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { ReservationStatusBadge } from "./ReservationStatusBadge";

export interface ReservationsTableProps {
  reservations: AdminReservation[];
  selectedReservationId: string | null;
  onViewDetail: (reservationId: string) => void;
}

function formatAmount(amount: string, currency: string): string {
  return `${amount} ${currency.toUpperCase()}`;
}

export function ReservationsTable({
  reservations,
  selectedReservationId,
  onViewDetail,
}: ReservationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Réservation</th>
            <th className="px-4 py-3 font-medium">Passager</th>
            <th className="px-4 py-3 font-medium">Trajet</th>
            <th className="px-4 py-3 font-medium">Départ</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Paiement / accès</th>
            <th className="px-4 py-3 font-medium">Créée le</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reservations.map((reservation) => {
            const isSelected = selectedReservationId === reservation.id;
            const routeLabel = `${reservation.trip.line.startCity} → ${reservation.trip.line.endCity}`;

            return (
              <tr
                key={reservation.id}
                className={isSelected ? "bg-primary/5" : "hover:bg-muted/20"}
              >
                <td className="px-4 py-3 font-mono text-foreground" title={reservation.id}>
                  {formatShortId(reservation.id)}
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground">{formatPassengerLabel(reservation.user)}</p>
                  {reservation.user.email ? (
                    <p className="text-xs text-muted-foreground">{reservation.user.email}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground">{reservation.trip.line.name}</p>
                  <p className="text-xs text-muted-foreground">{routeLabel}</p>
                </td>
                <td className="px-4 py-3 text-foreground">
                  {formatDate(reservation.trip.departureTime)}
                </td>
                <td className="px-4 py-3">
                  <ReservationStatusBadge status={reservation.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <AccessTypeBadge type={reservation.payment?.type} />
                    {reservation.payment ? (
                      <>
                        <PaymentStatusBadge status={reservation.payment.status} />
                        <span className="text-xs text-muted-foreground">
                          {formatAmount(reservation.payment.amount, reservation.payment.currency)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sans paiement</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(reservation.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant={isSelected ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => onViewDetail(reservation.id)}
                    title="Voir détails"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Voir
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
