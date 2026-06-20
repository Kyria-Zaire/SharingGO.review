import { IncidentSeverity, IncidentType } from "@prisma/client";
import { z } from "zod";
import { FIELD_INCIDENT_BOARDING_REASONS } from "../incidents/field-incident-mapping.js";

const fieldIncidentBoardingReasonSchema = z.enum(FIELD_INCIDENT_BOARDING_REASONS);

export const fieldIncidentBodySchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  type: z.nativeEnum(IncidentType).optional(),
  severity: z.nativeEnum(IncidentSeverity).optional(),
  relatedTripId: z.string().trim().min(1),
  relatedReservationId: z.string().trim().min(1).optional(),
  boardingContext: z
    .object({
      consumeReason: fieldIncidentBoardingReasonSchema.optional(),
      validateReason: fieldIncidentBoardingReasonSchema.optional(),
      requestId: z.string().trim().max(64).optional(),
      boardingToken: z.string().trim().min(1).optional(),
    })
    .optional(),
});

export type FieldIncidentBody = z.infer<typeof fieldIncidentBodySchema>;
