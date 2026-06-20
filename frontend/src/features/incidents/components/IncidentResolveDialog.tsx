import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { incidentResolveSummaryLines } from "@/features/incidents/utils/incident-resolve-summary";
import type { AdminIncident } from "@/types/incidents.types";
import type { AdminTrip } from "@/types/trips.types";

const MIN_RESOLUTION_LENGTH = 10;

interface IncidentResolveDialogProps {
  incident: AdminIncident | null;
  trip?: AdminTrip;
  open: boolean;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (resolution: string) => void;
}

export function IncidentResolveDialog({
  incident,
  trip,
  open,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: IncidentResolveDialogProps) {
  const formId = useId();
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    if (open) setResolution("");
  }, [open, incident?.id]);

  if (!open || !incident) return null;

  const trimmed = resolution.trim();
  const canSubmit = trimmed.length >= MIN_RESOLUTION_LENGTH && !isSubmitting;
  const summaryLines = incidentResolveSummaryLines(incident, trip);

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
          Résoudre {incident.code}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{incident.title}</p>

        <dl className="mt-4 space-y-2 rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">
          {summaryLines.map((line) => (
            <div key={line.label} className="flex gap-2">
              <dt className="w-16 shrink-0 font-medium text-muted-foreground">{line.label}</dt>
              <dd className="text-foreground">{line.value}</dd>
            </div>
          ))}
        </dl>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onSubmit(trimmed);
          }}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              Note de résolution (min. {MIN_RESOLUTION_LENGTH} caractères)
            </span>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={4}
              maxLength={500}
              required
              placeholder="Décrivez l'action prise et le résultat…"
              className="w-full resize-none rounded-md border border-border bg-muted px-3 py-3 text-sm text-foreground"
            />
          </label>

          {errorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!canSubmit}>
              Marquer résolu
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
