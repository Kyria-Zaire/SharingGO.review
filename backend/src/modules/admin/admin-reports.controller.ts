import type { Request, Response } from "express";
import { AppError } from "../../lib/errors.js";
import { parseQuery } from "../../lib/zod-parse.js";
import {
  buildIncidentsCsv,
  buildPaymentsCsv,
  buildSummaryCsv,
  buildTripsCsv,
  exportFilename,
} from "./admin-reports-csv.js";
import {
  reportExportKeySchema,
  reportsIncidentsQuerySchema,
  reportsPeriodQuerySchema,
  reportsRevenueQuerySchema,
  reportsTripsQuerySchema,
} from "./admin-reports.schemas.js";
import * as reportsService from "./admin-reports.service.js";
import type { ReportExportKey } from "./admin-reports.types.js";

function requireActorUserId(req: Request): string {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }
  return req.user.id;
}

function sendCsv(res: Response, filename: string, content: string): void {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(content);
}

export async function getOperationsOverviewHandler(
  req: Request,
  res: Response
): Promise<void> {
  const query = parseQuery(reportsPeriodQuerySchema, req.query);
  const result = await reportsService.getOperationsOverview(query);
  res.status(200).json(result);
}

export async function getOperationsTripsReportHandler(
  req: Request,
  res: Response
): Promise<void> {
  const query = parseQuery(reportsTripsQuerySchema, req.query);
  const result = await reportsService.getOperationsTripsReport(query);
  res.status(200).json(result);
}

export async function getOperationsIncidentsReportHandler(
  req: Request,
  res: Response
): Promise<void> {
  const query = parseQuery(reportsIncidentsQuerySchema, req.query);
  const result = await reportsService.getOperationsIncidentsReport(query);
  res.status(200).json(result);
}

export async function getOperationsRevenueReportHandler(
  req: Request,
  res: Response
): Promise<void> {
  const query = parseQuery(reportsRevenueQuerySchema, req.query);
  const result = await reportsService.getOperationsRevenueReport(query);
  res.status(200).json(result);
}

const EXPORT_HANDLERS: Record<
  ReportExportKey,
  (req: Request, res: Response, actorUserId: string) => Promise<void>
> = {
  trips: async (req, res, actorUserId) => {
    const query = parseQuery(reportsPeriodQuerySchema, req.query);
    const rows = await reportsService.getAllTripRowsForExport(query);
    const csv = buildTripsCsv(rows);
    await reportsService.auditReportExport(actorUserId, "trips", query, rows.length);
    sendCsv(res, exportFilename("trips", query.from, query.to), csv);
  },
  incidents: async (req, res, actorUserId) => {
    const query = parseQuery(reportsPeriodQuerySchema, req.query);
    const incidents = await reportsService.getAllIncidentsForExport(query);
    const csv = buildIncidentsCsv(incidents);
    await reportsService.auditReportExport(actorUserId, "incidents", query, incidents.length);
    sendCsv(res, exportFilename("incidents", query.from, query.to), csv);
  },
  payments: async (req, res, actorUserId) => {
    const query = parseQuery(reportsPeriodQuerySchema, req.query);
    const payments = await reportsService.getAllPaymentsForExport(query);
    const csv = buildPaymentsCsv(payments);
    await reportsService.auditReportExport(actorUserId, "payments", query, payments.length);
    sendCsv(res, exportFilename("payments", query.from, query.to), csv);
  },
  summary: async (req, res, actorUserId) => {
    const query = parseQuery(reportsPeriodQuerySchema, req.query);
    const overview = await reportsService.getOperationsOverview(query);
    const csv = buildSummaryCsv(overview);
    await reportsService.auditReportExport(actorUserId, "summary", query, 1);
    sendCsv(res, exportFilename("summary", query.from, query.to), csv);
  },
};

export async function exportReportCsvHandler(req: Request, res: Response): Promise<void> {
  const rawKey = req.params.reportKey ?? "";
  const normalizedKey = rawKey.replace(/\.csv$/i, "");
  const reportKey = reportExportKeySchema.parse(normalizedKey);
  const actorUserId = requireActorUserId(req);
  const handler = EXPORT_HANDLERS[reportKey];
  await handler(req, res, actorUserId);
}
