import { ReservationStatus } from "@prisma/client";
import { z } from "zod";

export const createPendingReservationSchema = z.object({
  tripId: z.string().trim().min(1, "tripId is required"),
});

export type CreatePendingReservationInput = z.infer<typeof createPendingReservationSchema>;

const optionalQueryBoolean = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === "true"));

export const listReservationsQuerySchema = z
  .object({
    status: z.nativeEnum(ReservationStatus).optional(),
    upcoming: optionalQueryBoolean,
    past: optionalQueryBoolean,
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
    offset: z.coerce.number().int().min(0).optional().default(0),
  })
  .refine((data) => !(data.upcoming === true && data.past === true), {
    message: "upcoming and past cannot both be true",
    path: ["upcoming"],
  });

export type ListReservationsQuery = z.infer<typeof listReservationsQuerySchema>;

export const reservationIdParamSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});
