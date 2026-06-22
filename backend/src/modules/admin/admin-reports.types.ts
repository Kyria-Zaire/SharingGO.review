import type { IncidentSeverity, IncidentType, PaymentType, TripLifecycleStatus } from "@prisma/client";

export interface ReportsPeriod {
  from: string;
  to: string;
}

export interface ReportsMeta {
  generatedAt: string;
  timezone: "Europe/Paris";
  limitations: string[];
}

export interface OperationsOverviewResponse {
  period: ReportsPeriod;
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalReservations: number;
  usedReservations: number;
  boardingRate: number;
  occupancyRate: number;
  totalRevenue: string;
  currency: string;
  totalIncidents: number;
  criticalIncidents: number;
  meta: ReportsMeta;
}

export interface OperationsTripReportRow {
  tripId: string;
  routeLabel: string;
  departureTime: string;
  lifecycleStatus: TripLifecycleStatus;
  occupiedSeats: number;
  usedSeats: number;
  noShowEstimated: number;
  incidentCount: number;
  revenueAmount: string;
  cancellationReason: string | null;
}

export interface OperationsTripsReportResponse {
  period: ReportsPeriod;
  trips: OperationsTripReportRow[];
  pagination: { total: number; limit: number; offset: number };
  meta: ReportsMeta;
}

export interface OperationsIncidentsAggregation {
  total: number;
  open: number;
  critical: number;
  byType: Partial<Record<IncidentType, number>>;
  bySeverity: Partial<Record<IncidentSeverity, number>>;
}

export interface OperationsIncidentReportItem {
  id: string;
  code: string;
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: string;
  source: string;
  relatedTripId: string | null;
  occurredAt: string;
  resolvedAt: string | null;
}

export interface OperationsIncidentsReportResponse {
  period: ReportsPeriod;
  aggregation: OperationsIncidentsAggregation;
  incidents: OperationsIncidentReportItem[];
  pagination: { total: number; limit: number; offset: number };
  meta: ReportsMeta;
}

export interface RevenueBucket {
  key: string;
  amount: string;
  paymentCount: number;
}

export interface OperationsRevenueReportResponse {
  period: ReportsPeriod;
  currency: string;
  totalAmount: string;
  totalPaymentCount: number;
  byType: Partial<Record<PaymentType, { amount: string; paymentCount: number }>>;
  byDay: RevenueBucket[];
  byWeek: RevenueBucket[];
  byMonth: RevenueBucket[];
  meta: ReportsMeta;
}

export type ReportExportKey = "trips" | "incidents" | "payments" | "summary";
