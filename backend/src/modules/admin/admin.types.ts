import type {
  AdminPaymentDto,
  AdminPendingDto,
  AdminReservationListItemDto,
} from "./admin.serializers.js";

export interface PaginatedResult<T> {
  items: T[];
  limit: number;
  offset: number;
}

export interface ListAdminReservationsResult {
  reservations: AdminReservationListItemDto[];
  limit: number;
  offset: number;
}

export interface ListAdminPaymentsResult {
  payments: AdminPaymentDto[];
  limit: number;
  offset: number;
}

export interface ListAdminPendingResult {
  pendingReservations: AdminPendingDto[];
  limit: number;
  offset: number;
}

export interface TripOccupancyResult {
  trip: {
    id: string;
    departureTime: string;
    arrivalTime: string | null;
    totalSeats: number;
    deletedAt: string | null;
    line: {
      id: string;
      name: string;
      startCity: string;
      endCity: string;
    };
  };
  totalSeats: number;
  confirmedSeats: number;
  usedSeats: number;
  activePendingSeats: number;
  occupiedSeats: number;
  remainingSeats: number;
  isFull: boolean;
}
