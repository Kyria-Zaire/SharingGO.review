import type { IncidentCategory } from "@/types/incidents.types";

export const INCIDENT_CATEGORY_LABELS: Record<IncidentCategory, string> = {
  boarding: "Boarding",
  departure: "Departure",
  capacity: "Capacity",
  payment: "Payment",
  system: "System",
  other: "Other",
};
