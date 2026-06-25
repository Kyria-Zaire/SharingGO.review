const DEFAULT_API_URL = "http://localhost:3000";

function readApiUrl(): string {
  const value = import.meta.env.VITE_API_URL;
  if (!value || value.trim() === "") {
    return DEFAULT_API_URL;
  }
  return value.trim();
}

function readGoogleClientId(): string | null {
  const value = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!value || value.trim() === "") {
    return null;
  }
  return value.trim();
}

function readUiDemoTripsFlag(): boolean {
  if (import.meta.env.PROD) {
    return false;
  }
  return import.meta.env.VITE_ENABLE_UI_DEMO_TRIPS === "true";
}

export const env = {
  apiUrl: readApiUrl(),
  googleClientId: readGoogleClientId(),
  uiDemoTrips: readUiDemoTripsFlag(),
} as const;
