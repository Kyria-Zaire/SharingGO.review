import { formatDate } from "@/lib/format-date";
import type { AdminReservation } from "@/types/reservations.types";

export interface LifecycleEvent {
  key: string;
  label: string;
  at: string;
  /** Reserved for future steps (scanned, refunded, etc.) */
  future?: boolean;
}

function buildLifecycleEvents(reservation: AdminReservation): LifecycleEvent[] {
  const events: LifecycleEvent[] = [
    { key: "created", label: "Créée", at: reservation.createdAt },
  ];

  if (reservation.payment?.createdAt) {
    events.push({
      key: "payment",
      label: "Paiement enregistré",
      at: reservation.payment.createdAt,
    });
  }

  if (reservation.updatedAt !== reservation.createdAt) {
    events.push({
      key: "updated",
      label: "Mise à jour",
      at: reservation.updatedAt,
    });
  }

  if (reservation.usedAt) {
    events.push({
      key: "used",
      label: "Utilisée",
      at: reservation.usedAt,
    });
  }

  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

interface ReservationTimelineProps {
  reservation: AdminReservation;
}

export function ReservationTimeline({ reservation }: ReservationTimelineProps) {
  const events = buildLifecycleEvents(reservation);

  return (
    <section className="space-y-3">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Cycle de vie
      </h4>
      <ol className="relative space-y-4 border-l border-border pl-4">
        {events.map((event) => (
          <li key={event.key} className="relative">
            <span
              className="absolute -left-[1.3rem] top-1 h-2.5 w-2.5 rounded-full bg-primary"
              aria-hidden
            />
            <p className="text-sm font-medium text-foreground">{event.label}</p>
            <p className="text-xs text-muted-foreground">{formatDate(event.at)}</p>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">
        Étapes futures possibles : confirmée, scannée, remboursée (API à enrichir).
      </p>
    </section>
  );
}
