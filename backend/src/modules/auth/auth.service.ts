import type { User } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { Response } from "express";
import { AppError } from "../../lib/errors.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { recordUserLastLogin } from "../../lib/user-login.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import type { AuthAuditAction, SafeUser } from "./auth.types.js";
import {
  generateOpaqueToken,
  getSessionExpiresAt,
  hashOpaqueToken,
  normalizeEmail,
  readSessionTokenFromCookie,
  setSessionCookie,
} from "./auth.utils.js";

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    userType: user.userType,
  };
}

export function mapUserToSafeUser(user: User): SafeUser {
  return toSafeUser(user);
}

function logAuthEvent(
  action: AuthAuditAction,
  requestId: string,
  userId?: string
): void {
  logger.info("Auth event", {
    action,
    requestId,
    userId,
    timestamp: new Date().toISOString(),
  });
}

export async function createSessionForUser(userId: string, res: Response): Promise<void> {
  const rawToken = generateOpaqueToken();
  const hashedToken = hashOpaqueToken(rawToken);
  const expiresAt = getSessionExpiresAt();

  await prisma.session.create({
    data: {
      userId,
      hashedToken,
      expiresAt,
    },
  });

  setSessionCookie(res, rawToken);
}

export async function registerUser(
  input: RegisterInput,
  res: Response,
  requestId: string
): Promise<SafeUser> {
  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
      },
    });

    await recordUserLastLogin(user.id);
    await createSessionForUser(user.id, res);
    logAuthEvent("REGISTER_SUCCESS", requestId, user.id);

    return toSafeUser(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Email already registered", 409, "EMAIL_ALREADY_EXISTS");
    }
    throw error;
  }
}

export async function loginUser(
  input: LoginInput,
  res: Response,
  requestId: string
): Promise<SafeUser> {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.passwordHash || user.deletedAt != null) {
    logAuthEvent("LOGIN_FAILED", requestId);
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    logAuthEvent("LOGIN_FAILED", requestId);
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  await recordUserLastLogin(user.id);
  await createSessionForUser(user.id, res);
  logAuthEvent("LOGIN_SUCCESS", requestId, user.id);

  return toSafeUser(user);
}

export function getCurrentUser(reqUser: User): SafeUser {
  return toSafeUser(reqUser);
}

export async function logoutUser(
  cookies: Record<string, string | undefined> | undefined,
  requestId: string,
  userId?: string
): Promise<void> {
  const rawToken = readSessionTokenFromCookie(cookies);

  if (rawToken) {
    const hashedToken = hashOpaqueToken(rawToken);
    await prisma.session.deleteMany({ where: { hashedToken } });
  }

  logAuthEvent("LOGOUT", requestId, userId);
}
