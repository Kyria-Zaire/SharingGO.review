import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import { IncidentCard } from "./IncidentCard";
import type { AdminIncident } from "@/types/incidents.types";

export function IncidentsList({
  incidents,
  onResolve,
}: {
  incidents: AdminIncident[];
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
              <IncidentCard key={incident.id} incident={incident} onResolve={onResolve} />
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
              <IncidentCard key={incident.id} incident={incident} resolvedSection />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
