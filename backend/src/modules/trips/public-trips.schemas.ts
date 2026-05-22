import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");
const isoDateTime = z.string().datetime({ message: "Invalid ISO datetime" });

export const listPublicTripsQuerySchema = z
  .object({
    lineId: z.string().trim().min(1).optional(),
    date: dateOnly.optional(),
    from: isoDateTime.optional(),
    to: isoDateTime.optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
    offset: z.coerce.number().int().min(0).optional().default(0),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return new Date(data.from) < new Date(data.to);
      }
      return true;
    },
    { message: "from must be before to", path: ["from"] }
  );

export type ListPublicTripsQuery = z.infer<typeof listPublicTripsQuerySchema>;
