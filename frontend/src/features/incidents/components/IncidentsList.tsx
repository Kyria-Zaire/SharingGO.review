import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import { IncidentCard } from "./IncidentCard";
import type { AdminIncident } from "@/types/incidents.types";
import type { AdminTrip } from "@/types/trips.types";

function IncidentSection({
  title,
  incidents,
  tripById,
  highlightId,
  onResolve,
  onAssign,
  isAssigning,
  terminal,
  sectionId,
}: {
  title: string;
  incidents: AdminIncident[];
  tripById: Map<string, AdminTrip>;
  highlightId?: string | null;
  onResolve?: (incidentId: string) => void;
  onAssign?: (incidentId: string, userId: string | null) => void;
  isAssigning?: boolean;
  terminal?: boolean;
  sectionId: string;
}) {
  if (incidents.length === 0) return null;

  return (
    <section data-incident-section={sectionId} className={terminal ? "opacity-95" : undefined}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title} ({incidents.length})
      </h2>
      <div className="grid gap-3">
        {incidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            trip={incident.relatedTripId ? tripById.get(incident.relatedTripId) : undefined}
            highlighted={highlightId === incident.id}
            onResolve={onResolve}
            onAssign={onAssign}
            isAssigning={isAssigning}
            terminalSection={terminal}
          />
        ))}
      </div>
    </section>
  );
}

export function IncidentsList({
  incidents,
  tripById,
  highlightId,
  onResolve,
  onAssign,
  isAssigning,
}: {
  incidents: AdminIncident[];
  tripById: Map<string, AdminTrip>;
  highlightId?: string | null;
  onResolve: (incidentId: string) => void;
  onAssign?: (incidentId: string, userId: string | null) => void;
  isAssigning?: boolean;
}) {
  if (incidents.length === 0) return null;

  const activeIncidents = incidents.filter((incident) => isOpenIncidentStatus(incident.status));
  const resolvedIncidents = incidents.filter((incident) => incident.status === "RESOLVED");
  const closedIncidents = incidents.filter((incident) => incident.status === "CLOSED");

  return (
    <div className="space-y-8" data-incident-section="main-list">
      <IncidentSection
        sectionId="active"
        title="Incidents actifs"
        incidents={activeIncidents}
        tripById={tripById}
        highlightId={highlightId}
        onResolve={onResolve}
        onAssign={onAssign}
        isAssigning={isAssigning}
      />

      <IncidentSection
        sectionId="resolved"
        title="Résolus"
        incidents={resolvedIncidents}
        tripById={tripById}
        highlightId={highlightId}
        terminal
      />

      <IncidentSection
        sectionId="closed"
        title="Clôturés"
        incidents={closedIncidents}
        tripById={tripById}
        highlightId={highlightId}
        terminal
      />
    </div>
  );
}
