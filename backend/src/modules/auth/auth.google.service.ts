import { OAuth2Client } from "google-auth-library";
import type { User } from "@prisma/client";
import { UserType } from "@prisma/client";
import type { Response } from "express";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
import { recordUserLastLogin } from "../../lib/user-login.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { createSessionForUser, mapUserToSafeUser } from "./auth.service.js";
import { normalizeEmail } from "./auth.utils.js";
import type { SafeUser } from "./auth.types.js";

export const GOOGLE_OAUTH_PROVIDER = "google" as const;

const googleClient = new OAuth2Client(env.googleClientId);

interface VerifiedGoogleIdentity {
  sub: string;
  email: string;
  givenName?: string;
  familyName?: string;
}

export interface GoogleAuthLoginResult {
  user: SafeUser;
  created: boolean;
}

function logGoogleAuthEvent(
  action: "GOOGLE_LOGIN_SUCCESS" | "GOOGLE_LOGIN_FAILED",
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

function assertAccountActive(user: User): void {
  if (user.deletedAt != null) {
    throw new AppError("Account disabled", 403, "ACCOUNT_DISABLED");
  }
}

function buildProfileUpdates(
  user: Pick<User, "firstName" | "lastName">,
  identity: Pick<VerifiedGoogleIdentity, "givenName" | "familyName">
): Pick<User, "firstName" | "lastName"> | null {
  const firstName =
    user.firstName ?? (identity.givenName?.trim() ? identity.givenName.trim() : null);
  const lastName =
    user.lastName ?? (identity.familyName?.trim() ? identity.familyName.trim() : null);

  if (firstName === user.firstName && lastName === user.lastName) {
    return null;
  }

  return { firstName, lastName };
}

async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleIdentity> {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub) {
      throw new AppError("Invalid Google ID token", 401, "INVALID_GOOGLE_TOKEN");
    }

    if (!payload.email?.trim()) {
      throw new AppError("Google account email is missing", 401, "GOOGLE_EMAIL_MISSING");
    }

    if (payload.email_verified !== true) {
      throw new AppError("Google account email is not verified", 401, "GOOGLE_EMAIL_NOT_VERIFIED");
    }

    return {
      sub: payload.sub,
      email: normalizeEmail(payload.email),
      givenName: payload.given_name,
      familyName: payload.family_name,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid Google ID token", 401, "INVALID_GOOGLE_TOKEN");
  }
}

export async function loginWithGoogleIdToken(
  idToken: string,
  res: Response,
  requestId: string
): Promise<GoogleAuthLoginResult> {
  try {
    const identity = await verifyGoogleIdToken(idToken);
    return await completeGoogleLogin(identity, res, requestId);
  } catch (error) {
    logGoogleAuthEvent("GOOGLE_LOGIN_FAILED", requestId);
    throw error;
  }
}

async function completeGoogleLogin(
  identity: VerifiedGoogleIdentity,
  res: Response,
  requestId: string
): Promise<GoogleAuthLoginResult> {

  const existingOAuth = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider: GOOGLE_OAUTH_PROVIDER,
        providerUserId: identity.sub,
      },
    },
    include: { user: true },
  });

  if (existingOAuth) {
    assertAccountActive(existingOAuth.user);

    const profileUpdates = buildProfileUpdates(existingOAuth.user, identity);
    const user = profileUpdates
      ? await prisma.user.update({
          where: { id: existingOAuth.user.id },
          data: profileUpdates,
        })
      : existingOAuth.user;

    await recordUserLastLogin(user.id);
    await createSessionForUser(user.id, res);
    logGoogleAuthEvent("GOOGLE_LOGIN_SUCCESS", requestId, user.id);

    return { user: mapUserToSafeUser(user), created: false };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: identity.email } });

  if (existingUser) {
    assertAccountActive(existingUser);

    const result = await prisma.$transaction(async (tx) => {
      await tx.oAuthAccount.create({
        data: {
          provider: GOOGLE_OAUTH_PROVIDER,
          providerUserId: identity.sub,
          userId: existingUser.id,
        },
      });

      const profileUpdates = buildProfileUpdates(existingUser, identity);
      if (!profileUpdates) {
        return existingUser;
      }

      return tx.user.update({
        where: { id: existingUser.id },
        data: profileUpdates,
      });
    });

    await recordUserLastLogin(result.id);
    await createSessionForUser(result.id, res);
    logGoogleAuthEvent("GOOGLE_LOGIN_SUCCESS", requestId, result.id);

    return { user: mapUserToSafeUser(result), created: false };
  }

  const createdUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: identity.email,
        userType: UserType.CONVOYEUR,
        firstName: identity.givenName?.trim() || null,
        lastName: identity.familyName?.trim() || null,
      },
    });

    await tx.oAuthAccount.create({
      data: {
        provider: GOOGLE_OAUTH_PROVIDER,
        providerUserId: identity.sub,
        userId: user.id,
      },
    });

    return user;
  });

  await recordUserLastLogin(createdUser.id);
  await createSessionForUser(createdUser.id, res);
  logGoogleAuthEvent("GOOGLE_LOGIN_SUCCESS", requestId, createdUser.id);

  return { user: mapUserToSafeUser(createdUser), created: true };
}
