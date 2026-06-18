import { useParams } from "react-router-dom";

/** Param route `trips/:tripId` — fallback pathname si useParams est vide (SPA direct load). */
export function useTripIdParam(): string | undefined {
  const { tripId } = useParams<{ tripId: string }>();
  const normalized = tripId?.trim();
  if (normalized) return normalized;

  const segments = window.location.pathname.split("/").filter(Boolean);
  if (segments[0] === "trips" && segments[1]) {
    return decodeURIComponent(segments[1]);
  }

  return undefined;
}
