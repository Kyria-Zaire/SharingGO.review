import type { UserReservationListItem } from "@/types/reservations";
import type { BookingsFilter } from "@/hooks/useUserReservations";

export type BookingsSortOption =
  | "departure_asc"
  | "departure_desc"
  | "created_desc"
  | "created_asc";

export const BOOKINGS_SORT_OPTIONS: { id: BookingsSortOption; label: string }[] = [
  { id: "departure_asc", label: "Date de départ (prochain)" },
  { id: "departure_desc", label: "Date de départ (récent)" },
  { id: "created_desc", label: "Plus récent" },
  { id: "created_asc", label: "Plus ancien" },
];

export function defaultBookingsSort(filter: BookingsFilter): BookingsSortOption {
  if (filter === "upcoming") return "departure_asc";
  if (filter === "past") return "departure_desc";
  return "created_desc";
}

export function sortBookings(
  reservations: UserReservationListItem[],
  sort: BookingsSortOption
): UserReservationListItem[] {
  const sorted = [...reservations];

  sorted.sort((a, b) => {
    switch (sort) {
      case "departure_asc":
        return (
          new Date(a.trip.departureTime).getTime() - new Date(b.trip.departureTime).getTime()
        );
      case "departure_desc":
        return (
          new Date(b.trip.departureTime).getTime() - new Date(a.trip.departureTime).getTime()
        );
      case "created_asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "created_desc":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return sorted;
}

export function formatBookingsSortLabel(sort: BookingsSortOption): string {
  return BOOKINGS_SORT_OPTIONS.find((option) => option.id === sort)?.label ?? "Trier";
}
