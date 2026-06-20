import { CheckCircle, XCircle, User, Clock, MapPin, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format-date";
import { formatBoardingPassenger } from "@/features/boarding/utils/passenger-display";
import { canReportFieldIncidentFromScanReason } from "@/features/boarding/utils/field-incident-mapping";
import { BoardingErrorAlert } from "./BoardingErrorAlert";
import type { BoardingValidationResponse } from "@/types/boarding.types";

interface ScanConfirmPanelProps {
  result: BoardingValidationResponse;
  isConsuming: boolean;
  /** Timeout in ms before the parent auto-cancels. Used for visual countdown. */
  confirmTimeoutMs: number;
  onConfirm: () => void;
  onCancel: () => void;
  onReportIncident?: () => void;
}

export function ScanConfirmPanel({
  result,
  isConsuming,
  confirmTimeoutMs,
  onConfirm,
  onCancel,
  onReportIncident,
}: ScanConfirmPanelProps) {
  if (!result.valid) {
    const showReport =
      onReportIncident != null && canReportFieldIncidentFromScanReason(result.reason);

    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-3">
          <XCircle className="h-8 w-8 shrink-0 text-destructive" />
          <p className="text-base font-bold text-foreground">Billet refusé</p>
        </div>
        <BoardingErrorAlert code={result.reason} />
        {showReport ? (
          <Button
            variant="secondary"
            size="lg"
            className="mt-4 h-14 w-full gap-2 text-base font-semibold"
            onClick={onReportIncident}
          >
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
            Signaler un incident
          </Button>
        ) : null}
        <Button variant="ghost" size="lg" className="mt-3 w-full" onClick={onCancel}>
          Rescanner
        </Button>
      </div>
    );
  }

  return (
    <ValidConfirmPanel
      result={result}
      isConsuming={isConsuming}
      confirmTimeoutMs={confirmTimeoutMs}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

// ── Valid confirm panel with countdown ────────────────────────────────────────

interface ValidConfirmPanelProps {
  result: Extract<BoardingValidationResponse, { valid: true }>;
  isConsuming: boolean;
  confirmTimeoutMs: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function ValidConfirmPanel({
  result,
  isConsuming,
  confirmTimeoutMs,
  onConfirm,
  onCancel,
}: ValidConfirmPanelProps) {
  const { passenger, trip, reservation } = result;
  const totalSeconds = Math.round(confirmTimeoutMs / 1000);
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (isConsuming) return;
    const interval = setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isConsuming]);

  const urgentColor = remaining <= 5 ? "text-destructive" : remaining <= 10 ? "text-warning" : "text-muted-foreground";
  const progressPct = (remaining / totalSeconds) * 100;

  return (
    <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 sm:p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 shrink-0 text-primary" />
          <div>
            <p className="text-base font-bold text-foreground">Billet valide</p>
            <p className="text-sm text-muted-foreground">
              Réservation {reservation.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        {/* Countdown pill */}
        {!isConsuming && (
          <span className={`text-sm font-mono font-semibold tabular-nums ${urgentColor}`}>
            {remaining}s
          </span>
        )}
      </div>

      {/* Countdown progress bar */}
      {!isConsuming && (
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Passenger & trip */}
      <dl className="mb-5 space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <dt className="text-xs text-muted-foreground">Passager</dt>
            <dd className="font-semibold text-foreground">{formatBoardingPassenger(passenger)}</dd>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <dt className="text-xs text-muted-foreground">Départ</dt>
            <dd className="font-medium text-foreground">{formatDate(trip.departureTime)}</dd>
          </div>
        </div>

        {trip.line && (
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">Trajet</dt>
              <dd className="font-medium text-foreground">
                {trip.line.startCity} → {trip.line.endCity}
              </dd>
              <dd className="text-xs text-muted-foreground">{trip.line.name}</dd>
            </div>
          </div>
        )}
      </dl>

      {/* Primary action — oversized for fat-finger mobile */}
      <Button
        variant="primary"
        size="lg"
        className="h-16 w-full text-lg font-bold tracking-wide shadow-lg shadow-primary/30"
        onClick={onConfirm}
        isLoading={isConsuming}
        disabled={isConsuming}
      >
        {isConsuming ? "Embarquement…" : "✓ Confirmer embarquement"}
      </Button>

      <button
        type="button"
        className="mt-3 w-full py-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={onCancel}
        disabled={isConsuming}
      >
        Annuler — rescanner
      </button>
    </div>
  );
}
