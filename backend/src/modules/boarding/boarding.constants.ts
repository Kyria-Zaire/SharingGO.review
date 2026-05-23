import { UserType } from "@prisma/client";

/** Grace period after scheduled departure during which boarding JWT remains valid. */
export const BOARDING_GRACE_MS = 10 * 60 * 1000;

export const BOARDING_JWT_TYP = "boarding" as const;

/** Roles allowed to validate/consume boarding tokens on the field (S2-T7). */
export const BOARDING_FIELD_SCAN_ROLES = [
  UserType.ADMIN,
  UserType.SUPER_ADMIN,
  UserType.DRIVER,
] as const satisfies readonly UserType[];
