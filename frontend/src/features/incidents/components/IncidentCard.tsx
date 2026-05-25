import { Button } from "@/components/ui/Button";
import { formatShortId } from "@/lib/format-id";
import { formatIncidentTime } from "@/features/incidents/utils/format-incident-time";
import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import { IncidentSeverityBadge } from "./IncidentSeverityBadge";
import { IncidentStatusBadge } from "./IncidentStatusBadge";
import { IncidentTypeBadge } from "./IncidentTypeBadge";
import type { AdminIncident } from "@/types/incidents.types";

export function IncidentCard({
  incident,
  onResolve,
  resolvedSection = false,
}: {
  incident: AdminIncident;
  onResolve?: (incidentId: string) => void;
  resolvedSection?: boolean;
}) {
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
        {incident.relatedTripId ? (
          <div>
            <dt className="uppercase tracking-wide">Trajet</dt>
            <dd className="font-mono text-sm text-foreground" title={incident.relatedTripId}>
              {formatShortId(incident.relatedTripId)}
            </dd>
          </div>
        ) : null}
        {incident.resolvedAt ? (
          <div>
            <dt className="uppercase tracking-wide">Resolved</dt>
            <dd className="text-sm font-medium text-primary">
              {formatIncidentTime(incident.resolvedAt)}
            </dd>
          </div>
        ) : null}
      </dl>

      {isOpenIncidentStatus(incident.status) && onResolve ? (
        <Button variant="secondary" size="sm" onClick={() => onResolve(incident.id)}>
          Resolve incident
        </Button>
      ) : null}
    </article>
  );
}
