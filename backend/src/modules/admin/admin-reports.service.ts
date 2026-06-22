import {
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  PaymentStatus,
  PaymentType,
  ReservationStatus,
  TripLifecycleStatus,
  type Prisma,
} from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { prisma } from "../../lib/prisma.js";
import type {
  ReportsIncidentsQuery,
  ReportsPeriodQuery,
  ReportsRevenueQuery,
  ReportsTripsQuery,
} from "./admin-reports.schemas.js";
import type {
  OperationsIncidentReportItem,
  OperationsIncidentsReportResponse,
  OperationsOverviewResponse,
  OperationsRevenueReportResponse,
  OperationsTripReportRow,
  OperationsTripsReportResponse,
  ReportExportKey,
  ReportsMeta,
  RevenueBucket,
} from "./admin-reports.types.js";

const REPORT_TIMEZONE = "Europe/Paris" as const;

const REPORT_LIMITATIONS = [
  "Occupancy : snapshot au moment de la requête (pas d'historique persisté).",
  "noShowEstimated : approximation (confirmedSeats si DEPARTED/COMPLETED).",
  "totalRevenue (overview) : paiements SUCCEEDED liés aux réservations des trajets de la période.",
  "Revenue report : agrégation par date de création paiement (Europe/Paris).",
] as const;

interface TripOccupancyBreakdown {
  confirmedSeats: number;
  usedSeats: number;
  activePendingSeats: number;
  occupiedSeats: number;
}

function buildMeta(): ReportsMeta {
  return {
    generatedAt: new Date().toISOString(),
    timezone: REPORT_TIMEZONE,
    limitations: [...REPORT_LIMITATIONS],
  };
}

function buildTripWhere(query: ReportsPeriodQuery): Prisma.TripWhereInput {
  const where: Prisma.TripWhereInput = {
    deletedAt: null,
    departureTime: {
      gte: new Date(query.from),
      lte: new Date(query.to),
    },
  };
  if (query.lineId) {
    where.lineId = query.lineId;
  }
  return where;
}

function roundRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

function formatAmount(value: number): string {
  return value.toFixed(2);
}

function isTripDeparted(trip: {
  lifecycleStatus: TripLifecycleStatus;
  departedAt: Date | null;
  completedAt: Date | null;
}): boolean {
  return (
    trip.lifecycleStatus === TripLifecycleStatus.DEPARTED ||
    trip.lifecycleStatus === TripLifecycleStatus.COMPLETED ||
    trip.departedAt != null ||
    trip.completedAt != null
  );
}

function estimateNoShow(
  trip: {
    lifecycleStatus: TripLifecycleStatus;
    departedAt: Date | null;
    completedAt: Date | null;
  },
  confirmedSeats: number
): number {
  if (!isTripDeparted(trip)) return 0;
  return Math.max(0, confirmedSeats);
}

async function getOccupancyBreakdownByTripIds(
  tripIds: string[]
): Promise<Map<string, TripOccupancyBreakdown>> {
  const map = new Map<string, TripOccupancyBreakdown>();
  if (tripIds.length === 0) return map;

  const now = new Date();
  for (const id of tripIds) {
    map.set(id, {
      confirmedSeats: 0,
      usedSeats: 0,
      activePendingSeats: 0,
      occupiedSeats: 0,
    });
  }

  const [confirmedGroups, usedGroups, pendingGroups] = await Promise.all([
    prisma.reservation.groupBy({
      by: ["tripId"],
      where: { tripId: { in: tripIds }, status: ReservationStatus.CONFIRMED },
      _count: { _all: true },
    }),
    prisma.reservation.groupBy({
      by: ["tripId"],
      where: { tripId: { in: tripIds }, status: ReservationStatus.USED },
      _count: { _all: true },
    }),
    prisma.pendingReservation.groupBy({
      by: ["tripId"],
      where: {
        tripId: { in: tripIds },
        expiresAt: { gt: now },
        consumedAt: null,
      },
      _count: { _all: true },
    }),
  ]);

  for (const group of confirmedGroups) {
    const entry = map.get(group.tripId);
    if (entry) entry.confirmedSeats = group._count._all;
  }
  for (const group of usedGroups) {
    const entry = map.get(group.tripId);
    if (entry) entry.usedSeats = group._count._all;
  }
  for (const group of pendingGroups) {
    const entry = map.get(group.tripId);
    if (entry) entry.activePendingSeats = group._count._all;
  }

  for (const entry of map.values()) {
    entry.occupiedSeats = entry.confirmedSeats + entry.usedSeats + entry.activePendingSeats;
  }

  return map;
}

