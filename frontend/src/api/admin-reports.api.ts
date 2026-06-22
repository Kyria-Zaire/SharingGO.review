import { env } from "@/lib/env";
import { buildQuery } from "@/lib/build-query";
import { ApiError } from "@/api/http";
import type {
  OperationsIncidentsReportResponse,
  OperationsOverviewResponse,
  OperationsRevenueReportResponse,
  OperationsTripsReportResponse,
  ReportExportKey,
  ReportsIncidentsFilters,
  ReportsPeriod,
  ReportsTripsFilters,
} from "@/types/reports.types";
import { http } from "./http";

function periodQuery(period: ReportsPeriod) {
  return buildQuery({
    from: period.from,
    to: period.to,
  });
}

export async function fetchOperationsOverview(
  period: ReportsPeriod
): Promise<OperationsOverviewResponse> {
  return http<OperationsOverviewResponse>(
    `/api/admin/reports/operations/overview${periodQuery(period)}`
  );
}

export async function fetchOperationsTripsReport(
  period: ReportsPeriod,
  filters: ReportsTripsFilters
): Promise<OperationsTripsReportResponse> {
  const query = buildQuery({
    from: period.from,
    to: period.to,
    lifecycleStatus: filters.lifecycleStatus,
    limit: String(filters.limit),
    offset: String(filters.offset),
  });
  return http<OperationsTripsReportResponse>(`/api/admin/reports/operations/trips${query}`);
}

export async function fetchOperationsIncidentsReport(
  period: ReportsPeriod,
  filters: ReportsIncidentsFilters
): Promise<OperationsIncidentsReportResponse> {
  const query = buildQuery({
    from: period.from,
    to: period.to,
    status: filters.status,
    type: filters.type,
    severity: filters.severity,
    limit: String(filters.limit),
    offset: String(filters.offset),
  });
  return http<OperationsIncidentsReportResponse>(
    `/api/admin/reports/operations/incidents${query}`
  );
}

export async function fetchOperationsRevenueReport(
  period: ReportsPeriod
): Promise<OperationsRevenueReportResponse> {
  return http<OperationsRevenueReportResponse>(
    `/api/admin/reports/operations/revenue${periodQuery(period)}`
  );
}

function parseContentDispositionFilename(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const match = /filename="([^"]+)"/i.exec(header);
  return match?.[1] ?? fallback;
}

export async function downloadReportCsv(
  key: ReportExportKey,
  period: ReportsPeriod
): Promise<{ blob: Blob; filename: string }> {
  const query = periodQuery(period);
  const response = await fetch(`${env.apiUrl}/api/admin/reports/export/${key}.csv${query}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const body = data as { error?: { message?: string; code?: string; requestId?: string } } | null;
    throw new ApiError(
      body?.error?.message ?? "Export failed",
      response.status,
      body?.error?.code ?? "EXPORT_FAILED",
      body?.error?.requestId ?? "unknown"
    );
  }

  const blob = await response.blob();
  const filename = parseContentDispositionFilename(
    response.headers.get("content-disposition"),
    `${key}-${period.from.slice(0, 10)}_${period.to.slice(0, 10)}.csv`
  );

  return { blob, filename };
}
