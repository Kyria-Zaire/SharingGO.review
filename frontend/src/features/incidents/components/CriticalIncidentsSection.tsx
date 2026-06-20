import { IncidentCard } from "./IncidentCard";
import type { AdminIncident } from "@/types/incidents.types";
import type { AdminTrip } from "@/types/trips.types";

export function CriticalIncidentsSection({
  incidents,
  tripById,
  onResolve,
}: {
  incidents: AdminIncident[];
  tripById: Map<string, AdminTrip>;
  onResolve: (incidentId: string) => void;
}) {
  if (incidents.length === 0) return null;

  return (
    <section
      className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4"
      aria-label="Critical open incidents"
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-destructive">
        Critical open incidents ({incidents.length})
      </h2>
      <div className="grid gap-3">
        {incidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            trip={incident.relatedTripId ? tripById.get(incident.relatedTripId) : undefined}
            onResolve={onResolve}
          />
        ))}
      </div>
    </section>
  );
}
