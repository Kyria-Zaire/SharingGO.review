import type { Line, Trip, User } from "@prisma/client";

export type LineResponse = Line;

export type DriverSummary = Pick<User, "id" | "email" | "firstName" | "lastName" | "userType">;

export type TripWithRelations = Trip & {
  line: Line;
  driver: DriverSummary | null;
};
