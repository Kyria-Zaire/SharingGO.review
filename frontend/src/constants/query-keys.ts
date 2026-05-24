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
    reservations: {
      all: ["admin", "reservations"] as const,
      list: (filters: Record<string, unknown>) =>
        ["admin", "reservations", "list", filters] as const,
      detail: (id: string) => ["admin", "reservations", id, "detail"] as const,
    },
    payments: {
      all: ["admin", "payments"] as const,
      list: (filters: Record<string, unknown>) =>
        ["admin", "payments", "list", filters] as const,
    },
    subscriptions: ["admin", "subscriptions"] as const,
  },
  boarding: {
    offlineCapabilities: ["boarding", "offline-capabilities"] as const,
  },
} as const;
