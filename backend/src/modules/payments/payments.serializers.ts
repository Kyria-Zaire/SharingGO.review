import type { Line, Payment, Reservation, Trip } from "@prisma/client";
import {
  serializeReservationMinimal,
  serializeSafePayment,
  type SafePaymentDto,
  type SafeReservationMinimalDto,
} from "../reservations/reservations.serializers.js";

type PaymentWithReservation = Payment & {
  reservation:
    | (Reservation & {
        trip: Trip & { line: Line };
      })
    | null;
};

export interface SafePaymentWithReservationDto extends SafePaymentDto {
  reservation: SafeReservationMinimalDto | null;
}

export function serializePaymentWithReservation(
  payment: PaymentWithReservation
): SafePaymentWithReservationDto {
  return {
    ...serializeSafePayment(payment)!,
    reservation: payment.reservation
      ? serializeReservationMinimal(payment.reservation)
      : null,
  };
}
