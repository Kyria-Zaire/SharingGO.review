import { z } from "zod";

const nonEmptyString = z
  .string()
  .trim()
  .min(1, "Must not be empty")
  .max(200, "Must be at most 200 characters");

export const createLineSchema = z.object({
  name: nonEmptyString,
  startCity: nonEmptyString,
  endCity: nonEmptyString,
});

export const updateLineSchema = createLineSchema.partial();

export type CreateLineInput = z.infer<typeof createLineSchema>;
export type UpdateLineInput = z.infer<typeof updateLineSchema>;
