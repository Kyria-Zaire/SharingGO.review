import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { createPendingReservation } from "@/api/reservations.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";
import { USER_MESSAGES } from "@/lib/user-facing-errors";
import type { ReservationApiErrorCode } from "@/types/reservations";
import { ROUTES } from "@/types/routes";

function getCreatePendingErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (error instanceof ApiError) {
    const code = error.code as ReservationApiErrorCode;
    switch (code) {
      case "TRIP_FULL":
        return "Ce trajet est complet. Choisissez un autre départ.";
      case "TRIP_PAST":
        return "Ce trajet est déjà passé.";
      case "PENDING_ALREADY_EXISTS":
        return "Vous avez déjà une place verrouillée sur ce trajet. Finalisez ou libérez votre réservation en cours.";
      case "TRIP_DISABLED":
        return "Ce trajet n'est plus disponible.";
      case "RATE_LIMITED_RESERVATION":
        return "Trop de tentatives. Patientez un instant avant de réessayer.";
      default:
        return USER_MESSAGES.generic;
    }
  }

  if (error instanceof Error) {
    return USER_MESSAGES.generic;
  }

  return "Impossible de réserver votre place. Réessayez.";
}

export function useCreatePendingReservation() {
  const navigate = useNavigate();
  const location = useLocation();

  const mutation = useMutation({
    mutationKey: queryKeys.reservations.createPending,
    mutationFn: createPendingReservation,
    onSuccess: (data) => {
      navigate(ROUTES.pendingBooking(data.pendingReservationId), { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        navigate(ROUTES.login, { state: { from: location.pathname }, replace: true });
      }
    },
  });

  return {
    createPending: mutation.mutate,
    createPendingAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    errorMessage: getCreatePendingErrorMessage(mutation.error),
    reset: mutation.reset,
  };
}
