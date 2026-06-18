import { UserType } from "@prisma/client";
import { z } from "zod";

const adminAssignableRoles = [
  UserType.SUPER_ADMIN,
  UserType.ADMIN,
  UserType.DRIVER,
  UserType.CONVOYEUR,
] as const;

export const adminAssignableUserTypeSchema = z.enum(adminAssignableRoles);

const queryBoolean = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");

export const listAdminUsersQuerySchema = z.object({
  role: adminAssignableUserTypeSchema.optional(),
  email: z.string().trim().min(1).optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  /** Par défaut false : seuls les comptes actifs (deletedAt null). */
  includeDisabled: queryBoolean,
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;

export const adminUserIdParamSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});

export const createAdminUserBodySchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  userType: adminAssignableUserTypeSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateAdminUserBody = z.infer<typeof createAdminUserBodySchema>;

export const patchAdminUserRoleBodySchema = z.object({
  userType: adminAssignableUserTypeSchema,
});

export type PatchAdminUserRoleBody = z.infer<typeof patchAdminUserRoleBodySchema>;
