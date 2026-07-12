import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { RefundActionKind, RefundActionResult } from "@/types/reservations.types";

type ModalState = "confirm" | "already-processed";

export interface RefundActionModalReservation {
  id: string;
  passengerName: string;
  tripLabel: string;
  amountLabel: string;
  paymentRefLabel: string;
}

export interface RefundActionModalProps {
  reservation: RefundActionModalReservation;
  kind: RefundActionKind;
  onConfirm: (id: string, kind: RefundActionKind) => Promise<RefundActionResult>;
  onClose: () => void;
  onRefresh: () => void;
}

const ACTION_COPY: Record<RefundActionKind, { title: string; confirmLabel: string }> = {
  refund: {
    title: "Rembourser cette réservation ?",
    confirmLabel: "Rembourser",
  },
  credit: {
    title: "Créditer un avoir pour cette réservation ?",
    confirmLabel: "Créditer un avoir",
  },
};

export function RefundActionModal({
  reservation,
  kind,
  onConfirm,
  onClose,
  onRefresh,
}: RefundActionModalProps) {
  const [modalState, setModalState] = useState<ModalState>("confirm");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { title, confirmLabel } = ACTION_COPY[kind];

  async function handleConfirm() {
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await onConfirm(reservation.id, kind);

    setIsSubmitting(false);

    if (result.ok) {
      onClose();
      return;
    }
    if (result.conflict) {
      setModalState("already-processed");
      return;
    }
    setErrorMessage("Une erreur est survenue. Réessayez.");
  }

  function handleRefresh() {
    onRefresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <button type="button" className="absolute inset-0" aria-label="Fermer" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-action-modal-title"
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-background p-5 shadow-2xl sm:rounded-2xl"
      >
        {modalState === "confirm" ? (
          <>
            <h2 id="refund-action-modal-title" className="text-lg font-bold text-foreground">
              {title}
            </h2>

            <dl className="mt-4 space-y-2 rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-muted-foreground">Passager</dt>
                <dd className="text-foreground">{reservation.passengerName}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-muted-foreground">Trajet</dt>
                <dd className="text-foreground">{reservation.tripLabel}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-muted-foreground">Montant</dt>
                <dd className="text-foreground">{reservation.amountLabel}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-muted-foreground">Paiement</dt>
                <dd className="font-mono text-foreground">{reservation.paymentRefLabel}</dd>
              </div>
            </dl>

            {errorMessage ? (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <Button variant="primary" isLoading={isSubmitting} onClick={handleConfirm}>
                {confirmLabel}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Annuler
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-warning/30 bg-warning/10 text-warning">
                <AlertTriangle className="h-4 w-4" aria-hidden />
              </span>
              <h2 id="refund-action-modal-title" className="text-lg font-bold text-foreground">
                Déjà traité entre-temps
              </h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Cette réservation a été remboursée, créditée ou modifiée par une autre action avant
              votre confirmation. Rafraîchissez la liste pour voir son état actuel.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <Button variant="primary" onClick={handleRefresh}>
                Rafraîchir la liste
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
