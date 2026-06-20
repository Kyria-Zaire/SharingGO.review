import type { BoardingFailureContext } from "@/types/boarding.types";
import type { CreateFieldIncidentBody } from "@/types/boarding-field-incident.types";
import {
  createFieldIncidentRequestId,
  deriveFieldIncidentFromReason,
} from "./field-incident-mapping";
import { resolveBoardingErrorMessage } from "./boarding-error-messages";
import type { BoardingValidationReason } from "@/types/boarding.types";

export interface ScanRejectedFieldIncidentInput {
  scannedToken: string;
  reason: BoardingValidationReason;
  context?: BoardingFailureContext;
  description?: string;
  relatedTripId?: string;
}

export interface FreeFieldIncidentInput {
  relatedTripId: string;
  type: CreateFieldIncidentBody["type"];
  severity: CreateFieldIncidentBody["severity"];
  description: string;
  title?: string;
}

export function buildScanRejectedFieldIncidentPayload(
  input: ScanRejectedFieldIncidentInput
): CreateFieldIncidentBody | null {
  const tripId = input.relatedTripId ?? input.context?.tripId;
  if (!tripId) return null;

  const derived = deriveFieldIncidentFromReason(input.reason);
  const errorMessage = resolveBoardingErrorMessage(input.reason);
  const tokenParsed = Boolean(input.context?.tripId);

  return {
    relatedTripId: tripId,
    relatedReservationId: input.context?.reservationId,
    description:
      input.description?.trim() ||
      `${errorMessage.title} — ${errorMessage.description}`.slice(0, 500),
    type: derived?.type,
    severity: derived?.severityFloor,
    boardingContext: {
      validateReason: input.reason,
      requestId: createFieldIncidentRequestId(),
      ...(tokenParsed ? { boardingToken: input.scannedToken } : {}),
    },
  };
}

export function buildFreeFieldIncidentPayload(
  input: FreeFieldIncidentInput
): CreateFieldIncidentBody {
  return {
    relatedTripId: input.relatedTripId,
    title: input.title?.trim() || "Signalement terrain",
    description: input.description.trim(),
    type: input.type,
    severity: input.severity,
  };
}
