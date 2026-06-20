import type { BoardingValidationReason } from "@/types/boarding.types";
import type {
  FieldIncidentBoardingReason,
  FieldIncidentSeverity,
  FieldIncidentType,
} from "@/types/boarding-field-incident.types";

export interface DerivedFieldIncidentUi {
  title: string;
  type: FieldIncidentType;
  severityFloor: FieldIncidentSeverity;
}

const BOARDING_REASON_MAP: Record<FieldIncidentBoardingReason, DerivedFieldIncidentUi> = {
  PAYMENT_NOT_SUCCEEDED: {
    title: "Paiement non validé — signalement terrain",
    type: "PAYMENT",
    severityFloor: "HIGH",
  },
  INTERNAL_CONSUMPTION_ERROR: {
    title: "Erreur enregistrement embarquement",
    type: "TECHNICAL",
    severityFloor: "HIGH",
  },
  INTERNAL_VALIDATION_ERROR: {
    title: "Erreur vérification billet",
    type: "TECHNICAL",
    severityFloor: "HIGH",
  },
  TRIP_DISABLED: {
    title: "Trajet indisponible",
    type: "TECHNICAL",
    severityFloor: "HIGH",
  },
  BOARDING_WINDOW_EXPIRED: {
    title: "Billet expiré",
    type: "BOARDING",
    severityFloor: "MEDIUM",
  },
  EXPIRED_TOKEN: {
    title: "QR expiré",
    type: "BOARDING",
    severityFloor: "MEDIUM",
  },
  TOKEN_REVOKED: {
    title: "Billet révoqué",
    type: "BOARDING",
    severityFloor: "MEDIUM",
  },
  RESERVATION_NOT_FOUND: {
    title: "Billet introuvable",
    type: "BOARDING",
    severityFloor: "MEDIUM",
  },
  INVALID_TOKEN: {
    title: "QR invalide",
    type: "BOARDING",
    severityFloor: "MEDIUM",
  },
  INVALID_TYPE: {
    title: "QR invalide",
    type: "BOARDING",
    severityFloor: "MEDIUM",
  },
  INVALID_PAYLOAD: {
    title: "QR invalide",
    type: "BOARDING",
    severityFloor: "MEDIUM",
  },
  RESERVATION_NOT_CONFIRMED: {
    title: "Réservation non confirmée",
    type: "BOARDING",
    severityFloor: "MEDIUM",
  },
};

export const FREE_FIELD_INCIDENT_TYPES: FieldIncidentType[] = [
  "BOARDING",
  "DELAY",
  "SAFETY",
  "BEHAVIOR",
  "TECHNICAL",
  "OTHER",
];

export const FIELD_INCIDENT_TYPE_LABELS: Record<FieldIncidentType, string> = {
  BOARDING: "Embarquement",
  CAPACITY: "Capacité",
  PAYMENT: "Paiement",
  NO_SHOW: "No-show",
  SAFETY: "Sécurité",
  DELAY: "Retard",
  TECHNICAL: "Technique",
  BEHAVIOR: "Comportement",
  OTHER: "Autre",
};

export const FIELD_INCIDENT_SEVERITY_LABELS: Record<FieldIncidentSeverity, string> = {
  LOW: "Faible",
  MEDIUM: "Moyenne",
  HIGH: "Élevée",
  CRITICAL: "Critique",
};

export function deriveFieldIncidentFromReason(
  reason: BoardingValidationReason | FieldIncidentBoardingReason
): DerivedFieldIncidentUi | null {
  return BOARDING_REASON_MAP[reason as FieldIncidentBoardingReason] ?? null;
}

/** Pas de signalement sur double scan / déjà embarqué (PRD OPS-02). */
export function canReportFieldIncidentFromScanReason(reason: string): boolean {
  return reason !== "BOARDING_ALREADY_USED" && reason !== "RESERVATION_NOT_CONFIRMED";
}

export function createFieldIncidentRequestId(): string {
  return `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
