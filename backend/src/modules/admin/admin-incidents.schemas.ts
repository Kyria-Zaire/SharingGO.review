import {
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "@prisma/client";
import { z } from "zod";

const isoDateTime = z.string().datetime({ message: "Invalid ISO datetime" });

const paginationSchema = {
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
};

export const listAdminIncidentsQuerySchema = z
  .object({
    status: z.nativeEnum(IncidentStatus).optional(),
    type: z.nativeEnum(IncidentType).optional(),
    severity: z.nativeEnum(IncidentSeverity).optional(),
    from: isoDateTime.optional(),
    to: isoDateTime.optional(),
    ...paginationSchema,
  })
  .refine(
    (data) => {
      if (data.from && data.to) return new Date(data.from) < new Date(data.to);
      return true;
    },
    { message: "from must be before to", path: ["from"] }
  );

export type ListAdminIncidentsQuery = z.infer<typeof listAdminIncidentsQuerySchema>;

export const adminIncidentIdParamSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});

export const createAdminIncidentBodySchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  type: z.nativeEnum(IncidentType),
  severity: z.nativeEnum(IncidentSeverity),
  relatedReservationId: z.string().trim().min(1).optional(),
  relatedTripId: z.string().trim().min(1).optional(),
});

export type CreateAdminIncidentBody = z.infer<typeof createAdminIncidentBodySchema>;

export const patchAdminIncidentBodySchema = z
  .object({
    status: z.nativeEnum(IncidentStatus).optional(),
    severity: z.nativeEnum(IncidentSeverity).optional(),
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    resolution: z.string().trim().max(500).nullable().optional(),
    type: z.nativeEnum(IncidentType).optional(),
    relatedReservationId: z.string().trim().min(1).nullable().optional(),
    relatedTripId: z.string().trim().min(1).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type PatchAdminIncidentBody = z.infer<typeof patchAdminIncidentBodySchema>;

const localSeveritySchema = z.enum(["info", "warning", "critical"]);
const localStatusSchema = z.enum(["open", "resolved"]);
const localCategorySchema = z.enum([
  "boarding",
  "departure",
  "capacity",
  "payment",
  "system",
  "other",
]);

export const importLocalIncidentsBodySchema = z.object({
  incidents: z
    .array(
      z.object({
        incidentCode: z.string().trim().min(1),
        severity: localSeveritySchema,
        status: localStatusSchema,
        category: localCategorySchema,
        title: z.string().trim().min(1).max(120),
        description: z.string().trim().max(500).optional(),
        relatedTripId: z.string().trim().min(1).optional(),
        createdAt: isoDateTime.optional(),
        resolvedAt: isoDateTime.optional(),
      })
    )
    .min(1)
    .max(100),
});

export type ImportLocalIncidentsBody = z.infer<typeof importLocalIncidentsBodySchema>;

export const listActivityFeedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  severity: z.enum(["info", "warning", "critical"]).optional(),
  type: z.string().trim().min(1).optional(),
  from: isoDateTime.optional(),
  to: isoDateTime.optional(),
});

export type ListActivityFeedQuery = z.infer<typeof listActivityFeedQuerySchema>;
