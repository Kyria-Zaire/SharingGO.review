import { IncidentSeverity, IncidentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { mapDbSeverityToFeed } from "./admin-incidents.mappers.js";
import type { ListActivityFeedQuery } from "./admin-incidents.schemas.js";

export interface ActivityFeedEvent {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description?: string;
  timestamp: string;
  actorUserId?: string;
  actorName?: string;
  entityId?: string;
  entityType?: string;
}

const FETCH_CAP = 250;

function actorDisplayName(user: {
  email: string;
  firstName: string | null;
  lastName: string | null;
}): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.email;
}

function auditSeverity(action: string): ActivityFeedEvent["severity"] {
  if (
    action.includes("FAILED") ||
    action.includes("ERROR") ||
    action.includes("REJECTED")
  ) {
    return "critical";
  }
  if (
    action.includes("CANCELLED") ||
    action.includes("DISABLED") ||
    action.includes("WARNING")
  ) {
    return "warning";
  }
  return "info";
}

function auditTitle(action: string): string {
  return action.replaceAll("_", " ");
}

export async function listAdminActivityFeed(query: ListActivityFeedQuery) {
  const fromDate = query.from ? new Date(query.from) : undefined;
  const toDate = query.to ? new Date(query.to) : undefined;

  const dateFilter = fromDate || toDate ? { gte: fromDate, lte: toDate } : undefined;

  const [auditLogs, incidents] = await Promise.all([
    prisma.auditLog.findMany({
      where: dateFilter ? { createdAt: dateFilter } : undefined,
      include: {
        actorUser: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: FETCH_CAP,
    }),
    prisma.incident.findMany({
      where: dateFilter ? { createdAt: dateFilter } : undefined,
      include: {
        creator: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: FETCH_CAP,
    }),
  ]);

  const events: ActivityFeedEvent[] = [];

  for (const log of auditLogs) {
    events.push({
      id: `audit:${log.id}`,
      type: log.action,
      severity: auditSeverity(log.action),
      title: auditTitle(log.action),
      description:
        log.metadata && typeof log.metadata === "object"
          ? JSON.stringify(log.metadata).slice(0, 200)
          : undefined,
      timestamp: log.createdAt.toISOString(),
      actorUserId: log.actorUserId ?? undefined,
      actorName: log.actorUser ? actorDisplayName(log.actorUser) : undefined,
      entityId: log.targetId ?? undefined,
      entityType: log.targetType,
    });
  }

  for (const incident of incidents) {
    events.push({
      id: `incident:created:${incident.id}`,
      type: "INCIDENT_CREATED",
      severity: mapDbSeverityToFeed(incident.severity),
      title: `Incident ${incident.code}`,
      description: incident.title,
      timestamp: incident.createdAt.toISOString(),
      actorUserId: incident.createdBy,
      actorName: actorDisplayName(incident.creator),
      entityId: incident.id,
      entityType: "Incident",
    });

    if (
      incident.resolvedAt &&
      (incident.status === IncidentStatus.RESOLVED ||
        incident.status === IncidentStatus.CLOSED)
    ) {
      events.push({
        id: `incident:resolved:${incident.id}`,
        type: "INCIDENT_RESOLVED",
        severity:
          incident.severity === IncidentSeverity.CRITICAL ? "critical" : "info",
        title: `Incident ${incident.code} resolved`,
        description: incident.resolution ?? incident.title,
        timestamp: incident.resolvedAt.toISOString(),
        actorUserId: incident.createdBy,
        actorName: actorDisplayName(incident.creator),
        entityId: incident.id,
        entityType: "Incident",
      });
    }
  }

  let filtered = events;

  if (query.type) {
    filtered = filtered.filter((event) => event.type === query.type);
  }

  if (query.severity) {
    filtered = filtered.filter((event) => event.severity === query.severity);
  }

  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const slice = filtered.slice(query.offset, query.offset + query.limit);

  return {
    events: slice,
    limit: query.limit,
    offset: query.offset,
    total: filtered.length,
  };
}
