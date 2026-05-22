import { z } from "zod";

export const createCheckoutSchema = z.object({
  pendingReservationId: z.string().trim().min(1, "pendingReservationId is required"),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
