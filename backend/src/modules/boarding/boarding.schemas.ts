import { z } from "zod";

export const boardingReservationIdParamSchema = z.object({
  reservationId: z.string().trim().min(1, "reservationId is required"),
});

export const validateBoardingTokenBodySchema = z.object({
  boardingToken: z.string().trim().min(1, "boardingToken is required"),
});

export type ValidateBoardingTokenBody = z.infer<typeof validateBoardingTokenBodySchema>;
