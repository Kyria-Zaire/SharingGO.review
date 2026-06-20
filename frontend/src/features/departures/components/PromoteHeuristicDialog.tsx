import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format-date";
import { getHeuristicKindLabel } from "@/features/departures/constants/heuristic-labels";
import type { DepartureTripView } from "@/types/departures.types";
import type { HeuristicKind } from "@/types/incidents.types";

interface PromoteHeuristicDialogProps {
  view: DepartureTripView | null;
  heuristicOptions: HeuristicKind[];
  open: boolean;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (heuristicKind: HeuristicKind) => void;
}

export function PromoteHeuristicDialog({
  view,
  heuristicOptions,
  open,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: PromoteHeuristicDialogProps) {
  const formId = useId();
  const [selectedKind, setSelectedKind] = useState<HeuristicKind | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedKind(heuristicOptions[0] ?? null);
    }
  }, [open, view?.tripId, heuristicOptions]);

  if (!open || !view || heuristicOptions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <button type="button" className="absolute inset-0" aria-label="Fermer" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        className="relative z-10 w-full max-w-lg rounded-t-2xl border border-border bg-background p-5 shadow-2xl sm:rounded-2xl"
      >
        <h2 id={`${formId}-title`} className="text-lg font-bold text-foreground">
          Promouvoir en incident
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {view.routeLabel} · {formatDate(view.departureTime)}
        </p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedKind || isSubmitting) return;
            onSubmit(selectedKind);
          }}
        >
          {heuristicOptions.length === 1 ? (
            <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
              Anomalie : <strong>{getHeuristicKindLabel(heuristicOptions[0]!)}</strong>
            </p>
          ) : (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">Anomalie à promouvoir</legend>
              {heuristicOptions.map((kind) => (
                <label
                  key={kind}
                  className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 hover:bg-muted/20"
                >
                  <input
                    type="radio"
                    name={`${formId}-heuristic`}
                    value={kind}
                    checked={selectedKind === kind}
                    onChange={() => setSelectedKind(kind)}
                    className="mt-1"
                  />
                  <span className="text-sm text-foreground">{getHeuristicKindLabel(kind)}</span>
                </label>
              ))}
            </fieldset>
          )}

          <p className="text-xs text-muted-foreground">
            Un incident persistant sera créé et visible dans Admin → Incidents.
          </p>

          {errorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!selectedKind || isSubmitting}
            >
              Confirmer
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
