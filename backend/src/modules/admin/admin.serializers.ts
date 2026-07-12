import type { Line, Payment, Reservation, Trip, User } from "@prisma/client";
import {
  serializeSafePayment,
  serializeTrip,
  type SafePaymentDto,
  type SafeReservationTripDto,
} from "../reservations/reservations.serializers.js";

export interface AdminUserMinimalDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export function serializeUserMinimal(user: User): AdminUserMinimalDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export function stripeShortRef(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 14) return value;
  return `${value.slice(0, 7)}...${value.slice(-4)}`;
}

export interface AdminPaymentDto extends SafePaymentDto {
  reservationId: string | null;
  user: AdminUserMinimalDto;
  stripePaymentIntentRef: string | null;
  stripeCheckoutSessionRef: string | null;
}

export function serializeAdminPayment(
  payment: Payment & {
    user: User;
    reservation:
      | (Reservation & {
          trip: Trip & { line: Line };
        })
      | null;
  }
): AdminPaymentDto {
  const base = serializeSafePayment(payment)!;
  return {
    ...base,
    reservationId: payment.reservationId,
    user: serializeUserMinimal(payment.user),
    stripePaymentIntentRef: stripeShortRef(payment.stripePaymentIntentId),
    stripeCheckoutSessionRef: stripeShortRef(payment.stripeCheckoutSessionId),
  };
}

export interface AdminRefundProcessorDto {
  id: string;
  name: string;
}

export interface AdminReservationListItemDto {
  id: string;
  status: Reservation["status"];
  user: AdminUserMinimalDto;
  trip: SafeReservationTripDto;
  payment: SafePaymentDto | null;
  refundStatus: Reservation["refundStatus"];
  refundProcessedAt: string | null;
  refundProcessedBy: AdminRefundProcessorDto | null;
  createdAt: string;
  updatedAt: string;
}

export function serializeAdminReservation(
  reservation: Reservation & {
    user: User;
    trip: Trip & { line: Line };
    payment: Payment | null;
    refundProcessedBy: User | null;
  }
): AdminReservationListItemDto {
  return {
    id: reservation.id,
    status: reservation.status,
    user: serializeUserMinimal(reservation.user),
    trip: serializeTrip(reservation.trip),
    payment: serializeSafePayment(reservation.payment),
    refundStatus: reservation.refundStatus,
    refundProcessedAt: reservation.refundProcessedAt?.toISOString() ?? null,
    refundProcessedBy: reservation.refundProcessedBy
      ? {
          id: reservation.refundProcessedBy.id,
          name: `${reservation.refundProcessedBy.firstName ?? ""} ${reservation.refundProcessedBy.lastName ?? ""}`.trim(),
        }
      : null,
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
  };
}

export interface AdminPendingDto {
  id: string;
  user: AdminUserMinimalDto;
  trip: {
    id: string;
    departureTime: string;
    line: {
      id: string;
      name: string;
      startCity: string;
      endCity: string;
    };
  };
  expiresAt: string;
  consumedAt: string | null;
  isActive: boolean;
  isExpired: boolean;
  isConsumed: boolean;
  createdAt: string;
}

export function serializeAdminPending(
  pending: {
    id: string;
    expiresAt: Date;
    consumedAt: Date | null;
    createdAt: Date;
    user: User;
    trip: Trip & { line: Line };
  },
  now: Date
): AdminPendingDto {
  const isConsumed = pending.consumedAt !== null;
  const isExpired = !isConsumed && pending.expiresAt <= now;
  const isActive = !isConsumed && pending.expiresAt > now;

  return {
    id: pending.id,
    user: serializeUserMinimal(pending.user),
    trip: {
      id: pending.trip.id,
      departureTime: pending.trip.departureTime.toISOString(),
      line: {
        id: pending.trip.line.id,
        name: pending.trip.line.name,
        startCity: pending.trip.line.startCity,
        endCity: pending.trip.line.endCity,
      },
    },
    expiresAt: pending.expiresAt.toISOString(),
    consumedAt: pending.consumedAt?.toISOString() ?? null,
    isActive,
    isExpired,
    isConsumed,
    createdAt: pending.createdAt.toISOString(),
  };
}

export function formatTripOccupancy(trip: Trip & { line: Line }) {
  return {
    id: trip.id,
    departureTime: trip.departureTime.toISOString(),
    arrivalTime: trip.arrivalTime?.toISOString() ?? null,
    totalSeats: trip.totalSeats,
    deletedAt: trip.deletedAt?.toISOString() ?? null,
    line: {
      id: trip.line.id,
      name: trip.line.name,
      startCity: trip.line.startCity,
      endCity: trip.line.endCity,
    },
  };
}
