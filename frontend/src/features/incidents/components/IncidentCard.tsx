import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { formatShortId } from "@/lib/format-id";
import { formatDate } from "@/lib/format-date";
import { formatIncidentTime } from "@/features/incidents/utils/format-incident-time";
import {
  formatIncidentTripDisplay,
  formatIncidentUserName,
} from "@/features/incidents/utils/format-incident-trip";
import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import { IncidentAssignControl } from "./IncidentAssignControl";
import { IncidentSeverityBadge } from "./IncidentSeverityBadge";
import { IncidentSourceBadge } from "./IncidentSourceBadge";
import { IncidentStatusBadge } from "./IncidentStatusBadge";
import { IncidentTypeBadge } from "./IncidentTypeBadge";
import type { AdminIncident } from "@/types/incidents.types";
import type { AdminTrip } from "@/types/trips.types";

export function IncidentCard({
  incident,
  trip,
  highlighted = false,
  onResolve,
  onAssign,
  isAssigning,
  terminalSection = false,
}: {
  incident: AdminIncident;
  trip?: AdminTrip;
  highlighted?: boolean;
  onResolve?: (incidentId: string) => void;
  onAssign?: (incidentId: string, userId: string | null) => void;
  isAssigning?: boolean;
  terminalSection?: boolean;
}) {
  const tripDisplay = incident.relatedTripId
    ? formatIncidentTripDisplay(trip, incident.relatedTripId)
    : null;
  const resolverName = formatIncidentUserName(incident.resolver);
  const creatorName = formatIncidentUserName(incident.creator);

  return (
    <article
      id={`incident-${incident.id}`}
      data-incident-id={incident.id}
      data-incident-code={incident.code}
      className={cn(
        "rounded-lg border bg-muted/20 p-4 transition-shadow",
        highlighted ? "border-primary ring-2 ring-primary/30" : "border-border",
        terminalSection && "opacity-90"
      )}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
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

      {tripDisplay ? (
        <div className="mb-3 rounded-md border border-border/60 bg-background/50 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Trajet</p>
          <p className="text-sm font-semibold text-foreground">{tripDisplay.primary}</p>
          {trip ? (
            <p className="text-sm text-muted-foreground">{formatDate(trip.departureTime)}</p>
          ) : tripDisplay.secondary ? (
            <p className="text-sm text-muted-foreground">{tripDisplay.secondary}</p>
          ) : null}
        </div>
      ) : null}

      <dl className="mb-3 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="uppercase tracking-wide">Créé</dt>
          <dd className="text-sm text-foreground">{formatIncidentTime(incident.createdAt)}</dd>
          {creatorName ? <dd className="text-xs">par {creatorName}</dd> : null}
        </div>

        {onAssign ? (
          <IncidentAssignControl
            incident={incident}
            onAssign={(userId) => onAssign(incident.id, userId)}
            isAssigning={isAssigning}
          />
        ) : (
          <div>
            <dt className="uppercase tracking-wide">Assigné à</dt>
            <dd className="text-sm text-foreground">
              {formatIncidentUserName(incident.assignee) ?? (
                <span className="text-muted-foreground">Non assigné</span>
              )}
            </dd>
          </div>
        )}

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
              <dd className="text-sm text-foreground">
                Résolu par : <span className="font-medium">{resolverName}</span>
              </dd>
            ) : null}
          </div>
        ) : null}

        {incident.status === "CLOSED" && incident.closedReason ? (
          <div>
            <dt className="uppercase tracking-wide">Clôture</dt>
            <dd className="text-sm text-foreground">{incident.closedReason}</dd>
          </div>
        ) : null}

        {incident.resolution ? (
          <div className="sm:col-span-2">
            <dt className="uppercase tracking-wide">Note de résolution</dt>
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
