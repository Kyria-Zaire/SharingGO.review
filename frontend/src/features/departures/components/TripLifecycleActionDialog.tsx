import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format-date";
import type { TripOccupancy } from "@/types/trips.types";

export type TripLifecycleDialogAction = "depart" | "complete" | "cancel";

interface TripLifecycleActionDialogProps {
  open: boolean;
  action: TripLifecycleDialogAction;
  routeLabel: string;
  departureTime: string;
  occupancy: TripOccupancy | null;
  isLoadingOccupancy: boolean;
  cancelReason: string;
  onCancelReasonChange: (value: string) => void;
  cancelSeverityClass: string;
  absents: number;
  errorMessage: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function TripLifecycleActionDialog({
  open,
  action,
  routeLabel,
  departureTime,
  occupancy,
  isLoadingOccupancy,
  cancelReason,
  onCancelReasonChange,
  cancelSeverityClass,
  absents,
  errorMessage,
  isSubmitting,
  onClose,
  onConfirm,
}: TripLifecycleActionDialogProps) {
  const formId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const confirmDisabled =
    isSubmitting || isLoadingOccupancy || (action === "cancel" && cancelReason.trim().length < 10);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        className="relative z-[101] w-full max-w-lg rounded-t-2xl border border-border bg-background p-5 shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={`${formId}-title`} className="text-lg font-bold text-foreground">
          {action === "depart" && "Confirmer le départ"}
          {action === "complete" && "Confirmer la fin du trajet"}
          {action === "cancel" && "Annuler le trajet"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {routeLabel} · {formatDate(departureTime)}
        </p>

        {isLoadingOccupancy ? (
          <p className="mt-4 text-sm text-muted-foreground">Chargement des compteurs en cours…</p>
        ) : null}

        {action === "depart" && occupancy ? (
          <div className="mt-4 rounded-md border border-border bg-muted/30 p-3 text-sm">
            <p>Occupés : {occupancy.occupiedSeats}</p>
            <p>Embarqués : {occupancy.usedSeats}</p>
            <p>Absents : {absents}</p>
            <p className="mt-2 font-medium text-foreground">
              {absents === 0
                ? "Tous les passagers sont embarqués. Confirmer le départ ?"
                : `${absents} passager(s) ne seront pas embarqué(s). Confirmer le départ ?`}
            </p>
          </div>
        ) : null}

        {action === "complete" ? (
          <p className="mt-4 text-sm text-foreground">Confirmer la fin du trajet ?</p>
        ) : null}

        {action === "cancel" ? (
          <div className="mt-4 space-y-3">
            {occupancy ? (
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                <p>Réservations confirmées : {occupancy.confirmedSeats}</p>
                <p>Passagers déjà embarqués : {occupancy.usedSeats}</p>
              </div>
            ) : null}
            <div className={cn("rounded-md border p-3 text-sm", cancelSeverityClass)}>
              L'annulation bloque le QR mais NE REMBOURSE PAS automatiquement les passagers.
            </div>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-foreground">
                Raison d'annulation (min. 10 caractères)
              </span>
              <textarea
                value={cancelReason}
                onChange={(e) => onCancelReasonChange(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
                placeholder="Expliquer la raison opérationnelle…"
              />
            </label>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <form
          className="mt-5 flex flex-col gap-2 sm:flex-row-reverse"
          onSubmit={(event) => {
            event.preventDefault();
            if (confirmDisabled) return;
            onConfirm();
          }}
        >
          <Button
            type="submit"
            variant={action === "cancel" ? "destructive" : "primary"}
            isLoading={isSubmitting}
            disabled={confirmDisabled}
          >
            {action === "cancel" ? "Confirmer l'annulation" : "Confirmer"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Fermer
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
}
