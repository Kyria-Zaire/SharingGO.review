import {
  PaymentStatus,
  PaymentType,
  ReservationStatus,
} from "@prisma/client";
import { z } from "zod";

const optionalQueryBoolean = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === "true"));

const isoDateTime = z.string().datetime({ message: "Invalid ISO datetime" });

const paginationSchema = {
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
};

function refineFromBeforeTo<T extends { from?: string; to?: string }>(schema: z.ZodType<T>) {
  return schema.refine(
    (data) => {
      if (data.from && data.to) {
        return new Date(data.from) < new Date(data.to);
      }
      return true;
    },
    { message: "from must be before to", path: ["from"] }
  );
}

export const listAdminReservationsQuerySchema = refineFromBeforeTo(
  z.object({
    status: z.nativeEnum(ReservationStatus).optional(),
    userId: z.string().trim().min(1).optional(),
    tripId: z.string().trim().min(1).optional(),
    lineId: z.string().trim().min(1).optional(),
    from: isoDateTime.optional(),
    to: isoDateTime.optional(),
    ...paginationSchema,
  })
);

export type ListAdminReservationsQuery = z.infer<typeof listAdminReservationsQuerySchema>;

export const adminIdParamSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});

export const listAdminPaymentsQuerySchema = refineFromBeforeTo(
  z.object({
    status: z.nativeEnum(PaymentStatus).optional(),
    type: z.nativeEnum(PaymentType).optional(),
    userId: z.string().trim().min(1).optional(),
    reservationId: z.string().trim().min(1).optional(),
    from: isoDateTime.optional(),
    to: isoDateTime.optional(),
    ...paginationSchema,
  })
);

export type ListAdminPaymentsQuery = z.infer<typeof listAdminPaymentsQuerySchema>;

export const listAdminPendingQuerySchema = z
  .object({
    active: optionalQueryBoolean,
    expired: optionalQueryBoolean,
    includeConsumed: optionalQueryBoolean,
    userId: z.string().trim().min(1).optional(),
    tripId: z.string().trim().min(1).optional(),
    ...paginationSchema,
  })
  .refine((data) => !(data.active === true && data.expired === true), {
    message: "active and expired cannot both be true",
    path: ["active"],
  });

export type ListAdminPendingQuery = z.infer<typeof listAdminPendingQuerySchema>;

export const cancelReservationBodySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type CancelReservationBody = z.infer<typeof cancelReservationBodySchema>;

export const adminTripIdParamSchema = z.object({
  id: z.string().trim().min(1, "trip id is required"),
});
