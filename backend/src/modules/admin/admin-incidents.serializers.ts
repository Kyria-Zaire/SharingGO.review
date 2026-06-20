import type { Incident, User } from "@prisma/client";

type IncidentUserPick = Pick<User, "id" | "email" | "firstName" | "lastName">;

type IncidentWithRelations = Incident & {
  creator: IncidentUserPick;
  resolver?: IncidentUserPick | null;
  assignee?: IncidentUserPick | null;
};

function serializeIncidentUser(user: IncidentUserPick | null | undefined) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export function serializeAdminIncident(incident: IncidentWithRelations) {
  return {
    id: incident.id,
    code: incident.code,
    title: incident.title,
    description: incident.description,
    type: incident.type,
    status: incident.status,
    severity: incident.severity,
    source: incident.source,
    sourceRef: incident.sourceRef,
    occurredAt: incident.occurredAt.toISOString(),
    closedReason: incident.closedReason,
    relatedReservationId: incident.relatedReservationId,
    relatedTripId: incident.relatedTripId,
    createdBy: incident.createdBy,
    assignedToUserId: incident.assignedToUserId,
    resolvedByUserId: incident.resolvedByUserId,
    createdAt: incident.createdAt.toISOString(),
    updatedAt: incident.updatedAt.toISOString(),
    resolvedAt: incident.resolvedAt?.toISOString() ?? null,
    resolution: incident.resolution,
    creator: serializeIncidentUser(incident.creator)!,
    resolver: serializeIncidentUser(incident.resolver),
    assignee: serializeIncidentUser(incident.assignee),
  };
}
