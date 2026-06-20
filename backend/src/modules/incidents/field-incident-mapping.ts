import { IncidentSeverity, IncidentType } from "@prisma/client";
import { BOARDING_CONSUMPTION_REASONS } from "../boarding/boarding-consumption-reasons.js";

/**
 * Closed allow-list for field-incident boardingContext reasons.
 * Excludes BOARDING_ALREADY_USED — normal flow, no signalement (PRD §5.1.1).
 */
export const FIELD_INCIDENT_BOARDING_REASONS = [
  BOARDING_CONSUMPTION_REASONS.INVALID_TOKEN,
  BOARDING_CONSUMPTION_REASONS.EXPIRED_TOKEN,
  BOARDING_CONSUMPTION_REASONS.INVALID_TYPE,
  BOARDING_CONSUMPTION_REASONS.INVALID_PAYLOAD,
  BOARDING_CONSUMPTION_REASONS.RESERVATION_NOT_FOUND,
  BOARDING_CONSUMPTION_REASONS.TOKEN_REVOKED,
  BOARDING_CONSUMPTION_REASONS.RESERVATION_NOT_CONFIRMED,
  BOARDING_CONSUMPTION_REASONS.TRIP_DISABLED,
  BOARDING_CONSUMPTION_REASONS.BOARDING_WINDOW_EXPIRED,
  BOARDING_CONSUMPTION_REASONS.PAYMENT_NOT_SUCCEEDED,
  BOARDING_CONSUMPTION_REASONS.INTERNAL_VALIDATION_ERROR,
  BOARDING_CONSUMPTION_REASONS.INTERNAL_CONSUMPTION_ERROR,
] as const;

export type FieldIncidentBoardingReason = (typeof FIELD_INCIDENT_BOARDING_REASONS)[number];

export interface DerivedFieldIncident {
  title: string;
  type: IncidentType;
  severityFloor: IncidentSeverity;
}

const BOARDING_REASON_MAP: Record<FieldIncidentBoardingReason, DerivedFieldIncident> = {
  PAYMENT_NOT_SUCCEEDED: {
    title: "Paiement non validé — signalement terrain",
    type: IncidentType.PAYMENT,
    severityFloor: IncidentSeverity.HIGH,
  },
  INTERNAL_CONSUMPTION_ERROR: {
    title: "Erreur enregistrement embarquement",
    type: IncidentType.TECHNICAL,
    severityFloor: IncidentSeverity.HIGH,
  },
  INTERNAL_VALIDATION_ERROR: {
    title: "Erreur vérification billet",
    type: IncidentType.TECHNICAL,
    severityFloor: IncidentSeverity.HIGH,
  },
  TRIP_DISABLED: {
    title: "Trajet indisponible",
    type: IncidentType.TECHNICAL,
    severityFloor: IncidentSeverity.HIGH,
  },
  BOARDING_WINDOW_EXPIRED: {
    title: "Billet expiré",
    type: IncidentType.BOARDING,
    severityFloor: IncidentSeverity.MEDIUM,
  },
  EXPIRED_TOKEN: {
    title: "QR expiré",
    type: IncidentType.BOARDING,
    severityFloor: IncidentSeverity.MEDIUM,
  },
  TOKEN_REVOKED: {
    title: "Billet révoqué",
    type: IncidentType.BOARDING,
    severityFloor: IncidentSeverity.MEDIUM,
  },
  RESERVATION_NOT_FOUND: {
    title: "Billet introuvable",
    type: IncidentType.BOARDING,
    severityFloor: IncidentSeverity.MEDIUM,
  },
  INVALID_TOKEN: {
    title: "QR invalide",
    type: IncidentType.BOARDING,
    severityFloor: IncidentSeverity.MEDIUM,
  },
  INVALID_TYPE: {
    title: "QR invalide",
    type: IncidentType.BOARDING,
    severityFloor: IncidentSeverity.MEDIUM,
  },
  INVALID_PAYLOAD: {
    title: "QR invalide",
    type: IncidentType.BOARDING,
    severityFloor: IncidentSeverity.MEDIUM,
  },
  RESERVATION_NOT_CONFIRMED: {
    title: "Réservation non confirmée",
    type: IncidentType.BOARDING,
    severityFloor: IncidentSeverity.MEDIUM,
  },
};

const SEVERITY_RANK: Record<IncidentSeverity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export function deriveFromBoardingReason(
  reason: FieldIncidentBoardingReason | undefined
): DerivedFieldIncident | null {
  if (!reason) return null;
  return BOARDING_REASON_MAP[reason];
}

export function applySeverityFloor(
  requested: IncidentSeverity | undefined,
  floor: IncidentSeverity
): IncidentSeverity {
  if (!requested) return floor;
  return SEVERITY_RANK[requested] >= SEVERITY_RANK[floor] ? requested : floor;
}
