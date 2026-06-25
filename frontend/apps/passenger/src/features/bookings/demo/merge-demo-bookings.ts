import { getUiDemoBookingsPool } from "@/features/bookings/demo/demo-bookings";
import {
  defaultBookingsSort,
  sortBookings,
} from "@/features/bookings/lib/bookings-sort";
import { isUiDemoTripsEnabled } from "@/lib/ui-demo-trips";
import type { BookingsFilter } from "@/hooks/useUserReservations";
import type { UserReservationListItem } from "@/types/reservations";

function isConfirmedPaid(reservation: UserReservationListItem): boolean {
  return (
    reservation.status === "CONFIRMED" && reservation.payment?.status === "SUCCEEDED"
  );
}

function demoBookingsForFilter(filter: BookingsFilter): UserReservationListItem[] {
  const pool = getUiDemoBookingsPool();

  switch (filter) {
    case "upcoming":
      return pool.filter(
        (reservation) =>
          reservation.status === "CONFIRMED" || reservation.status === "PENDING"
      );
    case "past":
      return pool.filter((reservation) => reservation.status === "USED");
    case "canceled":
      return pool.filter((reservation) => reservation.status === "CANCELED");
    default:
      return [];
  }
}

function pickDemoReservationsToAdd(
  apiReservations: UserReservationListItem[],
  filter: BookingsFilter
): UserReservationListItem[] {
  const apiIds = new Set(apiReservations.map((reservation) => reservation.id));
  const available = demoBookingsForFilter(filter).filter(
    (reservation) => !apiIds.has(reservation.id)
  );

  if (available.length === 0) {
    return [];
  }

  const toAdd: UserReservationListItem[] = [];

  if (filter === "upcoming") {
    const hasConfirmedPaid = apiReservations.some(isConfirmedPaid);
    const hasPending = apiReservations.some((reservation) => reservation.status === "PENDING");

    if (!hasConfirmedPaid) {
      toAdd.push(
        ...available.filter(
          (reservation) =>
            reservation.status === "CONFIRMED" && reservation.payment?.status === "SUCCEEDED"
        )
      );
    }

    if (!hasPending) {
      const pendingDemos = available.filter((reservation) => reservation.status === "PENDING");
      for (const demo of pendingDemos) {
        if (!toAdd.some((item) => item.id === demo.id)) {
          toAdd.push(demo);
        }
      }
    }
  }

  if (filter === "past") {
    const hasUsed = apiReservations.some((reservation) => reservation.status === "USED");
    if (!hasUsed) {
      toAdd.push(...available.filter((reservation) => reservation.status === "USED"));
    }
  }

  if (filter === "canceled") {
    const hasCanceled = apiReservations.some((reservation) => reservation.status === "CANCELED");
    if (!hasCanceled) {
      toAdd.push(...available.filter((reservation) => reservation.status === "CANCELED"));
    }
  }

  return toAdd;
}

/**
 * Complète la liste API avec des réservations démo si le flag est actif (hors PROD)
 * et que les états requis pour la QA UI ne sont pas tous couverts.
 * Les réservations API ne sont jamais remplacées.
 */
export function mergeReservationsWithUiDemo(
  apiReservations: UserReservationListItem[],
  filter: BookingsFilter
): UserReservationListItem[] {
  if (!isUiDemoTripsEnabled()) {
    return apiReservations;
  }

  const toAdd = pickDemoReservationsToAdd(apiReservations, filter);
  if (toAdd.length === 0) {
    return apiReservations;
  }

  return sortBookings([...apiReservations, ...toAdd], defaultBookingsSort(filter));
}
