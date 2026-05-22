import { createHash, randomBytes } from "node:crypto";
import type { CookieOptions, Response } from "express";
import { env } from "../../config/env.js";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashOpaqueToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function getSessionExpiresAt(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.sessionTtlDays);
  return expiresAt;
}

export function getSessionMaxAgeMs(): number {
  return env.sessionTtlDays * 24 * 60 * 60 * 1000;
}

export function getSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getSessionMaxAgeMs(),
  };
}

export function setSessionCookie(res: Response, rawToken: string): void {
  res.cookie(env.sessionCookieName, rawToken, getSessionCookieOptions());
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(env.sessionCookieName, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  });
}

export function readSessionTokenFromCookie(
  cookies: Record<string, string | undefined> | undefined
): string | undefined {
  const value = cookies?.[env.sessionCookieName];
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  return value.trim();
}
