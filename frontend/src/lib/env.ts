const apiUrl = (import.meta.env.VITE_API_URL ?? "").trim();

export const env = {
  /** Empty string = same-origin (Vite dev proxy → backend local). */
  apiUrl,
} as const;
