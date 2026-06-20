import {
  IncidentSeverity,
  IncidentSource,
  IncidentStatus,
  IncidentType,
  type Prisma,
} from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { generateNextIncidentCode } from "../admin/incident-code.js";
import { incidentInclude } from "../incidents/incident-include.js";
import { serializeAdminIncident } from "../admin/admin-incidents.serializers.js";
import {
  applySeverityFloor,
  deriveFromBoardingReason,
} from "../incidents/field-incident-mapping.js";
import {
  assertReservationOnTrip,
  assertTripExistsForIncident,
} from "../incidents/incident-relations.js";
import { incidentSourceRefSchema } from "../incidents/incident-source-ref.schema.js";
import { verifyBoardingToken } from "./boarding-jwt.js";
import { BoardingTokenVerificationError } from "./boarding.types.js";
import type { FieldIncidentBody } from "./field-incidents.schemas.js";

async function enrichFromBoardingToken(boardingToken: string): Promise<{
  reservationId: string;
  tripId: string;
}> {
  try {
    const payload = verifyBoardingToken(boardingToken);
    return { reservationId: payload.reservationId, tripId: payload.tripId };
  } catch (error) {
    if (error instanceof BoardingTokenVerificationError) {
      throw new AppError("Invalid boarding token", 400, "VALIDATION_ERROR");
    }
    throw error;
  }
}

export async function createFieldIncident(body: FieldIncidentBody, createdBy: string) {
  let relatedTripId = body.relatedTripId;
  let relatedReservationId = body.relatedReservationId;

  const boardingReason =
    body.boardingContext?.consumeReason ?? body.boardingContext?.validateReason;

  if (body.boardingContext?.boardingToken) {
    const enriched = await enrichFromBoardingToken(body.boardingContext.boardingToken);
    if (relatedReservationId && relatedReservationId !== enriched.reservationId) {
      throw new AppError("Reservation does not belong to trip", 409, "RESERVATION_TRIP_MISMATCH");
    }
    if (relatedTripId !== enriched.tripId) {
      throw new AppError("Reservation does not belong to trip", 409, "RESERVATION_TRIP_MISMATCH");
    }
    relatedReservationId = enriched.reservationId;
    relatedTripId = enriched.tripId;
  }

  const allowDisabledTrip = boardingReason === "TRIP_DISABLED";
  await assertTripExistsForIncident(relatedTripId, { allowDisabled: allowDisabledTrip });

  if (relatedReservationId) {
    await assertReservationOnTrip(relatedReservationId, relatedTripId);
  }

  const derived = deriveFromBoardingReason(boardingReason);
  const title = body.title?.trim() || derived?.title || "Signalement terrain";
  const type = body.type ?? derived?.type ?? IncidentType.OTHER;
  const severity = applySeverityFloor(
    body.severity,
    derived?.severityFloor ?? IncidentSeverity.MEDIUM
  );

  const sourceRef = incidentSourceRefSchema.parse({
    boardingReason,
    requestId: body.boardingContext?.requestId,
    kind: "boarding_field",
  });

  if (body.boardingContext?.requestId) {
    const duplicate = await prisma.incident.findFirst({
      where: {
        relatedTripId,
        status: { in: [IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS] },
        source: IncidentSource.BOARDING_FIELD,
        sourceRef: {
          path: ["requestId"],
          equals: body.boardingContext.requestId,
        },
      },
      select: { id: true, code: true },
    });
    if (duplicate) {
      throw new AppError(
        `Incident already reported (${duplicate.code})`,
        409,
        "INCIDENT_DUPLICATE"
      );
    }
  }

  const code = await generateNextIncidentCode();

  const incident = await prisma.incident.create({
    data: {
      code,
      title,
      description: body.description,
      type,
      severity,
      status: IncidentStatus.OPEN,
      source: IncidentSource.BOARDING_FIELD,
      sourceRef: sourceRef as Prisma.InputJsonValue,
      relatedTripId,
      relatedReservationId,
      createdBy,
    },
    include: incidentInclude,
  });

  await writeAuditLog({
    actorUserId: createdBy,
    action: "INCIDENT_CREATED",
    targetType: "Incident",
    targetId: incident.id,
    metadata: {
      code: incident.code,
      severity: incident.severity,
      type: incident.type,
      source: incident.source,
    },
  });

  return serializeAdminIncident(incident);
}
