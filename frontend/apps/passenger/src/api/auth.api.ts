import { ApiError, http } from "@/api/http";
import { env } from "@/lib/env";
import type { ApiErrorBody } from "@/types/api.types";
import type { PassengerUser } from "@/types/auth";

function parseApiError(data: unknown, status: number): ApiError {
  const body = data as Partial<ApiErrorBody> | null;
  return new ApiError(
    body?.error?.message ?? "Request failed",
    status,
    body?.error?.code ?? "UNKNOWN",
    body?.error?.requestId ?? "unknown"
  );
}

export async function getCurrentPassenger(): Promise<PassengerUser | null> {
  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}/api/auth/me`, {
      method: "GET",
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "Impossible de joindre le serveur. Vérifiez que l'API est démarrée et que CORS autorise cette application.",
      0,
      "NETWORK_ERROR",
      "local"
    );
  }

  if (response.status === 401) {
    return null;
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw parseApiError(data, response.status);
  }

  return data as PassengerUser;
}

interface AuthUserResponse {
  user: PassengerUser;
}

export interface LoginPassengerInput {
  email: string;
  password: string;
}

export interface RegisterPassengerInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export async function googleLoginPassenger(idToken: string): Promise<PassengerUser> {
  return http<PassengerUser>("/api/auth/google", {
    method: "POST",
    body: { idToken },
  });
}

/** POST /api/auth/login — cookie HttpOnly posé par le backend. */
export async function loginPassengerEmailPassword(
  input: LoginPassengerInput
): Promise<PassengerUser> {
  const data = await http<AuthUserResponse>("/api/auth/login", {
    method: "POST",
    body: input,
  });
  return data.user;
}

/** POST /api/auth/register — crée un CONVOYEUR (défaut Prisma) + session. */
export async function registerPassengerEmailPassword(
  input: RegisterPassengerInput
): Promise<PassengerUser> {
  const data = await http<AuthUserResponse>("/api/auth/register", {
    method: "POST",
    body: input,
  });
  return data.user;
}

export async function logoutPassenger(): Promise<void> {
  await http<void>("/api/auth/logout", { method: "POST" });
}
