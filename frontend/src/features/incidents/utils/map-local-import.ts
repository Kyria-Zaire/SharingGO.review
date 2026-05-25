import type { ImportLocalIncidentPayload } from "@/types/incidents.types";

interface LegacyLocalIncident {
  incidentCode: string;
  severity: "info" | "warning" | "critical";
  status: "open" | "resolved";
  category: ImportLocalIncidentPayload["category"];
  title: string;
  description?: string;
  relatedTripId?: string;
  createdAt?: string;
  resolvedAt?: string;
}

export function parseLegacyLocalIncidents(raw: unknown): LegacyLocalIncident[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is LegacyLocalIncident => {
    if (!item || typeof item !== "object") return false;
    const row = item as LegacyLocalIncident;
    return (
      typeof row.incidentCode === "string" &&
      typeof row.title === "string" &&
      typeof row.severity === "string" &&
      typeof row.status === "string" &&
      typeof row.category === "string"
    );
  });
}

export function toImportPayload(legacy: LegacyLocalIncident[]): ImportLocalIncidentPayload[] {
  return legacy.map((item) => ({
    incidentCode: item.incidentCode,
    severity: item.severity,
    status: item.status,
    category: item.category,
    title: item.title,
    description: item.description,
    relatedTripId: item.relatedTripId,
    createdAt: item.createdAt,
    resolvedAt: item.resolvedAt,
  }));
}
