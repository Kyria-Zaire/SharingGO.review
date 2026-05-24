import { listAdminPayments } from "@/api/admin-payments.api";
import { listAdminReservations } from "@/api/admin-reservations.api";
import { listAdminTrips } from "@/api/admin-trips.api";
import { ROUTES } from "@/constants/routes";
import {
  SEARCH_FETCH_LIMIT,
  SEARCH_MIN_QUERY_LENGTH,
  SEARCH_RESULT_LIMIT_PER_CATEGORY,
} from "@/features/search/constants/search-config";
import { SEARCH_ENTITY_BADGES } from "@/features/search/constants/search-entity-config";
import { formatPassengerLabel } from "@/features/reservations/utils/passenger-label";
import { formatDate } from "@/lib/format-date";
import { formatShortId } from "@/lib/format-id";
import type { AdminPayment } from "@/types/payments.types";
import type { AdminReservation } from "@/types/reservations.types";
import type { AdminTrip } from "@/types/trips.types";
import type {
  OperationSearchResult,
  OperationSearchResults,
} from "@/types/search.types";

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchScore(query: string, ...fields: (string | null | undefined)[]): number {
  if (!query) return 0;

  let best = 0;
  for (const field of fields) {
    if (!field) continue;
    const value = field.toLowerCase();
    if (value === query) {
      best = Math.max(best, 3);
    } else if (value.startsWith(query)) {
      best = Math.max(best, 2);
    } else if (value.includes(query)) {
      best = Math.max(best, 1);
    }
  }
  return best;
}

function takeTopMatches<T>(
  items: T[],
  keyFn: (item: T) => string,
  scoreFn: (item: T) => number,
  limit: number
): T[] {
  const seen = new Set<string>();

  return items
    .map((item) => ({ item, score: scoreFn(item) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .filter(({ item }) => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map(({ item }) => item);
}

function dedupeSearchResults(results: OperationSearchResult[]): OperationSearchResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.type}:${result.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapReservation(reservation: AdminReservation): OperationSearchResult {
  const passenger = formatPassengerLabel(reservation.user);
  const line = reservation.trip.line;
  return {
    type: "reservation",
    id: reservation.id,
    title: `Reservation #${formatShortId(reservation.id)}`,
    subtitle: `${passenger} · ${line.name} (${line.startCity} → ${line.endCity})`,
    href: `${ROUTES.reservations}?selected=${encodeURIComponent(reservation.id)}`,
    badge: SEARCH_ENTITY_BADGES.reservation,
    iconKey: "reservation",
  };
}

function mapPayment(payment: AdminPayment): OperationSearchResult {
  const passenger = formatPassengerLabel(payment.user);
  const reservationHint = payment.reservationId
    ? ` · Rés. ${formatShortId(payment.reservationId)}`
    : "";
  return {
    type: "payment",
    id: payment.id,
    title: `Payment #${formatShortId(payment.id)}`,
    subtitle: `${passenger}${reservationHint} · ${payment.status}`,
    href: `${ROUTES.payments}?paymentId=${encodeURIComponent(payment.id)}`,
    badge: SEARCH_ENTITY_BADGES.payment,
    iconKey: "payment",
  };
}

function mapTrip(trip: AdminTrip): OperationSearchResult {
  const line = trip.line;
  return {
    type: "trip",
    id: trip.id,
    title: `Trip #${formatShortId(trip.id)}`,
    subtitle: `${line.name} · ${formatDate(trip.departureTime)} · ${line.startCity} → ${line.endCity}`,
    href: `${ROUTES.trips}?tripId=${encodeURIComponent(trip.id)}`,
    badge: SEARCH_ENTITY_BADGES.trip,
    iconKey: "trip",
  };
}

export async function searchOperations(rawQuery: string): Promise<OperationSearchResults> {
  const query = normalizeQuery(rawQuery);

  if (query.length < SEARCH_MIN_QUERY_LENGTH) {
    return { reservations: [], payments: [], trips: [], totalCount: 0 };
  }

  const likelyId = query.length >= 8;

  const [reservationsResponse, paymentsResponse, tripsResponse] = await Promise.all([
    listAdminReservations({ limit: SEARCH_FETCH_LIMIT, offset: 0 }),
    listAdminPayments({
      limit: SEARCH_FETCH_LIMIT,
      offset: 0,
      ...(likelyId ? { reservationId: rawQuery.trim() } : {}),
    }),
    listAdminTrips({ includeDisabled: true }),
  ]);

  const reservations = dedupeSearchResults(
    takeTopMatches(
      reservationsResponse.reservations,
      (reservation) => reservation.id,
      (reservation) =>
        matchScore(
          query,
          reservation.id,
          formatShortId(reservation.id),
          reservation.user.email,
          reservation.user.firstName,
          reservation.user.lastName,
          reservation.trip.line.name,
          reservation.trip.line.startCity,
          reservation.trip.line.endCity,
          reservation.trip.id
        ),
      SEARCH_RESULT_LIMIT_PER_CATEGORY
    ).map(mapReservation)
  );

  const payments = dedupeSearchResults(
    takeTopMatches(
      paymentsResponse.payments,
      (payment) => payment.id,
      (payment) =>
        matchScore(
          query,
          payment.id,
          formatShortId(payment.id),
          payment.reservationId ?? undefined,
          payment.reservationId ? formatShortId(payment.reservationId) : undefined,
          payment.user.email,
          payment.user.firstName,
          payment.user.lastName
        ),
      SEARCH_RESULT_LIMIT_PER_CATEGORY
    ).map(mapPayment)
  );

  const trips = dedupeSearchResults(
    takeTopMatches(
      tripsResponse.trips,
      (trip) => trip.id,
      (trip) =>
        matchScore(
          query,
          trip.id,
          formatShortId(trip.id),
          trip.line.name,
          trip.line.startCity,
          trip.line.endCity,
          trip.line.id,
          trip.driver?.email,
          trip.driver?.firstName,
          trip.driver?.lastName
        ),
      SEARCH_RESULT_LIMIT_PER_CATEGORY
    ).map(mapTrip)
  );

  return {
    reservations,
    payments,
    trips,
    totalCount: reservations.length + payments.length + trips.length,
  };
}
