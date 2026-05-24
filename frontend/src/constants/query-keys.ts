export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: ["auth", "me"] as const,
  },
  admin: {
    all: ["admin"] as const,
    trips: ["admin", "trips"] as const,
    reservations: ["admin", "reservations"] as const,
    payments: ["admin", "payments"] as const,
    subscriptions: ["admin", "subscriptions"] as const,
  },
} as const;
