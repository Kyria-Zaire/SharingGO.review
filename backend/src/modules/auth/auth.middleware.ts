import type { UserType } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { hashOpaqueToken, readSessionTokenFromCookie } from "./auth.utils.js";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawToken = readSessionTokenFromCookie(req.cookies as Record<string, string | undefined>);
    if (!rawToken) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const hashedToken = hashOpaqueToken(rawToken);
    const session = await prisma.session.findUnique({
      where: { hashedToken },
      include: { user: true },
    });

    if (!session) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    if (session.expiresAt <= new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new AppError("Session expired", 401, "UNAUTHORIZED");
    }

    req.user = session.user;
    req.sessionId = session.id;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: UserType[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }

    if (!roles.includes(req.user.userType)) {
      next(new AppError("Insufficient permissions", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
}
