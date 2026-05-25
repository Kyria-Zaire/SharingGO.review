import { IncidentStatus, type Prisma } from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import {
  mapLocalCategoryToType,
  mapLocalSeverityToDb,
  mapLocalStatusToDb,
} from "./admin-incidents.mappers.js";
import { serializeAdminIncident } from "./admin-incidents.serializers.js";
import type {
  CreateAdminIncidentBody,
  ImportLocalIncidentsBody,
  ListAdminIncidentsQuery,
  PatchAdminIncidentBody,
} from "./admin-incidents.schemas.js";
import { generateNextIncidentCode } from "./incident-code.js";

const incidentInclude = {
  creator: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
} as const;

function buildWhere(query: ListAdminIncidentsQuery): Prisma.IncidentWhereInput {
  const where: Prisma.IncidentWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.severity) where.severity = query.severity;
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }
  return where;
}

export async function listAdminIncidents(query: ListAdminIncidentsQuery) {
  const incidents = await prisma.incident.findMany({
    where: buildWhere(query),
    include: incidentInclude,
    orderBy: [{ status: "asc" }, { severity: "desc" }, { createdAt: "desc" }],
    take: query.limit,
    skip: query.offset,
  });

  return {
    incidents: incidents.map(serializeAdminIncident),
    limit: query.limit,
    offset: query.offset,
  };
}

export async function getAdminIncident(incidentId: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: incidentInclude,
  });
  if (!incident) {
    throw new AppError("Incident not found", 404, "INCIDENT_NOT_FOUND");
  }
  return serializeAdminIncident(incident);
}

export async function createAdminIncident(
  body: CreateAdminIncidentBody,
  createdBy: string
) {
  const code = await generateNextIncidentCode();

  const incident = await prisma.incident.create({
    data: {
      code,
      title: body.title,
      description: body.description,
      type: body.type,
      severity: body.severity,
      status: IncidentStatus.OPEN,
      relatedReservationId: body.relatedReservationId,
      relatedTripId: body.relatedTripId,
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
    },
  });

  return serializeAdminIncident(incident);
}

export async function patchAdminIncident(
  incidentId: string,
  body: PatchAdminIncidentBody,
  actorUserId: string
) {
  const existing = await prisma.incident.findUnique({ where: { id: incidentId } });
  if (!existing) {
    throw new AppError("Incident not found", 404, "INCIDENT_NOT_FOUND");
  }

  const data: Prisma.IncidentUpdateInput = {};

  if (body.status !== undefined) data.status = body.status;
  if (body.severity !== undefined) data.severity = body.severity;
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.resolution !== undefined) data.resolution = body.resolution;
  if (body.type !== undefined) data.type = body.type;
  if (body.relatedReservationId !== undefined) {
    data.relatedReservationId = body.relatedReservationId;
  }
  if (body.relatedTripId !== undefined) data.relatedTripId = body.relatedTripId;

  if (body.status === IncidentStatus.RESOLVED || body.status === IncidentStatus.CLOSED) {
    data.resolvedAt = existing.resolvedAt ?? new Date();
  }

  if (body.status === IncidentStatus.OPEN || body.status === IncidentStatus.IN_PROGRESS) {
    data.resolvedAt = null;
  }

  const incident = await prisma.incident.update({
    where: { id: incidentId },
    data,
    include: incidentInclude,
  });

  if (
    body.status === IncidentStatus.RESOLVED &&
    existing.status !== IncidentStatus.RESOLVED
  ) {
    await writeAuditLog({
      actorUserId,
      action: "INCIDENT_RESOLVED",
      targetType: "Incident",
      targetId: incident.id,
      metadata: { code: incident.code },
    });
  }

  return serializeAdminIncident(incident);
}

/** V1: soft close — no physical delete */
export async function closeAdminIncident(incidentId: string, actorUserId: string) {
  return patchAdminIncident(
    incidentId,
    { status: IncidentStatus.CLOSED },
    actorUserId
  );
}

export async function importLocalIncidents(
  body: ImportLocalIncidentsBody,
  createdBy: string
) {
  const existingCodes = new Set(
    (
      await prisma.incident.findMany({
        where: { code: { in: body.incidents.map((i) => i.incidentCode) } },
        select: { code: true },
      })
    ).map((row: { code: string }) => row.code)
  );

  const created: ReturnType<typeof serializeAdminIncident>[] = [];
  const skipped: string[] = [];

  for (const local of body.incidents) {
    if (existingCodes.has(local.incidentCode)) {
      skipped.push(local.incidentCode);
      continue;
    }

    const status = mapLocalStatusToDb(local.status);
    const incident = await prisma.incident.create({
      data: {
        code: local.incidentCode,
        title: local.title,
        description: local.description,
        type: mapLocalCategoryToType(local.category),
        severity: mapLocalSeverityToDb(local.severity),
        status,
        relatedTripId: local.relatedTripId,
        createdBy,
        createdAt: local.createdAt ? new Date(local.createdAt) : undefined,
        resolvedAt:
          status === IncidentStatus.RESOLVED
            ? local.resolvedAt
              ? new Date(local.resolvedAt)
              : new Date()
            : undefined,
      },
      include: incidentInclude,
    });

    existingCodes.add(local.incidentCode);
    created.push(serializeAdminIncident(incident));
  }

  if (created.length > 0) {
    await writeAuditLog({
      actorUserId: createdBy,
      action: "INCIDENTS_IMPORTED",
      targetType: "Incident",
      metadata: { imported: created.length, skipped: skipped.length },
    });
  }

  return { imported: created, skipped, count: created.length };
}
