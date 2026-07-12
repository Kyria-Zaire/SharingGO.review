import type { Line, Payment, Reservation, RefundStatus, Trip } from "@prisma/client";
import { Prisma } from "@prisma/client";

type ReservationWithRelations = Reservation & {
  trip: Trip & { line: Line };
  payment: Payment | null;
};

export interface SafePaymentDto {
  id: string;
  status: Payment["status"];
  type: Payment["type"];
  amount: string;
  currency: string;
  createdAt: string;
}

export interface SafeReservationTripDto {
  id: string;
  departureTime: string;
  arrivalTime: string | null;
  line: {
    id: string;
    name: string;
    startCity: string;
    endCity: string;
  };
}

export interface SafeReservationMinimalDto {
  id: string;
  status: Reservation["status"];
  trip: SafeReservationTripDto;
}

export function serializeReservationMinimal(
  reservation: Reservation & { trip: Trip & { line: Line } }
): SafeReservationMinimalDto {
  return {
    id: reservation.id,
    status: reservation.status,
    trip: serializeTrip(reservation.trip),
  };
}

export interface SafeReservationListItemDto {
  id: string;
  status: Reservation["status"];
  refundStatus: RefundStatus;
  trip: SafeReservationTripDto;
  payment: SafePaymentDto | null;
  createdAt: string;
}

export interface SafeReservationDetailDto extends SafeReservationListItemDto {
  updatedAt: string;
}

export function serializeSafePayment(payment: Payment | null): SafePaymentDto | null {
  if (!payment) {
    return null;
  }

  const amount =
    payment.amount instanceof Prisma.Decimal
      ? payment.amount.toFixed(2)
      : String(payment.amount);

  return {
    id: payment.id,
    status: payment.status,
    type: payment.type,
    amount,
    currency: payment.currency,
    createdAt: payment.createdAt.toISOString(),
  };
}

export function serializeTrip(trip: Trip & { line: Line }): SafeReservationTripDto {
  return {
    id: trip.id,
    departureTime: trip.departureTime.toISOString(),
    arrivalTime: trip.arrivalTime?.toISOString() ?? null,
    line: {
      id: trip.line.id,
      name: trip.line.name,
      startCity: trip.line.startCity,
      endCity: trip.line.endCity,
    },
  };
}

export function serializeReservationListItem(
  reservation: ReservationWithRelations
): SafeReservationListItemDto {
  return {
    id: reservation.id,
    status: reservation.status,
    refundStatus: reservation.refundStatus,
    trip: serializeTrip(reservation.trip),
    payment: serializeSafePayment(reservation.payment),
    createdAt: reservation.createdAt.toISOString(),
  };
}

export function serializeReservationDetail(
  reservation: ReservationWithRelations
): SafeReservationDetailDto {
  return {
    ...serializeReservationListItem(reservation),
    updatedAt: reservation.updatedAt.toISOString(),
  };
}
