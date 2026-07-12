import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { formatShortId } from "@/lib/format-id";
import { formatPassengerLabel } from "@/features/reservations/utils/passenger-label";
import type { AdminReservation, RefundActionKind } from "@/types/reservations.types";

export interface RefundQueueTableProps {
  reservations: AdminReservation[];
  onAction: (reservation: AdminReservation, kind: RefundActionKind) => void;
}

function routeLabel(reservation: AdminReservation): string {
  return `${reservation.trip.line.startCity} → ${reservation.trip.line.endCity}`;
}

function paidLabel(reservation: AdminReservation): { amount: string; paidRef: string } {
  const { payment } = reservation;
  if (!payment) {
    return { amount: "—", paidRef: "Aucun paiement associé" };
  }
  return {
    amount: formatCurrency(payment.amount, payment.currency),
    paidRef: `${formatDate(payment.createdAt)} · #${formatShortId(payment.id)}`,
  };
}

export function RefundQueueTable({ reservations, onAction }: RefundQueueTableProps) {
  return (
    <>
      <div className="space-y-3 lg:hidden">
        {reservations.map((reservation) => {
          const { amount, paidRef } = paidLabel(reservation);
          return (
            <article
              key={reservation.id}
              className="min-w-0 rounded-lg border border-border bg-muted/20 p-4"
            >
              <div className="mb-3">
                <p className="font-mono text-xs text-muted-foreground" title={reservation.id}>
                  {formatShortId(reservation.id)}
                </p>
                <p className="font-medium text-foreground">
                  {formatPassengerLabel(reservation.user)}
                </p>
              </div>
              <dl className="mb-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Trajet</dt>
                  <dd className="text-foreground">
                    {reservation.trip.line.name} · {routeLabel(reservation)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Montant</dt>
                  <dd className="text-foreground">{amount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Payé le / Paiement</dt>
                  <dd className="text-foreground">{paidRef}</dd>
                </div>
              </dl>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => onAction(reservation, "refund")}
                >
                  Rembourser
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => onAction(reservation, "credit")}
                >
                  Créditer un avoir
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Passager</th>
              <th className="px-4 py-3 font-medium">Trajet</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Payé le / Paiement</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reservations.map((reservation) => {
              const { amount, paidRef } = paidLabel(reservation);
              return (
                <tr key={reservation.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="text-foreground">{formatPassengerLabel(reservation.user)}</p>
                    <p className="font-mono text-xs text-muted-foreground" title={reservation.id}>
                      {formatShortId(reservation.id)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{reservation.trip.line.name}</p>
                    <p className="text-xs text-muted-foreground">{routeLabel(reservation)}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground">{amount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{paidRef}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAction(reservation, "refund")}
                      >
                        Rembourser
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onAction(reservation, "credit")}
                      >
                        Créditer
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
