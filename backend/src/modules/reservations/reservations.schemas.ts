import { z } from "zod";

export const createPendingReservationSchema = z.object({
  tripId: z.string().trim().min(1, "tripId is required"),
});

export type CreatePendingReservationInput = z.infer<typeof createPendingReservationSchema>;
