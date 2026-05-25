import { IncidentCard } from "./IncidentCard";
import type { AdminIncident } from "@/types/incidents.types";

export function CriticalIncidentsSection({
  incidents,
  onResolve,
}: {
  incidents: AdminIncident[];
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
          <IncidentCard key={incident.id} incident={incident} onResolve={onResolve} />
        ))}
      </div>
    </section>
  );
}
