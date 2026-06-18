import type { Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../lib/errors.js";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "./auth.service.js";
import { loginWithGoogleIdToken } from "./auth.google.service.js";
import { clearSessionCookie } from "./auth.utils.js";
import { googleAuthSchema, loginSchema, registerSchema } from "./auth.schemas.js";

function parseBody<T>(schema: { parse: (data: unknown) => T }, body: unknown): T {
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

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const input = parseBody(registerSchema, req.body);
  const user = await registerUser(input, res, req.requestId);
  res.status(201).json({ user });
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const input = parseBody(loginSchema, req.body);
  const user = await loginUser(input, res, req.requestId);
  res.status(200).json({ user });
}

export async function googleAuthHandler(req: Request, res: Response): Promise<void> {
  const input = parseBody(googleAuthSchema, req.body);
  const result = await loginWithGoogleIdToken(input.idToken, res, req.requestId);
  res.status(result.created ? 201 : 200).json(result.user);
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }
  res.status(200).json(getCurrentUser(req.user));
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  await logoutUser(
    req.cookies as Record<string, string | undefined>,
    req.requestId,
    req.user?.id
  );
  clearSessionCookie(res);
  res.sendStatus(204);
}

export async function rbacCheckHandler(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ ok: true });
}
