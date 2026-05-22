import { z } from "zod";

const isoDateTime = z.string().datetime({ message: "Invalid ISO datetime" });

function validateTripTimes(
  data: { departureTime: Date; arrivalTime?: Date | null },
  ctx: z.RefinementCtx
): void {
  if (data.arrivalTime && data.arrivalTime <= data.departureTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "arrivalTime must be after departureTime",
      path: ["arrivalTime"],
    });
  }
}

const tripTimeFields = {
  departureTime: isoDateTime,
  arrivalTime: isoDateTime.nullable().optional(),
};

export const createTripSchema = z
  .object({
    lineId: z.string().trim().min(1, "lineId is required"),
    driverId: z.string().trim().min(1).nullable().optional(),
    ...tripTimeFields,
    totalSeats: z.number().int().min(1).max(8).optional().default(8),
  })
  .transform((data) => ({
    ...data,
    departureTime: new Date(data.departureTime),
    arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : null,
  }))
  .superRefine(validateTripTimes);

export const updateTripSchema = z
  .object({
    lineId: z.string().trim().min(1).optional(),
    driverId: z.string().trim().min(1).nullable().optional(),
    departureTime: isoDateTime.optional(),
    arrivalTime: isoDateTime.nullable().optional(),
    totalSeats: z.number().int().min(1).max(8).optional(),
  })
  .transform((data) => ({
    lineId: data.lineId,
    driverId: data.driverId,
    departureTime: data.departureTime ? new Date(data.departureTime) : undefined,
    arrivalTime:
      data.arrivalTime === undefined
        ? undefined
        : data.arrivalTime === null
          ? null
          : new Date(data.arrivalTime),
    totalSeats: data.totalSeats,
  }));

export const listTripsQuerySchema = z.object({
  lineId: z.string().trim().min(1).optional(),
  from: isoDateTime.optional(),
  to: isoDateTime.optional(),
  includeDisabled: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type ListTripsQuery = z.infer<typeof listTripsQuerySchema>;
