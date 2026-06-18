import { Prisma, UserType, type User } from "@prisma/client";
import { AppError } from "../../lib/errors.js";
import { hashPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import { writeAuditLog } from "../../lib/audit-log.js";
import { normalizeEmail } from "../auth/auth.utils.js";
import { toAdminUserSafe } from "./admin-users.mappers.js";
import type {
  CreateAdminUserBody,
  ListAdminUsersQuery,
  PatchAdminUserRoleBody,
} from "./admin-users.schemas.js";
import type { AdminUserListResponse, AdminUserSafe } from "./admin-users.types.js";

const ADMIN_ROLES: UserType[] = [UserType.ADMIN, UserType.SUPER_ADMIN];

function isAdminRole(userType: UserType): boolean {
  return ADMIN_ROLES.includes(userType);
}

function isDowngradeFromAdmin(from: UserType, to: UserType): boolean {
  return isAdminRole(from) && !isAdminRole(to);
}

async function countActiveAdmins(): Promise<number> {
  return prisma.user.count({
    where: {
      deletedAt: null,
      userType: { in: ADMIN_ROLES },
    },
  });
}

async function getActiveUserOrThrow(id: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError("Admin user not found", 404, "ADMIN_USER_NOT_FOUND");
  }
  if (user.deletedAt != null) {
    throw new AppError("Admin user not found", 404, "ADMIN_USER_NOT_FOUND");
  }
  return user;
}

export async function listAdminUsers(query: ListAdminUsersQuery): Promise<AdminUserListResponse> {
  const where: Prisma.UserWhereInput = {};

  if (query.role) {
    where.userType = query.role;
  }

  if (query.email) {
    where.email = { contains: normalizeEmail(query.email), mode: "insensitive" };
  }

  if (query.status === "ACTIVE") {
    where.deletedAt = null;
  } else if (query.status === "DISABLED") {
    where.deletedAt = { not: null };
  } else if (!query.includeDisabled) {
    where.deletedAt = null;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ deletedAt: "asc" }, { createdAt: "desc" }],
      skip: query.offset,
      take: query.limit,
    }),
  ]);

  const items = users.map(toAdminUserSafe);
  const hasMore = query.offset + items.length < total;

  return {
    items,
    limit: query.limit,
    offset: query.offset,
    total,
    hasMore,
  };
}

export async function createAdminUser(
  body: CreateAdminUserBody,
  actorUserId: string
): Promise<AdminUserSafe> {
  const email = normalizeEmail(body.email);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.deletedAt == null) {
    throw new AppError("Email already in use", 409, "ADMIN_USER_EMAIL_ALREADY_EXISTS");
  }
  if (existing?.deletedAt != null) {
    throw new AppError("Email already in use", 409, "ADMIN_USER_EMAIL_ALREADY_EXISTS");
  }

  try {
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
        userType: body.userType,
        createdByUserId: actorUserId,
      },
      include: {
        createdBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    await writeAuditLog({
      actorUserId,
      action: "ADMIN_USER_CREATED",
      targetType: "User",
      targetId: user.id,
      metadata: { userType: user.userType, email: user.email },
    });

    return toAdminUserSafe(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Email already in use", 409, "ADMIN_USER_EMAIL_ALREADY_EXISTS");
    }
    throw new AppError("Failed to create admin user", 500, "ADMIN_USER_CREATE_FAILED");
  }
}

export async function updateAdminUserRole(
  userId: string,
  body: PatchAdminUserRoleBody,
  actorUserId: string
): Promise<AdminUserSafe> {
  if (userId === actorUserId) {
    throw new AppError("Cannot change your own role", 409, "SELF_ROLE_CHANGE_FORBIDDEN");
  }

  const target = await getActiveUserOrThrow(userId);

  if (target.userType === body.userType) {
    return toAdminUserSafe(target);
  }

  if (isDowngradeFromAdmin(target.userType, body.userType)) {
    const activeAdmins = await countActiveAdmins();
    if (activeAdmins <= 1) {
      throw new AppError("Cannot downgrade the last active admin", 409, "LAST_ADMIN_PROTECTED");
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { userType: body.userType },
    include: {
      createdBy: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
  });

  await writeAuditLog({
    actorUserId,
    action: "ADMIN_USER_ROLE_UPDATED",
    targetType: "User",
    targetId: userId,
    metadata: { from: target.userType, to: body.userType },
  });

  return toAdminUserSafe(updated);
}

export async function disableAdminUser(
  userId: string,
  actorUserId: string
): Promise<AdminUserSafe> {
  if (userId === actorUserId) {
    throw new AppError("Cannot disable your own account", 409, "SELF_DELETE_FORBIDDEN");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    throw new AppError("Admin user not found", 404, "ADMIN_USER_NOT_FOUND");
  }

  if (target.deletedAt != null) {
    return toAdminUserSafe(target);
  }

  if (isAdminRole(target.userType)) {
    const activeAdmins = await countActiveAdmins();
    if (activeAdmins <= 1) {
      throw new AppError("Cannot disable the last active admin", 409, "LAST_ADMIN_PROTECTED");
    }
  }

  const now = new Date();

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { deletedAt: now },
      include: {
        createdBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    }),
    prisma.session.deleteMany({ where: { userId } }),
  ]);

  await writeAuditLog({
    actorUserId,
    action: "ADMIN_USER_DISABLED",
    targetType: "User",
    targetId: userId,
    metadata: { email: target.email, userType: target.userType },
  });

  return toAdminUserSafe(updated);
}
