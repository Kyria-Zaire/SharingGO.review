import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listUserReservations } from "@/api/reservations.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";
import type { ListUserReservationsQuery } from "@/types/reservations";

export type BookingsFilter = "upcoming" | "past" | "canceled";

const RESERVATIONS_STALE_MS = 30_000;

function buildListQuery(filter: BookingsFilter): ListUserReservationsQuery {
  if (filter === "upcoming") {
    return { upcoming: true, limit: 50, offset: 0 };
  }
  if (filter === "past") {
    return { past: true, limit: 50, offset: 0 };
  }
  return { status: "CANCELED", limit: 50, offset: 0 };
}

export function useUserReservations(filter: BookingsFilter) {
  const queryParams = useMemo(() => buildListQuery(filter), [filter]);

  return useQuery({
    queryKey: queryKeys.reservations.list({ filter, ...queryParams }),
    queryFn: () => listUserReservations(queryParams),
    staleTime: RESERVATIONS_STALE_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
