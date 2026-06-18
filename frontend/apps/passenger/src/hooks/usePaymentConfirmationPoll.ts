import { useEffect, useState } from "react";
import { listPayments } from "@/api/payments.api";
import { listUserReservations } from "@/api/reservations.api";
import type { LastCheckoutContext } from "@/lib/checkout-session-storage";

const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_DURATION_MS = 60_000;

export type PaymentConfirmationState = "confirming" | "confirmed" | "timeout";

export interface PaymentConfirmationResult {
  state: PaymentConfirmationState;
  reservationId: string | null;
}

function isConfirmedForTrip(
  checkout: LastCheckoutContext,
  reservation: { status: string; trip: { id: string }; createdAt?: string }
): boolean {
  if (reservation.status !== "CONFIRMED" || reservation.trip.id !== checkout.tripId) {
    return false;
  }
  if (!checkout.startedAt || !reservation.createdAt) {
    return true;
  }
  return new Date(reservation.createdAt).getTime() >= new Date(checkout.startedAt).getTime() - 5_000;
}

async function findConfirmedReservation(
  checkout: LastCheckoutContext
): Promise<string | null> {
  const [paymentsResult, reservationsResult] = await Promise.all([
    listPayments({ type: "TICKET", limit: 20 }),
    listUserReservations({ limit: 20 }),
  ]);

  for (const payment of paymentsResult.payments) {
    if (payment.status !== "SUCCEEDED" || !payment.reservation) continue;
    if (!isConfirmedForTrip(checkout, payment.reservation)) continue;
    if (
      new Date(payment.createdAt).getTime() <
      new Date(checkout.startedAt).getTime() - 5_000
    ) {
      continue;
    }
    return payment.reservation.id;
  }

  for (const reservation of reservationsResult.reservations) {
    if (isConfirmedForTrip(checkout, reservation)) {
      return reservation.id;
    }
  }

  return null;
}

export function usePaymentConfirmationPoll(
  checkout: LastCheckoutContext | null
): PaymentConfirmationResult {
  const [state, setState] = useState<PaymentConfirmationState>("confirming");
  const [reservationId, setReservationId] = useState<string | null>(null);

  useEffect(() => {
    if (!checkout?.tripId) {
      setState("timeout");
      return;
    }

    let cancelled = false;
    const startedAt = Date.now();

    const poll = async () => {
      try {
        const confirmedId = await findConfirmedReservation(checkout);
        if (cancelled) return;
        if (confirmedId) {
          setReservationId(confirmedId);
          setState("confirmed");
          return;
        }
      } catch {
        // Keep polling — transient network errors should not abort confirmation UX.
      }

      if (cancelled) return;
      if (Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
        setState("timeout");
        return;
      }

      window.setTimeout(() => void poll(), POLL_INTERVAL_MS);
    };

    void poll();

    return () => {
      cancelled = true;
    };
  }, [checkout]);

  return { state, reservationId };
}
