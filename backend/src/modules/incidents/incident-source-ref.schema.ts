import { z } from "zod";

const FORBIDDEN_SOURCE_REF_PATTERN = /jwt|email|stripepaymentintent/i;

export const incidentSourceRefSchema = z
  .object({
    kind: z.string().trim().max(64).optional(),
    heuristicId: z.string().trim().max(64).optional(),
    boardingReason: z.string().trim().max(64).optional(),
    requestId: z.string().trim().max(64).optional(),
    auditLogId: z.string().trim().max(64).optional(),
    suggestedFrom: z.enum(["activity_feed"]).optional(),
  })
  .strict()
  .refine((value) => !FORBIDDEN_SOURCE_REF_PATTERN.test(JSON.stringify(value)), {
    message: "Forbidden keys in sourceRef",
  });

export type IncidentSourceRef = z.infer<typeof incidentSourceRefSchema>;
