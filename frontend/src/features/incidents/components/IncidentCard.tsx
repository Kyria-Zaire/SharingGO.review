import { Button } from "@/components/ui/Button";
import { formatShortId } from "@/lib/format-id";
import { formatIncidentTime } from "@/features/incidents/utils/format-incident-time";
import {
  formatIncidentTripDisplay,
  formatIncidentUserName,
} from "@/features/incidents/utils/format-incident-trip";
import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import { IncidentSeverityBadge } from "./IncidentSeverityBadge";
import { IncidentSourceBadge } from "./IncidentSourceBadge";
import { IncidentStatusBadge } from "./IncidentStatusBadge";
import { IncidentTypeBadge } from "./IncidentTypeBadge";
import type { AdminIncident } from "@/types/incidents.types";
import type { AdminTrip } from "@/types/trips.types";

export function IncidentCard({
  incident,
  trip,
  onResolve,
  resolvedSection = false,
}: {
  incident: AdminIncident;
  trip?: AdminTrip;
  onResolve?: (incidentId: string) => void;
  resolvedSection?: boolean;
}) {
  const tripDisplay = incident.relatedTripId
    ? formatIncidentTripDisplay(trip, incident.relatedTripId)
    : null;
  const resolverName = formatIncidentUserName(incident.resolver);

  return (
    <article
      className="rounded-lg border border-border bg-muted/20 p-4"
      data-incident-status={incident.status}
      data-incident-severity={incident.severity}
      data-resolved-section={resolvedSection ? "true" : "false"}
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-semibold text-primary">{incident.code}</p>
          <h3 className="text-base font-semibold text-foreground">{incident.title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <IncidentSourceBadge source={incident.source} />
          <IncidentSeverityBadge severity={incident.severity} status={incident.status} />
          <IncidentStatusBadge status={incident.status} />
          <IncidentTypeBadge type={incident.type} />
        </div>
      </div>

      {incident.description ? (
        <p className="mb-3 text-sm text-muted-foreground">{incident.description}</p>
      ) : null}

      <dl className="mb-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="uppercase tracking-wide">Créé</dt>
          <dd className="text-sm text-foreground">{formatIncidentTime(incident.createdAt)}</dd>
        </div>
        {tripDisplay ? (
          <div>
            <dt className="uppercase tracking-wide">Trajet</dt>
            <dd className="text-sm font-medium text-foreground">{tripDisplay.primary}</dd>
            {tripDisplay.secondary ? (
              <dd className="text-xs text-muted-foreground">{tripDisplay.secondary}</dd>
            ) : null}
          </div>
        ) : null}
        {incident.relatedReservationId ? (
          <div>
            <dt className="uppercase tracking-wide">Réservation</dt>
            <dd className="font-mono text-sm text-foreground" title={incident.relatedReservationId}>
              {formatShortId(incident.relatedReservationId)}
            </dd>
          </div>
        ) : null}
        {incident.resolvedAt ? (
          <div>
            <dt className="uppercase tracking-wide">Résolu</dt>
            <dd className="text-sm font-medium text-primary">
              {formatIncidentTime(incident.resolvedAt)}
            </dd>
            {resolverName ? (
              <dd className="text-xs text-muted-foreground">par {resolverName}</dd>
            ) : null}
          </div>
        ) : null}
        {incident.resolution ? (
          <div className="sm:col-span-2">
            <dt className="uppercase tracking-wide">Note</dt>
            <dd className="text-sm text-foreground">{incident.resolution}</dd>
          </div>
        ) : null}
      </dl>

      {isOpenIncidentStatus(incident.status) && onResolve ? (
        <Button variant="secondary" size="sm" onClick={() => onResolve(incident.id)}>
          Résoudre
        </Button>
      ) : null}
    </article>
  );
}
