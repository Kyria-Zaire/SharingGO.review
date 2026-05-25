import { ROUTES } from "@/constants/routes";
import { formatShortId } from "@/lib/format-id";
import type { DispatchActivityEvent } from "@/types/dispatch.types";

export function getDispatchEntityHref(event: DispatchActivityEvent): string | null {
  if (!event.entityId) return null;

  switch (event.entityType) {
    case "Reservation":
      return `${ROUTES.reservations}?selected=${encodeURIComponent(event.entityId)}`;
    case "Trip":
      return `${ROUTES.trips}?tripId=${encodeURIComponent(event.entityId)}`;
    case "Payment":
      return `${ROUTES.payments}?paymentId=${encodeURIComponent(event.entityId)}`;
    case "Incident":
      return ROUTES.incidents;
    default:
      return null;
  }
}

export function getDispatchEntityLabel(event: DispatchActivityEvent): string | null {
  if (!event.entityType || !event.entityId) return null;
  return `${event.entityType} ${formatShortId(event.entityId)}`;
}
