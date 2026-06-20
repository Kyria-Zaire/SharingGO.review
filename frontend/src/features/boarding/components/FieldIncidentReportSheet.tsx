import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { createFieldIncident } from "@/api/boarding-field-incidents.api";
import { listPublicTrips } from "@/api/public-trips.api";
import { ApiError } from "@/api/http";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format-date";
import {
  buildFreeFieldIncidentPayload,
  buildScanRejectedFieldIncidentPayload,
} from "@/features/boarding/utils/build-field-incident-payload";
import {
  FIELD_INCIDENT_SEVERITY_LABELS,
  FIELD_INCIDENT_TYPE_LABELS,
  FREE_FIELD_INCIDENT_TYPES,
  deriveFieldIncidentFromReason,
} from "@/features/boarding/utils/field-incident-mapping";
import { resolveBoardingErrorMessage } from "@/features/boarding/utils/boarding-error-messages";
import type { BoardingValidationReason } from "@/types/boarding.types";
import type { BoardingFailureContext } from "@/types/boarding.types";
import type {
  FieldIncidentSeverity,
  FieldIncidentType,
} from "@/types/boarding-field-incident.types";

export type FieldIncidentReportMode = "scan-rejected" | "free";

export interface FieldIncidentReportSheetProps {
  open: boolean;
  mode: FieldIncidentReportMode;
  onClose: () => void;
  /** Scan-rejected context */
  scannedToken?: string | null;
  scanReason?: BoardingValidationReason;
  scanContext?: BoardingFailureContext;
}

type SheetPhase = "form" | "success" | "error";

function resolveSubmitError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return "Vous n'êtes pas autorisé à signaler un incident.";
    if (error.status === 400) return "Données invalides. Vérifiez le formulaire.";
    if (error.status === 409) return "Un incident similaire est déjà ouvert.";
    if (error.status >= 500) return "Erreur serveur. Réessayez dans un instant.";
    return error.message;
  }
  return "Impossible de signaler l'incident.";
}

