import { env } from "@/lib/env";
import type { ApiErrorBody, HttpRequestOptions } from "@/types/api.types";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string;

  constructor(message: string, status: number, code: string, requestId: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

function parseApiError(data: unknown, status: number): ApiError {
  const body = data as Partial<ApiErrorBody> | null;
  return new ApiError(
    body?.error?.message ?? "Request failed",
    status,
    body?.error?.code ?? "UNKNOWN",
    body?.error?.requestId ?? "unknown"
  );
}

export async function http<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Impossible de joindre le serveur. Vérifiez que l'API est démarrée et que CORS autorise cette application.",
      0,
      "NETWORK_ERROR",
      "local"
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw parseApiError(data, response.status);
  }

  return data as T;
}
