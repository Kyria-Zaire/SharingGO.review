import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import { IncidentCard } from "./IncidentCard";
import type { AdminIncident } from "@/types/incidents.types";
import type { AdminTrip } from "@/types/trips.types";

export function IncidentsList({
  incidents,
  tripById,
  onResolve,
}: {
  incidents: AdminIncident[];
  tripById: Map<string, AdminTrip>;
  onResolve: (incidentId: string) => void;
}) {
  if (incidents.length === 0) return null;

  const openIncidents = incidents.filter((incident) => isOpenIncidentStatus(incident.status));
  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "RESOLVED" || incident.status === "CLOSED"
  );

  return (
    <div className="space-y-6" data-incident-section="main-list">
      {openIncidents.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Open incidents
          </h2>
          <div className="grid gap-3">
            {openIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                trip={incident.relatedTripId ? tripById.get(incident.relatedTripId) : undefined}
                onResolve={onResolve}
              />
            ))}
          </div>
        </section>
      ) : null}

      {resolvedIncidents.length > 0 ? (
        <section data-incident-section="resolved" data-future-collapse="true">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Resolved
          </h2>
          <div className="grid gap-3">
            {resolvedIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                trip={incident.relatedTripId ? tripById.get(incident.relatedTripId) : undefined}
                resolvedSection
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
