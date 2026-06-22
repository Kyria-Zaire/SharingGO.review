import { IncidentSeverity, IncidentStatus, IncidentType, TripLifecycleStatus } from "@prisma/client";
import { z } from "zod";

const isoDateTime = z.string().datetime({ message: "Invalid ISO datetime" });

export const MAX_REPORT_PERIOD_DAYS = 90;

const paginationSchema = {
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
};

function assertPeriodWithinMaxDays(from: string, to: string): boolean {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  const maxMs = MAX_REPORT_PERIOD_DAYS * 24 * 60 * 60 * 1000;
  return end - start <= maxMs;
}

function refineReportPeriod<T extends { from: string; to: string }>(schema: z.ZodType<T>) {
  return schema
    .refine((data) => new Date(data.from) < new Date(data.to), {
      message: "from must be before to",
      path: ["from"],
    })
    .refine((data) => assertPeriodWithinMaxDays(data.from, data.to), {
      message: `Period must not exceed ${MAX_REPORT_PERIOD_DAYS} days`,
      path: ["to"],
    });
}

const periodFields = {
  from: isoDateTime,
  to: isoDateTime,
  lineId: z.string().trim().min(1).optional(),
};

export const reportsPeriodQuerySchema = refineReportPeriod(z.object(periodFields));

export type ReportsPeriodQuery = z.infer<typeof reportsPeriodQuerySchema>;

export const reportsTripsQuerySchema = refineReportPeriod(
  z.object({
    ...periodFields,
    lifecycleStatus: z.nativeEnum(TripLifecycleStatus).optional(),
    ...paginationSchema,
  })
);

export type ReportsTripsQuery = z.infer<typeof reportsTripsQuerySchema>;

export const reportsIncidentsQuerySchema = refineReportPeriod(
  z.object({
    ...periodFields,
    type: z.nativeEnum(IncidentType).optional(),
    severity: z.nativeEnum(IncidentSeverity).optional(),
    status: z.nativeEnum(IncidentStatus).optional(),
    ...paginationSchema,
  })
);

export type ReportsIncidentsQuery = z.infer<typeof reportsIncidentsQuerySchema>;

export const reportsRevenueQuerySchema = reportsPeriodQuerySchema;
export type ReportsRevenueQuery = z.infer<typeof reportsRevenueQuerySchema>;

export const reportExportKeySchema = z.enum(["trips", "incidents", "payments", "summary"]);

export type ReportExportKeyParam = z.infer<typeof reportExportKeySchema>;
