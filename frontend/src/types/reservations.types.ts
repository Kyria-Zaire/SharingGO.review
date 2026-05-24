export interface AdminUserMinimal {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELED"
  | "USED"
  | "EXPIRED";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export type PaymentType = "TICKET" | "SUBSCRIPTION" | "SUBSCRIPTION_ACCESS";

export interface AdminReservationPayment {
  id: string;
  status: PaymentStatus;
  type: PaymentType;
  amount: string;
  currency: string;
  createdAt: string;
}

export interface AdminReservationTrip {
  id: string;
  departureTime: string;
  arrivalTime: string | null;
  line: {
    id: string;
    name: string;
    startCity: string;
    endCity: string;
  };
}

export interface AdminReservation {
  id: string;
  status: ReservationStatus;
  user: AdminUserMinimal;
  trip: AdminReservationTrip;
  payment: AdminReservationPayment | null;
  createdAt: string;
  updatedAt: string;
  /** Not returned by admin API yet — reserved for backend follow-up. */
  usedAt?: string | null;
  usedBy?: AdminUserMinimal | null;
}

export type AdminReservationDetail = AdminReservation;

export interface AdminReservationListResponse {
  reservations: AdminReservation[];
  limit: number;
  offset: number;
}

export interface AdminReservationFilters {
  status?: ReservationStatus;
  userId?: string;
  tripId?: string;
  lineId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}
