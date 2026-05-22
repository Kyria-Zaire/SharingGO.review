import { PaymentStatus, PaymentType } from "@prisma/client";
import { z } from "zod";

export const createCheckoutSchema = z.object({
  pendingReservationId: z.string().trim().min(1, "pendingReservationId is required"),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

export const listPaymentsQuerySchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  type: z.nativeEnum(PaymentType).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;

export const paymentIdParamSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});
