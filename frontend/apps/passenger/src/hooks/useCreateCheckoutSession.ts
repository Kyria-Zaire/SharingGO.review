import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { createCheckoutSession } from "@/api/payments.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";
import { saveLastCheckout } from "@/lib/checkout-session-storage";
import { USER_MESSAGES } from "@/lib/user-facing-errors";
import type { PaymentApiErrorCode } from "@/types/payments";
import { ROUTES } from "@/types/routes";

export interface CreateCheckoutInput {
  pendingReservationId: string;
  tripId: string;
}

function getCheckoutErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (error instanceof ApiError) {
    const code = error.code as PaymentApiErrorCode;
    switch (code) {
      case "PENDING_EXPIRED":
        return "Le délai de 2 minutes est écoulé. Votre place a été libérée.";
      case "PENDING_NOT_FOUND":
        return "Cette réservation temporaire est introuvable ou déjà finalisée.";
      case "PENDING_ALREADY_CONSUMED":
        return "Ce verrouillage a déjà été utilisé pour un paiement.";
      case "FORBIDDEN":
        return "Vous n'avez pas accès à cette réservation.";
      case "TRIP_FULL":
        return "Ce trajet est complet. Votre place n'a pas pu être conservée.";
      case "TRIP_PAST":
        return "Ce trajet est déjà passé.";
      case "TRIP_DISABLED":
        return "Ce trajet n'est plus disponible.";
      case "RATE_LIMITED_CHECKOUT":
        return "Trop de tentatives de paiement. Patientez un instant.";
      case "CHECKOUT_CREATE_FAILED":
        return "Impossible d'ouvrir la page de paiement. Réessayez.";
      default:
        return USER_MESSAGES.generic;
    }
  }

  if (error instanceof Error) {
    return USER_MESSAGES.generic;
  }

  return "Impossible de démarrer le paiement. Réessayez.";
}

export function useCreateCheckoutSession() {
  const navigate = useNavigate();
  const location = useLocation();

  const mutation = useMutation({
    mutationKey: queryKeys.payments.createCheckout,
    mutationFn: ({ pendingReservationId }: CreateCheckoutInput) =>
      createCheckoutSession(pendingReservationId),
    onSuccess: (data, variables) => {
      saveLastCheckout({
        pendingReservationId: variables.pendingReservationId,
        stripeCheckoutSessionId: data.stripeCheckoutSessionId,
        tripId: variables.tripId,
        startedAt: new Date().toISOString(),
      });
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        navigate(ROUTES.login, { state: { from: location.pathname }, replace: true });
      }
    },
  });

  return {
    startCheckout: (input: CreateCheckoutInput) => mutation.mutate(input),
    isCheckoutPending: mutation.isPending,
    checkoutErrorMessage: getCheckoutErrorMessage(mutation.error),
    resetCheckout: mutation.reset,
  };
}
