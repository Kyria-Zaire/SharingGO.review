import { useQueries } from "@tanstack/react-query";
import { listUserReservations } from "@/api/reservations.api";
import { mergeReservationsWithUiDemo } from "@/features/bookings/demo/merge-demo-bookings";
import { queryKeys } from "@/constants/query-keys";
import type { BookingsFilter } from "@/hooks/useUserReservations";

const COUNT_STALE_MS = 30_000;
const COUNT_LIMIT = 50;

const TAB_QUERIES: Record<BookingsFilter, Parameters<typeof listUserReservations>[0]> = {
  upcoming: { upcoming: true, limit: COUNT_LIMIT, offset: 0 },
  past: { past: true, limit: COUNT_LIMIT, offset: 0 },
  canceled: { status: "CANCELED", limit: COUNT_LIMIT, offset: 0 },
};

/** Compteurs onglets — API + complément démo UI si actif (max {COUNT_LIMIT} par onglet). */
export function useBookingsTabCounts(): Record<BookingsFilter, number | undefined> {
  const results = useQueries({
    queries: (Object.keys(TAB_QUERIES) as BookingsFilter[]).map((filter) => ({
      queryKey: queryKeys.reservations.list({ tabCount: filter, ...TAB_QUERIES[filter] }),
      queryFn: async () => listUserReservations(TAB_QUERIES[filter]),
      staleTime: COUNT_STALE_MS,
      select: (data: Awaited<ReturnType<typeof listUserReservations>>) =>
        mergeReservationsWithUiDemo(data.reservations, filter).length,
    })),
  });

  return {
    upcoming: results[0]?.data,
    past: results[1]?.data,
    canceled: results[2]?.data,
  };
}
