import { z } from "zod";

export const boardingReservationIdParamSchema = z.object({
  reservationId: z.string().trim().min(1, "reservationId is required"),
});
