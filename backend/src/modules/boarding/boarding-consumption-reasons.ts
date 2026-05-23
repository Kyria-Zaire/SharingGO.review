import { BOARDING_VALIDATION_REASONS } from "./boarding-validation-reasons.js";

/** Reasons for POST /api/boarding/consume (S2-T3) — includes validation + consumption. */
export const BOARDING_CONSUMPTION_REASONS = {
  ...BOARDING_VALIDATION_REASONS,
  BOARDING_ALREADY_USED: "BOARDING_ALREADY_USED",
  INTERNAL_CONSUMPTION_ERROR: "INTERNAL_CONSUMPTION_ERROR",
} as const;

export type BoardingConsumptionReason =
  (typeof BOARDING_CONSUMPTION_REASONS)[keyof typeof BOARDING_CONSUMPTION_REASONS];
