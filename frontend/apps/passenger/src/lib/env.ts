const DEFAULT_API_URL = "http://localhost:3000";

function readApiUrl(): string {
  const value = import.meta.env.VITE_API_URL;
  if (!value || value.trim() === "") {
    return DEFAULT_API_URL;
  }
  return value.trim();
}

/** Préparé pour les tickets API futurs (F4A-T2+). Non utilisé en F4A-T1. */
export const env = {
  apiUrl: readApiUrl(),
} as const;
