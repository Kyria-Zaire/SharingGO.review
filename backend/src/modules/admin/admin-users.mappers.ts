import type { User } from "@prisma/client";
import type { AdminUserSafe, AdminUserStatus } from "./admin-users.types.js";

type UserWithCreator = User & {
  createdBy?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

export function toAdminUserStatus(user: Pick<User, "deletedAt">): AdminUserStatus {
  return user.deletedAt != null ? "DISABLED" : "ACTIVE";
}

export function toAdminUserSafe(user: UserWithCreator): AdminUserSafe {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userType: user.userType,
    status: toAdminUserStatus(user),
    createdAt: user.createdAt.toISOString(),
    deletedAt: user.deletedAt?.toISOString() ?? null,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdByUserId: user.createdByUserId ?? null,
    createdBy: user.createdBy
      ? {
          id: user.createdBy.id,
          email: user.createdBy.email,
          firstName: user.createdBy.firstName,
          lastName: user.createdBy.lastName,
        }
      : null,
  };
}
