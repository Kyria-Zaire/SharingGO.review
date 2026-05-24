/**
 * Admin API surface — stubs for upcoming feature tickets (F3-T2+).
 * Backend remains the single source of truth; wiretap business logic here yet.
 */
import { http } from "./http";

export const adminApi = {
  health: () => http<{ status: string }>("/health"),
} as const;
