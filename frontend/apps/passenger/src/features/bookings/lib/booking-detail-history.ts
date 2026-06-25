import { formatDate } from "@/lib/format-date";
import type { UserReservationDetail } from "@/types/reservations";

export type BookingHistoryStepVariant = "success" | "failure";

export interface BookingHistoryStep {
  id: string;
  label: string;
  timestamp: string;
  variant: BookingHistoryStepVariant;
}

function pushPaymentStep(
  steps: BookingHistoryStep[],
  reservation: UserReservationDetail
): void {
  const { payment } = reservation;
  if (!payment) {
    return;
  }

  if (payment.status === "SUCCEEDED") {
    steps.push({
      id: "paid",
      label: "Paiement effectué",
      timestamp: payment.createdAt,
      variant: "success",
    });
    return;
  }

  if (payment.status === "PENDING") {
    steps.push({
      id: "payment-pending",
      label: "Paiement en attente",
      timestamp: payment.createdAt,
      variant: "success",
    });
  }
}

/** Timeline adaptative selon le statut réservation (WEB-BOOKING-DETAIL-01). */
export function buildBookingHistorySteps(
  reservation: UserReservationDetail
): BookingHistoryStep[] {
  const { status, createdAt, updatedAt, trip, payment } = reservation;

  const steps: BookingHistoryStep[] = [
    {
      id: "created",
      label: "Réservation créée",
      timestamp: createdAt,
      variant: "success",
    },
  ];

  pushPaymentStep(steps, reservation);

  if (status === "CONFIRMED") {
    steps.push({
      id: "confirmed",
      label: "Réservation confirmée",
      timestamp: payment?.createdAt ?? updatedAt,
      variant: "success",
    });
  }

  if (status === "USED") {
    steps.push({
      id: "confirmed",
      label: "Réservation confirmée",
      timestamp: payment?.createdAt ?? createdAt,
      variant: "success",
    });
    steps.push({
      id: "boarding",
      label: "Embarquement validé",
      timestamp: trip.departureTime,
      variant: "success",
    });
    steps.push({
      id: "completed",
      label: "Trajet terminé",
      timestamp: trip.arrivalTime ?? updatedAt,
      variant: "success",
    });
  }

  if (status === "CANCELED") {
    steps.push({
      id: "canceled",
      label: "Réservation annulée",
      timestamp: updatedAt,
      variant: "failure",
    });
  }

  if (status === "PENDING" && !payment) {
    steps.push({
      id: "pending",
      label: "Réservation en attente",
      timestamp: updatedAt,
      variant: "success",
    });
  }

  return steps;
}

export function formatHistoryStepDate(value: string): string {
  return formatDate(value, "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