async function getRevenueByTripIds(tripIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (tripIds.length === 0) return map;

  const payments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.SUCCEEDED,
      reservation: { tripId: { in: tripIds } },
    },
    select: {
      amount: true,
      reservation: { select: { tripId: true } },
    },
  });

  for (const payment of payments) {
    const tripId = payment.reservation?.tripId;
    if (!tripId) continue;
    map.set(tripId, (map.get(tripId) ?? 0) + Number(payment.amount));
  }

  return map;
}

async function getIncidentCountsByTripIds(tripIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (tripIds.length === 0) return map;

  const groups = await prisma.incident.groupBy({
    by: ["relatedTripId"],
    where: { relatedTripId: { in: tripIds } },
    _count: { _all: true },
  });

  for (const group of groups) {
    if (group.relatedTripId) {
      map.set(group.relatedTripId, group._count._all);
    }
  }

  return map;
}

async function fetchTripsInPeriod(query: ReportsPeriodQuery, extra?: Prisma.TripWhereInput) {
  return prisma.trip.findMany({
    where: { ...buildTripWhere(query), ...extra },
    include: { line: true },
    orderBy: { departureTime: "asc" },
  });
}

function parisDateParts(date: Date): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: REPORT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
  const month = Number(parts.find((p) => p.type === "month")?.value ?? "0");
  const day = Number(parts.find((p) => p.type === "day")?.value ?? "0");
  return { year, month, day };
}

