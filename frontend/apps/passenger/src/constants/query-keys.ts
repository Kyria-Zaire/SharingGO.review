export const queryKeys = {
  trips: {
    all: ["trips"] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.trips.all, "list", filters] as const,
  },
} as const;
