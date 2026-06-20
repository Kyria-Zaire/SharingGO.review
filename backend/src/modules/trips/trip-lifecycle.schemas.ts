import { z } from "zod";

export const cancelTripSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "cancellation reason must be at least 10 characters"),
});

export type CancelTripInput = z.infer<typeof cancelTripSchema>;