function parisDayKey(date: Date): string {
  const { year, month, day } = parisDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parisMonthKey(date: Date): string {
  const { year, month } = parisDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}`;
}

function parisWeekKey(date: Date): string {
  const { year, month, day } = parisDateParts(date);
  const utc = new Date(Date.UTC(year, month - 1, day));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function aggregateRevenueBuckets(
  payments: Array<{ createdAt: Date; amount: Prisma.Decimal }>
): {
  byDay: RevenueBucket[];
  byWeek: RevenueBucket[];
  byMonth: RevenueBucket[];
} {
  const dayMap = new Map<string, { amount: number; count: number }>();
  const weekMap = new Map<string, { amount: number; count: number }>();
  const monthMap = new Map<string, { amount: number; count: number }>();

  const add = (map: Map<string, { amount: number; count: number }>, key: string, amount: number) => {
    const current = map.get(key) ?? { amount: 0, count: 0 };
    current.amount += amount;
    current.count += 1;
    map.set(key, current);
  };

  for (const payment of payments) {
    const amount = Number(payment.amount);
    add(dayMap, parisDayKey(payment.createdAt), amount);
    add(weekMap, parisWeekKey(payment.createdAt), amount);
    add(monthMap, parisMonthKey(payment.createdAt), amount);
  }

  const toBuckets = (map: Map<string, { amount: number; count: number }>): RevenueBucket[] =>
    [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        key,
        amount: formatAmount(value.amount),
        paymentCount: value.count,
      }));

  return {
    byDay: toBuckets(dayMap),
    byWeek: toBuckets(weekMap),
    byMonth: toBuckets(monthMap),
  };
}

function buildTripRow(
  trip: {
    id: string;
    departureTime: Date;
    lifecycleStatus: TripLifecycleStatus;
    departedAt: Date | null;
    completedAt: Date | null;
    cancellationReason: string | null;
    line: { startCity: string; endCity: string };
  },
  occupancy: TripOccupancyBreakdown,
  incidentCount: number,
  revenue: number
): OperationsTripReportRow {
  return {
    tripId: trip.id,
    routeLabel: `${trip.line.startCity} → ${trip.line.endCity}`,
    departureTime: trip.departureTime.toISOString(),
    lifecycleStatus: trip.lifecycleStatus,
    occupiedSeats: occupancy.occupiedSeats,
    usedSeats: occupancy.usedSeats,
    noShowEstimated: estimateNoShow(trip, occupancy.confirmedSeats),
    incidentCount,
    revenueAmount: formatAmount(revenue),
    cancellationReason: trip.cancellationReason,
  };
}

export async function getOperationsOverview(
  query: ReportsPeriodQuery
): Promise<OperationsOverviewResponse> {
  const trips = await fetchTripsInPeriod(query);
  const tripIds = trips.map((t) => t.id);

  const incidentWhere = {
    occurredAt: { gte: new Date(query.from), lte: new Date(query.to) },
  };

  const [occupancyMap, revenueMap, totalIncidents, criticalIncidents] = await Promise.all([
    getOccupancyBreakdownByTripIds(tripIds),
    getRevenueByTripIds(tripIds),
    prisma.incident.count({ where: incidentWhere }),
    prisma.incident.count({
      where: { ...incidentWhere, severity: IncidentSeverity.CRITICAL },
    }),
  ]);

  let totalReservations = 0;
  let usedReservations = 0;
  let totalCapacity = 0;
  let totalOccupied = 0;
  let totalRevenue = 0;

  for (const trip of trips) {
    const occ = occupancyMap.get(trip.id) ?? {
      confirmedSeats: 0,
      usedSeats: 0,
      activePendingSeats: 0,
      occupiedSeats: 0,
    };
    totalReservations += occ.confirmedSeats + occ.usedSeats;
    usedReservations += occ.usedSeats;
    totalCapacity += trip.totalSeats;
    totalOccupied += occ.occupiedSeats;
    totalRevenue += revenueMap.get(trip.id) ?? 0;
  }

  const completedTrips = trips.filter(
    (t) => t.lifecycleStatus === TripLifecycleStatus.COMPLETED
  ).length;
  const cancelledTrips = trips.filter(
    (t) => t.lifecycleStatus === TripLifecycleStatus.CANCELLED
  ).length;

  return {
    period: { from: query.from, to: query.to },
    totalTrips: trips.length,
    completedTrips,
    cancelledTrips,
    totalReservations,
    usedReservations,
    boardingRate: roundRate(usedReservations, totalReservations),
    occupancyRate: roundRate(totalOccupied, totalCapacity),
    totalRevenue: formatAmount(totalRevenue),
    currency: "eur",
    totalIncidents,
    criticalIncidents,
    meta: buildMeta(),
  };
}

export async function getOperationsTripsReport(
  query: ReportsTripsQuery
): Promise<OperationsTripsReportResponse> {
  const where: Prisma.TripWhereInput = buildTripWhere(query);
  if (query.lifecycleStatus) {
    where.lifecycleStatus = query.lifecycleStatus;
  }

  const [total, trips] = await Promise.all([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      include: { line: true },
      orderBy: { departureTime: "asc" },
      take: query.limit,
      skip: query.offset,
    }),
  ]);

  const tripIds = trips.map((t) => t.id);
  const [occupancyMap, revenueMap, incidentMap] = await Promise.all([
    getOccupancyBreakdownByTripIds(tripIds),
    getRevenueByTripIds(tripIds),
    getIncidentCountsByTripIds(tripIds),
  ]);

  const rows = trips.map((trip) => {
    const occ = occupancyMap.get(trip.id) ?? {
      confirmedSeats: 0,
      usedSeats: 0,
      activePendingSeats: 0,
      occupiedSeats: 0,
    };
    return buildTripRow(
      trip,
      occ,
      incidentMap.get(trip.id) ?? 0,
      revenueMap.get(trip.id) ?? 0
    );
  });

  return {
    period: { from: query.from, to: query.to },
    trips: rows,
    pagination: { total, limit: query.limit, offset: query.offset },
    meta: buildMeta(),
  };
}

export async function getOperationsIncidentsReport(
  query: ReportsIncidentsQuery
): Promise<OperationsIncidentsReportResponse> {
  const where: Prisma.IncidentWhereInput = {
    occurredAt: { gte: new Date(query.from), lte: new Date(query.to) },
  };
  if (query.type) where.type = query.type;
  if (query.severity) where.severity = query.severity;
  if (query.status) where.status = query.status;

  const [total, incidents, typeGroups, severityGroups, openCount, criticalCount] =
    await Promise.all([
      prisma.incident.count({ where }),
      prisma.incident.findMany({
        where,
        orderBy: { occurredAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.incident.groupBy({
        by: ["type"],
        where,
        _count: { _all: true },
      }),
      prisma.incident.groupBy({
        by: ["severity"],
        where,
        _count: { _all: true },
      }),
      prisma.incident.count({
        where: {
          ...where,
          status: { in: [IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS] },
        },
      }),
      prisma.incident.count({
        where: { ...where, severity: IncidentSeverity.CRITICAL },
      }),
    ]);

  const byType: Partial<Record<IncidentType, number>> = {};
  for (const group of typeGroups) {
    byType[group.type] = group._count._all;
  }

  const bySeverity: Partial<Record<IncidentSeverity, number>> = {};
  for (const group of severityGroups) {
    bySeverity[group.severity] = group._count._all;
  }

  const items: OperationsIncidentReportItem[] = incidents.map((incident) => ({
    id: incident.id,
    code: incident.code,
    title: incident.title,
    type: incident.type,
    severity: incident.severity,
    status: incident.status,
    source: incident.source,
    relatedTripId: incident.relatedTripId,
    occurredAt: incident.occurredAt.toISOString(),
    resolvedAt: incident.resolvedAt?.toISOString() ?? null,
  }));

  return {
    period: { from: query.from, to: query.to },
    aggregation: {
      total,
      open: openCount,
      critical: criticalCount,
      byType,
      bySeverity,
    },
    incidents: items,
    pagination: { total, limit: query.limit, offset: query.offset },
    meta: buildMeta(),
  };
}

export async function getOperationsRevenueReport(
  query: ReportsRevenueQuery
): Promise<OperationsRevenueReportResponse> {
  const payments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.SUCCEEDED,
      createdAt: { gte: new Date(query.from), lte: new Date(query.to) },
    },
    select: { createdAt: true, amount: true, type: true, currency: true },
    orderBy: { createdAt: "asc" },
  });

  let totalAmount = 0;
  const byType: Partial<Record<PaymentType, { amount: number; paymentCount: number }>> = {};

  for (const payment of payments) {
    const amount = Number(payment.amount);
    totalAmount += amount;
    const bucket = byType[payment.type] ?? { amount: 0, paymentCount: 0 };
    bucket.amount += amount;
    bucket.paymentCount += 1;
    byType[payment.type] = bucket;
  }

  const buckets = aggregateRevenueBuckets(payments);

  const byTypeFormatted: OperationsRevenueReportResponse["byType"] = {};
  for (const [type, value] of Object.entries(byType)) {
    byTypeFormatted[type as PaymentType] = {
      amount: formatAmount(value.amount),
      paymentCount: value.paymentCount,
    };
  }

  return {
    period: { from: query.from, to: query.to },
    currency: payments[0]?.currency ?? "eur",
    totalAmount: formatAmount(totalAmount),
    totalPaymentCount: payments.length,
    byType: byTypeFormatted,
    byDay: buckets.byDay,
    byWeek: buckets.byWeek,
    byMonth: buckets.byMonth,
    meta: buildMeta(),
  };
}

export async function getAllTripRowsForExport(
  query: ReportsPeriodQuery
): Promise<OperationsTripReportRow[]> {
  const trips = await fetchTripsInPeriod(query);
  const tripIds = trips.map((t) => t.id);
  const [occupancyMap, revenueMap, incidentMap] = await Promise.all([
    getOccupancyBreakdownByTripIds(tripIds),
    getRevenueByTripIds(tripIds),
    getIncidentCountsByTripIds(tripIds),
  ]);

  return trips.map((trip) => {
    const occ = occupancyMap.get(trip.id) ?? {
      confirmedSeats: 0,
      usedSeats: 0,
      activePendingSeats: 0,
      occupiedSeats: 0,
    };
    return buildTripRow(
      trip,
      occ,
      incidentMap.get(trip.id) ?? 0,
      revenueMap.get(trip.id) ?? 0
    );
  });
}

export async function getAllIncidentsForExport(
  query: ReportsPeriodQuery
): Promise<OperationsIncidentReportItem[]> {
  const incidents = await prisma.incident.findMany({
    where: {
      occurredAt: { gte: new Date(query.from), lte: new Date(query.to) },
    },
    orderBy: { occurredAt: "desc" },
  });

  return incidents.map((incident) => ({
    id: incident.id,
    code: incident.code,
    title: incident.title,
    type: incident.type,
    severity: incident.severity,
    status: incident.status,
    source: incident.source,
    relatedTripId: incident.relatedTripId,
    occurredAt: incident.occurredAt.toISOString(),
    resolvedAt: incident.resolvedAt?.toISOString() ?? null,
  }));
}

export async function getAllPaymentsForExport(query: ReportsPeriodQuery) {
  return prisma.payment.findMany({
    where: {
      status: PaymentStatus.SUCCEEDED,
      createdAt: { gte: new Date(query.from), lte: new Date(query.to) },
    },
    select: {
      id: true,
      createdAt: true,
      amount: true,
      currency: true,
      status: true,
      type: true,
      userId: true,
      reservationId: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function auditReportExport(
  actorUserId: string,
  reportKey: ReportExportKey,
  query: ReportsPeriodQuery,
  rowCount: number
): Promise<void> {
  await writeAuditLog({
    actorUserId,
    action: "REPORT_EXPORTED",
    targetType: "Report",
    targetId: reportKey,
    metadata: {
      reportKey,
      from: query.from,
      to: query.to,
      rowCount,
      lineId: query.lineId,
    },
  });
}
