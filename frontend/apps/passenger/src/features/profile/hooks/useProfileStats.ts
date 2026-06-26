import { useQuery } from "@tanstack/react-query";
import { listUserReservations } from "@/api/reservations.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";

const STALE_MS = 30_000;
const STATS_LIMIT = 50;

export interface ProfileStats {
  tripsCompleted: number;
  reservationsCount: number;
}

async function fetchProfileStats(): Promise<ProfileStats> {
  const [past, upcoming] = await Promise.all([
    listUserReservations({ past: true, limit: STATS_LIMIT, offset: 0 }),
    listUserReservations({ upcoming: true, limit: STATS_LIMIT, offset: 0 }),
  ]);

  const pastItems = past.reservations;
  const upcomingItems = upcoming.reservations;
  const tripsCompleted = pastItems.filter((item) => item.status === "USED").length;

  return {
    tripsCompleted,
    reservationsCount: pastItems.length + upcomingItems.length,
  };
}

export function useProfileStats() {
  return useQuery({
    queryKey: queryKeys.reservations.list({ profileStats: true }),
    queryFn: fetchProfileStats,
    staleTime: STALE_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
