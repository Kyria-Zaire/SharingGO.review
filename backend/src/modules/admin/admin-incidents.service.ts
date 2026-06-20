import {
  IncidentClosedReason,
  IncidentSource,
  IncidentStatus,
  type Prisma,
} from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import {
  assertReservationOnTrip,
  assertTripExistsForIncident,
} from "../incidents/incident-relations.js";
import { incidentSourceRefSchema } from "../incidents/incident-source-ref.schema.js";
import { mapHeuristicToIncident } from "../incidents/promote-heuristic-mapping.js";
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
  PromoteHeuristicBody,
} from "./admin-incidents.schemas.js";
import { generateNextIncidentCode } from "./incident-code.js";

import { incidentInclude } from "../incidents/incident-include.js";
function buildWhere(query: ListAdminIncidentsQuery): Prisma.IncidentWhereInput {
  const where: Prisma.IncidentWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.severity) where.severity = query.severity;
  if (query.source) where.source = query.source;
  if (query.relatedTripId) where.relatedTripId = query.relatedTripId;
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
  if (body.relatedTripId) {
    await assertTripExistsForIncident(body.relatedTripId, { allowDisabled: true });
  }
  if (body.relatedReservationId && body.relatedTripId) {
    await assertReservationOnTrip(body.relatedReservationId, body.relatedTripId);
  }

  const source = body.source ?? IncidentSource.MANUAL;
  const sourceRef = body.sourceRef
    ? incidentSourceRefSchema.parse(body.sourceRef)
    : undefined;

  const code = await generateNextIncidentCode();

  const incident = await prisma.incident.create({
    data: {
      code,
      title: body.title,
      description: body.description,
      type: body.type,
      severity: body.severity,
      status: IncidentStatus.OPEN,
      source,
      sourceRef: sourceRef as Prisma.InputJsonValue | undefined,
      occurredAt: body.occurredAt ? new Date(body.occurredAt) : undefined,
      relatedReservationId: body.relatedReservationId,
      relatedTripId: body.relatedTripId,
      assignedToUserId: body.assignedToUserId,
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

export async function patchAdminIncident(
  incidentId: string,
  body: PatchAdminIncidentBody,
  actorUserId: string
) {
  const existing = await prisma.incident.findUnique({ where: { id: incidentId } });
  if (!existing) {
    throw new AppError("Incident not found", 404, "INCIDENT_NOT_FOUND");
  }

  if (
    body.status === IncidentStatus.RESOLVED &&
    existing.status !== IncidentStatus.RESOLVED
  ) {
    const resolution = body.resolution ?? existing.resolution;
    if (!resolution || resolution.trim().length < 10) {
      throw new AppError(
        "Resolution is required when resolving an incident",
        400,
        "RESOLUTION_REQUIRED"
      );
    }
  }

  if (body.relatedTripId) {
    await assertTripExistsForIncident(body.relatedTripId, { allowDisabled: true });
  }
  if (body.relatedReservationId && (body.relatedTripId ?? existing.relatedTripId)) {
    await assertReservationOnTrip(
      body.relatedReservationId,
      body.relatedTripId ?? existing.relatedTripId!
    );
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
  if (body.closedReason !== undefined) data.closedReason = body.closedReason;
  if (body.assignedToUserId !== undefined) {
    data.assignee =
      body.assignedToUserId === null
        ? { disconnect: true }
        : { connect: { id: body.assignedToUserId } };
  }

  if (body.status === IncidentStatus.RESOLVED || body.status === IncidentStatus.CLOSED) {
    data.resolvedAt = existing.resolvedAt ?? new Date();
  }

  if (body.status === IncidentStatus.RESOLVED && existing.status !== IncidentStatus.RESOLVED) {
    data.resolver = { connect: { id: actorUserId } };
    if (body.resolution !== undefined) {
      data.resolution = body.resolution;
    }
  }

  if (body.status === IncidentStatus.CLOSED) {
    data.closedReason = body.closedReason ?? existing.closedReason ?? IncidentClosedReason.FIXED;
  }

  if (body.status === IncidentStatus.OPEN || body.status === IncidentStatus.IN_PROGRESS) {
    data.resolvedAt = null;
    data.resolver = { disconnect: true };
    data.closedReason = null;
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

  if (body.status === IncidentStatus.CLOSED && existing.status !== IncidentStatus.CLOSED) {
    await writeAuditLog({
      actorUserId,
      action: "INCIDENT_CLOSED",
      targetType: "Incident",
      targetId: incident.id,
      metadata: { code: incident.code, closedReason: incident.closedReason },
    });
  }

  return serializeAdminIncident(incident);
}

/** V1: soft close — no physical delete */
export async function closeAdminIncident(incidentId: string, actorUserId: string) {
  return patchAdminIncident(
    incidentId,
    { status: IncidentStatus.CLOSED, closedReason: IncidentClosedReason.FIXED },
    actorUserId
  );
}

export async function promoteHeuristicIncident(
  body: PromoteHeuristicBody,
  createdBy: string
) {
  await assertTripExistsForIncident(body.relatedTripId, { allowDisabled: true });

  const mapped = mapHeuristicToIncident(body.heuristicKind);
  const severity = body.severity ?? mapped.severity;

  const existing = await prisma.incident.findFirst({
    where: {
      relatedTripId: body.relatedTripId,
      status: { in: [IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS] },
      source: IncidentSource.DEPARTURE_HEURISTIC,
      sourceRef: {
        path: ["heuristicId"],
        equals: body.heuristicKind,
      },
    },
    select: { id: true, code: true },
  });

  if (existing) {
    throw new AppError(
      `Incident already open for heuristic (${existing.code})`,
      409,
      "INCIDENT_DUPLICATE"
    );
  }

  const sourceRef = incidentSourceRefSchema.parse({
    heuristicId: body.heuristicKind,
    kind: "departure_heuristic",
  });

  const code = await generateNextIncidentCode();

  const incident = await prisma.incident.create({
    data: {
      code,
      title: mapped.title,
      description: body.description,
      type: mapped.type,
      severity,
      status: IncidentStatus.OPEN,
      source: IncidentSource.DEPARTURE_HEURISTIC,
      sourceRef: sourceRef as Prisma.InputJsonValue,
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
      source: incident.source,
      heuristicKind: body.heuristicKind,
    },
  });

  return serializeAdminIncident(incident);
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
        source: IncidentSource.MANUAL,
        relatedTripId: local.relatedTripId,
        createdBy,
        createdAt: local.createdAt ? new Date(local.createdAt) : undefined,
        occurredAt: local.createdAt ? new Date(local.createdAt) : undefined,
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
