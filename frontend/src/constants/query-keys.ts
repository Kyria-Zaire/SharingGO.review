export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: ["auth", "me"] as const,
  },
  admin: {
    all: ["admin"] as const,
    trips: {
      all: ["admin", "trips"] as const,
      list: (filters: Record<string, unknown>) => ["admin", "trips", "list", filters] as const,
      occupancy: (tripId: string) => ["admin", "trips", tripId, "occupancy"] as const,
    },
    lines: ["admin", "lines"] as const,
    reservations: ["admin", "reservations"] as const,
    payments: ["admin", "payments"] as const,
    subscriptions: ["admin", "subscriptions"] as const,
  },
} as const;
