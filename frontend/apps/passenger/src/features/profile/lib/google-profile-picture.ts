const STORAGE_KEY = "sharinggo.google.picture";

function decodeJwtPayload(credential: string): Record<string, unknown> | null {
  const segment = credential.split(".")[1];
  if (!segment) return null;
  try {
    const json = atob(segment.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function persistGooglePictureFromCredential(credential: string): void {
  const payload = decodeJwtPayload(credential);
  const picture = payload?.picture;
  if (typeof picture === "string" && picture.length > 0) {
    sessionStorage.setItem(STORAGE_KEY, picture);
  }
}

export function getGoogleProfilePicture(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearGoogleProfilePicture(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
