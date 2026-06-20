import type { HeuristicKind } from "@/types/incidents.types";

/** Aligné sur `mapHeuristicToIncident` backend (titres exploitables en dialog). */
export const HEURISTIC_KIND_LABELS: Record<HeuristicKind, string> = {
  near_departure: "Départ imminent",
  no_passengers: "Aucun passager",
  unknown_readiness: "Occupancy indisponible",
  no_boarding_activity: "Aucune activité boarding",
  full_not_boarded: "Trajet plein — passagers non embarqués",
  boarding_late: "Embarquement en retard",
};

export function getHeuristicKindLabel(kind: HeuristicKind): string {
  return HEURISTIC_KIND_LABELS[kind] ?? kind;
}
