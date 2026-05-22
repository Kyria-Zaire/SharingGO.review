export interface CreatePendingReservationResult {
  pendingReservationId: string;
  expiresAt: string;
  remainingSeats: number;
}

export interface PendingReservationDetail {
  id: string;
  trip: {
    id: string;
    departureTime: string;
  };
  expiresAt: string;
  isExpired: boolean;
}

import type { SafeReservationListItemDto } from "./reservations.serializers.js";

export interface ListReservationsResult {
  reservations: SafeReservationListItemDto[];
  limit: number;
  offset: number;
}
