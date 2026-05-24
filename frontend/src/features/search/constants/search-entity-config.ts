import { CreditCard, MapPin, Ticket, type LucideIcon } from "lucide-react";
import type { OperationSearchResultType } from "@/types/search.types";

/** V1 badges — entity iconography map prepared for future Ctrl+K palette. */
export const SEARCH_ENTITY_BADGES: Record<OperationSearchResultType, string> = {
  reservation: "Reservation",
  payment: "Payment",
  trip: "Trip",
};

/** Dropdown section headers (grouped results). */
export const SEARCH_CATEGORY_HEADERS: Record<OperationSearchResultType, string> = {
  reservation: "Reservations",
  payment: "Payments",
  trip: "Trips",
};

export const SEARCH_RESULT_GROUPS: OperationSearchResultType[] = [
  "reservation",
  "payment",
  "trip",
];

/**
 * Future unified entity iconography (V1 uses badges only).
 * @see docs/features/F3-T8-unified-operations-search-context-navigation.md
 */
export const SEARCH_ENTITY_ICONS: Record<OperationSearchResultType, LucideIcon> = {
  reservation: Ticket,
  payment: CreditCard,
  trip: MapPin,
};
