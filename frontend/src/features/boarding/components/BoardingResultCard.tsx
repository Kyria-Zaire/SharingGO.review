import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format-date";
import { formatShortId } from "@/lib/format-id";
import type { BoardingPassenger, BoardingTrip, BoardingUiMessage } from "@/types/boarding.types";
import { formatBoardingPassenger } from "@/features/boarding/utils/passenger-display";
import { resolveBoardingErrorMessage, boardingErrorDevCode } from "@/features/boarding/utils/boarding-error-messages";
import { BoardingStatusBadge } from "./BoardingStatusBadge";

export interface BoardingResultCardProps {
  ui: BoardingUiMessage;
  reason?: string;
  passenger?: BoardingPassenger;
  trip?: BoardingTrip;
  reservationId?: string;
  consumed?: boolean;
  className?: string;
}

export function BoardingResultCard({
  ui,
  reason,
  passenger,
  trip,
  reservationId,
  consumed,
  className,
}: BoardingResultCardProps) {
  const errorMessage = reason ? resolveBoardingErrorMessage(reason) : null;
  const devCode = boardingErrorDevCode(reason);
  const displayTitle = errorMessage?.title ?? ui.title;
  const displayMessage = errorMessage?.description ?? ui.message;

  const borderClass =
    ui.status === "success"
      ? "border-primary/40 bg-primary/5"
      : ui.status === "warning"
        ? "border-warning/40 bg-warning/5"
        : "border-destructive/40 bg-destructive/5";

  return (
    <div className={cn("rounded-lg border p-4", borderClass, className)}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <BoardingStatusBadge status={ui.status} />
        {consumed === true ? (
          <span className="text-xs font-medium text-primary">Embarquement consommé</span>
        ) : null}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{displayTitle}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{displayMessage}</p>
      {devCode ? (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">[{devCode}]</p>
      ) : null}

      {passenger || trip || reservationId ? (
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {passenger ? (
            <div>
              <dt className="text-muted-foreground">Passager</dt>
              <dd className="font-medium text-foreground">{formatBoardingPassenger(passenger)}</dd>
            </div>
          ) : null}
          {trip ? (
            <div>
              <dt className="text-muted-foreground">Départ</dt>
              <dd className="font-medium text-foreground">{formatDate(trip.departureTime)}</dd>
              {trip.line ? (
                <dd className="text-xs text-muted-foreground">
                  {trip.line.name} — {trip.line.startCity} → {trip.line.endCity}
                </dd>
              ) : null}
            </div>
          ) : null}
          {reservationId ? (
            <div>
              <dt className="text-muted-foreground">Réservation</dt>
              <dd className="font-mono text-foreground" title={reservationId}>
                {formatShortId(reservationId)}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}