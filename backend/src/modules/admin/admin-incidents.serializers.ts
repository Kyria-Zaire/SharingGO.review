import type { Incident, User } from "@prisma/client";

type IncidentWithCreator = Incident & {
  creator: Pick<User, "id" | "email" | "firstName" | "lastName">;
};

export function serializeAdminIncident(incident: IncidentWithCreator) {
  return {
    id: incident.id,
    code: incident.code,
    title: incident.title,
    description: incident.description,
    type: incident.type,
    status: incident.status,
    severity: incident.severity,
    relatedReservationId: incident.relatedReservationId,
    relatedTripId: incident.relatedTripId,
    createdBy: incident.createdBy,
    createdAt: incident.createdAt.toISOString(),
    updatedAt: incident.updatedAt.toISOString(),
    resolvedAt: incident.resolvedAt?.toISOString() ?? null,
    resolution: incident.resolution,
    creator: {
      id: incident.creator.id,
      email: incident.creator.email,
      firstName: incident.creator.firstName,
      lastName: incident.creator.lastName,
    },
  };
}