export function FieldIncidentReportSheet({
  open,
  mode,
  onClose,
  scannedToken,
  scanReason,
  scanContext,
}: FieldIncidentReportSheetProps) {
  const formId = useId();
  const [phase, setPhase] = useState<SheetPhase>("form");
  const [incidentCode, setIncidentCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const derived = scanReason ? deriveFieldIncidentFromReason(scanReason) : null;
  const scanError = scanReason ? resolveBoardingErrorMessage(scanReason) : null;

  const [description, setDescription] = useState("");
  const [tripId, setTripId] = useState("");
  const [type, setType] = useState<FieldIncidentType>("OTHER");
  const [severity, setSeverity] = useState<FieldIncidentSeverity>("MEDIUM");

  const needsTripPicker =
    mode === "free" || (mode === "scan-rejected" && !scanContext?.tripId);

  const tripsQuery = useQuery({
    queryKey: ["public-trips", "field-incident"],
    queryFn: () => listPublicTrips({ from: new Date().toISOString(), limit: 12 }),
    enabled: open && needsTripPicker,
    staleTime: 60_000,
  });

  const upcomingTrips = useMemo(() => tripsQuery.data?.trips ?? [], [tripsQuery.data?.trips]);

  useEffect(() => {
    if (!open) return;
    setPhase("form");
    setIncidentCode(null);
    setErrorMessage(null);

    if (mode === "scan-rejected" && scanReason) {
      const d = deriveFieldIncidentFromReason(scanReason);
      const err = resolveBoardingErrorMessage(scanReason);
      setDescription(`${err.title} — ${err.description}`);
      setType(d?.type ?? "BOARDING");
      setSeverity(d?.severityFloor ?? "MEDIUM");
      setTripId(scanContext?.tripId ?? "");
    } else {
      setDescription("");
      setType("OTHER");
      setSeverity("MEDIUM");
      setTripId("");
    }
  }, [open, mode, scanReason, scanContext?.tripId]);

  useEffect(() => {
    if (!open || !needsTripPicker || tripId || upcomingTrips.length === 0) return;
    const firstTrip = upcomingTrips[0];
    if (firstTrip) setTripId(firstTrip.id);
  }, [open, needsTripPicker, tripId, upcomingTrips]);

  const submitMutation = useMutation({
    mutationFn: createFieldIncident,
    onSuccess: (data) => {
      setIncidentCode(data.code);
      setPhase("success");
    },
    onError: (error) => {
      setErrorMessage(resolveSubmitError(error));
      setPhase("error");
    },
  });

  const canSubmitScan = useMemo(() => {
    if (mode !== "scan-rejected" || !scanReason || !scannedToken) return false;
    const effectiveTripId = tripId || scanContext?.tripId;
    if (!effectiveTripId) return false;
    return buildScanRejectedFieldIncidentPayload({
      scannedToken,
      reason: scanReason,
      context: scanContext,
      description,
      relatedTripId: effectiveTripId,
    }) !== null;
  }, [mode, scanReason, scannedToken, tripId, scanContext, description]);

  const canSubmitFree = mode === "free" && tripId.trim() !== "" && description.trim().length >= 10;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitMutation.isPending) return;

    if (mode === "scan-rejected" && scanReason && scannedToken) {
      const effectiveTripId = tripId || scanContext?.tripId;
      const payload = buildScanRejectedFieldIncidentPayload({
        scannedToken,
        reason: scanReason,
        context: scanContext,
        description,
        relatedTripId: effectiveTripId,
      });
      if (!payload) {
        setErrorMessage("Sélectionnez un trajet pour envoyer le signalement.");
        setPhase("error");
        return;
      }
      submitMutation.mutate(payload);
      return;
    }

    if (mode === "free") {
      submitMutation.mutate(
        buildFreeFieldIncidentPayload({
          relatedTripId: tripId,
          type,
          severity,
          description,
        })
      );
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/60">
      <button
        type="button"
        className="min-h-0 flex-1 cursor-default"
        aria-label="Fermer"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        className="max-h-[92vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:px-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id={`${formId}-title`} className="text-lg font-bold text-foreground">
              {mode === "scan-rejected" ? "Signaler un incident" : "Signaler un problème"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "scan-rejected"
                ? "Exploitation informée avec le contexte du scan refusé."
                : "Passager sans QR, retard ou autre situation terrain."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Fermer le formulaire"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {phase === "success" ? (
          <div className="space-y-4 py-2 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden />
            <p className="text-xl font-bold text-foreground">Incident signalé</p>
            {incidentCode ? (
              <p className="font-mono text-base text-primary">{incidentCode}</p>
            ) : null}
            <p className="text-sm text-muted-foreground">
              L&apos;exploitation a été notifiée. Vous pouvez reprendre le scan.
            </p>
            <Button variant="primary" size="lg" className="h-14 w-full" onClick={onClose}>
              Retour au scanner
            </Button>
          </div>
        ) : null}

        {phase === "error" ? (
          <div className="space-y-4 py-2 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" aria-hidden />
            <p className="text-xl font-bold text-foreground">Impossible de signaler l&apos;incident</p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <div className="flex flex-col gap-2">
              <Button variant="primary" size="lg" className="h-14 w-full" onClick={() => setPhase("form")}>
                Réessayer
              </Button>
              <Button variant="ghost" size="lg" className="w-full" onClick={onClose}>
                Annuler
              </Button>
            </div>
          </div>
        ) : null}

        {phase === "form" ? (
          <form id={formId} onSubmit={handleSubmit} className="space-y-4">
            {mode === "scan-rejected" && scanError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                <p className="font-semibold text-foreground">{scanError.title}</p>
                <p className="mt-1 text-muted-foreground">{scanError.description}</p>
                {derived ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Type suggéré : {FIELD_INCIDENT_TYPE_LABELS[derived.type]} · Criticité min.{" "}
                    {FIELD_INCIDENT_SEVERITY_LABELS[derived.severityFloor]}
                  </p>
                ) : null}
              </div>
            ) : null}

            {needsTripPicker ? (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">Trajet concerné</span>
                <select
                  value={tripId}
                  onChange={(e) => setTripId(e.target.value)}
                  required
                  disabled={tripsQuery.isLoading || upcomingTrips.length === 0}
                  className="h-12 w-full rounded-md border border-border bg-muted px-3 text-base text-foreground"
                >
                  {tripsQuery.isLoading ? <option value="">Chargement…</option> : null}
                  {!tripsQuery.isLoading && upcomingTrips.length === 0 ? (
                    <option value="">Aucun trajet à venir</option>
                  ) : null}
                  {upcomingTrips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {formatDate(trip.departureTime)} — {trip.line.startCity} → {trip.line.endCity}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {mode === "free" ? (
              <>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-foreground">Type</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FieldIncidentType)}
                    className="h-12 w-full rounded-md border border-border bg-muted px-3 text-base text-foreground"
                  >
                    {FREE_FIELD_INCIDENT_TYPES.map((value) => (
                      <option key={value} value={value}>
                        {FIELD_INCIDENT_TYPE_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-foreground">Criticité</span>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as FieldIncidentSeverity)}
                    className="h-12 w-full rounded-md border border-border bg-muted px-3 text-base text-foreground"
                  >
                    {(Object.keys(FIELD_INCIDENT_SEVERITY_LABELS) as FieldIncidentSeverity[]).map(
                      (value) => (
                        <option key={value} value={value}>
                          {FIELD_INCIDENT_SEVERITY_LABELS[value]}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </>
            ) : null}

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">
                Description {mode === "free" ? "(obligatoire)" : ""}
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required={mode === "free"}
                rows={4}
                maxLength={500}
                placeholder={
                  mode === "free"
                    ? "Décrivez la situation terrain (min. 10 caractères)…"
                    : "Complétez si besoin…"
                }
                className="w-full resize-none rounded-md border border-border bg-muted px-3 py-3 text-base text-foreground placeholder:text-muted-foreground"
              />
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="h-14 w-full text-base font-bold"
              isLoading={submitMutation.isPending}
              disabled={
                submitMutation.isPending ||
                (mode === "scan-rejected" ? !canSubmitScan : !canSubmitFree)
              }
            >
              Envoyer le signalement
            </Button>

            <Button type="button" variant="ghost" size="lg" className="w-full" onClick={onClose}>
              Annuler
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
