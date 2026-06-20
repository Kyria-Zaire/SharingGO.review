import { IncidentSeverity, IncidentType } from "@prisma/client";

export const HEURISTIC_KINDS = [
  "near_departure",
  "no_passengers",
  "unknown_readiness",
  "no_boarding_activity",
  "full_not_boarded",
  "boarding_late",
] as const;

export type HeuristicKind = (typeof HEURISTIC_KINDS)[number];

export function mapHeuristicToIncident(kind: HeuristicKind): {
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
} {
  switch (kind) {
    case "full_not_boarded":
      return {
        type: IncidentType.CAPACITY,
        severity: IncidentSeverity.HIGH,
        title: "Trajet plein — passagers non embarqués",
      };
    case "no_boarding_activity":
      return {
        type: IncidentType.CAPACITY,
        severity: IncidentSeverity.HIGH,
        title: "Aucune activité boarding",
      };
    case "boarding_late":
      return {
        type: IncidentType.DELAY,
        severity: IncidentSeverity.MEDIUM,
        title: "Embarquement en retard",
      };
    case "unknown_readiness":
      return {
        type: IncidentType.TECHNICAL,
        severity: IncidentSeverity.MEDIUM,
        title: "Occupancy indisponible",
      };
    case "near_departure":
      return {
        type: IncidentType.DELAY,
        severity: IncidentSeverity.LOW,
        title: "Départ imminent",
      };
    case "no_passengers":
      return {
        type: IncidentType.OTHER,
        severity: IncidentSeverity.LOW,
        title: "Aucun passager",
      };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
