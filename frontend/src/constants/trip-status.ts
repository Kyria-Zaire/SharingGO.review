import type { TripUiStatus } from "@/types/trips.types";

export const TRIP_UI_STATUS_LABELS: Record<TripUiStatus, string> = {
  active: "Actif",
  disabled: "Désactivé",
  full: "Complet",
  past: "Passé",
  upcoming: "À venir",
};
