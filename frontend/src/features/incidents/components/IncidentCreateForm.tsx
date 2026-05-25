import { type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_TYPE_LABELS,
} from "@/features/incidents/constants/incident-labels";
import type {
  CreateAdminIncidentBody,
  IncidentSeverity,
  IncidentType,
} from "@/types/incidents.types";

const selectClassName =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function IncidentCreateForm({
  initialType = "OTHER",
  initialTripId = "",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: {
  initialType?: IncidentType;
  initialTripId?: string;
  onSubmit: (input: CreateAdminIncidentBody) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const severity = data.get("severity") as IncidentSeverity;
    const type = data.get("type") as IncidentType;
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const relatedTripId = String(data.get("relatedTripId") ?? "").trim();

    if (!title) return;

    if (severity === "CRITICAL") {
      const confirmed = window.confirm(
        "Créer un incident CRITICAL ? Cet incident sera prioritaire dans le cockpit."
      );
      if (!confirmed) return;
    }

    onSubmit({
      severity,
      type,
      title,
      description: description || undefined,
      relatedTripId: relatedTripId || undefined,
    });

    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-muted/20 p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Nouvel incident opérationnel</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="title" label="Titre" placeholder="Ex. Boarding bloqué porte B" required maxLength={120} />
        <div className="space-y-1.5">
          <label htmlFor="incident-severity" className="text-sm font-medium text-foreground">
            Sévérité
          </label>
          <select id="incident-severity" name="severity" defaultValue="MEDIUM" className={selectClassName}>
            {(Object.keys(INCIDENT_SEVERITY_LABELS) as IncidentSeverity[]).map((value) => (
              <option key={value} value={value}>
                {INCIDENT_SEVERITY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="incident-type" className="text-sm font-medium text-foreground">
            Type
          </label>
          <select id="incident-type" name="type" defaultValue={initialType} className={selectClassName}>
            {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map((value) => (
              <option key={value} value={value}>
                {INCIDENT_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <Input
          name="relatedTripId"
          label="Trajet (ID optionnel)"
          placeholder="ID trajet lié"
          defaultValue={initialTripId}
          maxLength={64}
        />
        <div className="sm:col-span-2">
          <label htmlFor="incident-description" className="text-sm font-medium text-foreground">
            Description (optionnelle)
          </label>
          <textarea
            id="incident-description"
            name="description"
            rows={3}
            maxLength={500}
            className="mt-1.5 flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Créer incident
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Annuler
          </Button>
        ) : null}
      </div>
    </form>
  );
}
