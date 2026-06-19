import { buildQuery } from "@/lib/build-query";
import type {
  AdminReservation,
  AdminReservationFilters,
  AdminReservationListResponse,
  ReservationStatus,
} from "@/types/reservations.types";
import { http } from "./http";

const VALID_STATUSES: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELED",
  "USED",
  "EXPIRED",
];

function normalizeString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function normalizeIsoDate(value?: string): string | undefined {
  const normalized = normalizeString(value);
  if (!normalized) return undefined;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function normalizeLimit(value?: number): number {
  if (!Number.isFinite(value)) return 50;
  const rounded = Math.trunc(value as number);
  if (rounded < 1) return 1;
  if (rounded > 100) return 100;
  return rounded;
}

function normalizeOffset(value?: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value as number));
}

function normalizeStatus(value?: string): ReservationStatus | undefined {
  if (!value) return undefined;
  const upper = value.trim().toUpperCase();
  return VALID_STATUSES.includes(upper as ReservationStatus)
    ? (upper as ReservationStatus)
    : undefined;
}

export async function listAdminReservations(
  filters: AdminReservationFilters = {}
): Promise<AdminReservationListResponse> {
  const status = normalizeStatus(filters.status);
  const userId = normalizeString(filters.userId);
  const tripId = normalizeString(filters.tripId);
  const lineId = normalizeString(filters.lineId);
  const from = normalizeIsoDate(filters.from);
  const to = normalizeIsoDate(filters.to);
  const limit = normalizeLimit(filters.limit);
  const offset = normalizeOffset(filters.offset);

  const query = buildQuery({
    status,
    userId,
    tripId,
    lineId,
    from,
    to,
    limit: String(limit),
    offset: String(offset),
  });
  return http<AdminReservationListResponse>(`/api/admin/reservations${query}`);
}

export async function getAdminReservation(reservationId: string): Promise<AdminReservation> {
  return http<AdminReservation>(`/api/admin/reservations/${reservationId}`);
}

export async function cancelAdminReservation(
  reservationId: string,
  reason?: string
): Promise<AdminReservation> {
  return http<AdminReservation>(`/api/admin/reservations/${reservationId}/cancel`, {
    method: "POST",
    body: reason ? { reason } : {},
  });
}
