import { ZodError, type ZodType } from "zod";
import { AppError } from "./errors.js";

export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Validation failed";
      throw new AppError(message, 400, "VALIDATION_ERROR");
    }
    throw error;
  }
}

export function parseQuery<T>(schema: ZodType<T>, query: unknown): T {
  return parseBody(schema, query);
}
