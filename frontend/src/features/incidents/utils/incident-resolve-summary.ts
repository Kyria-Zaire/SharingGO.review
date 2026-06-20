import { formatDate } from "@/lib/format-date";
import {
  getIncidentSourceLabel,
  getIncidentTypeLabel,
} from "@/features/incidents/constants/incident-labels";
import { formatIncidentTripDisplay } from "@/features/incidents/utils/format-incident-trip";
import type { AdminIncident } from "@/types/incidents.types";
import type { AdminTrip } from "@/types/trips.types";

export function incidentResolveSummaryLines(
  incident: AdminIncident,
  trip?: AdminTrip
): { label: string; value: string }[] {
  const tripDisplay = incident.relatedTripId
    ? formatIncidentTripDisplay(trip, incident.relatedTripId)
    : null;

  return [
    { label: "Type", value: getIncidentTypeLabel(incident.type) },
    { label: "Source", value: getIncidentSourceLabel(incident.source) },
    {
      label: "Trajet",
      value: tripDisplay
        ? trip
          ? `${tripDisplay.primary} · ${formatDate(trip.departureTime)}`
          : tripDisplay.primary
        : "—",
    },
  ];
}
