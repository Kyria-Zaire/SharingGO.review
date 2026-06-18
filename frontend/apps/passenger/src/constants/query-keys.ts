export const queryKeys = {
  trips: {
    all: ["trips"] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.trips.all, "list", filters] as const,
    detail: (tripId: string) => [...queryKeys.trips.all, "detail", tripId] as const,
  },
  reservations: {
    all: ["reservations"] as const,
    pending: (pendingReservationId: string) =>
      [...queryKeys.reservations.all, "pending", pendingReservationId] as const,
    createPending: ["reservations", "createPending"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.reservations.all, "list", filters] as const,
    detail: (reservationId: string) =>
      [...queryKeys.reservations.all, "detail", reservationId] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.payments.all, "list", filters] as const,
    createCheckout: ["payments", "createCheckout"] as const,
  },
  boarding: {
    all: ["boarding"] as const,
    qr: (reservationId: string) =>
      [...queryKeys.boarding.all, "qr", reservationId] as const,
  },
} as const;
