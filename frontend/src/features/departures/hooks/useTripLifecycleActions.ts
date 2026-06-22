import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  cancelAdminTrip,
  completeAdminTrip,
  departAdminTrip,
  startBoardingAdminTrip,
} from "@/api/admin-trips.api";
import { ApiError } from "@/api/http";
import { getTripLifecycleErrorMessage } from "@/features/departures/utils/trip-lifecycle-errors";

type LifecycleMutationAction = "start-boarding" | "depart" | "complete" | "cancel";

interface LifecycleMutationInput {
  tripId: string;
  action: LifecycleMutationAction;
  reason?: string;
}

export function useTripLifecycleActions(onChanged?: () => Promise<void> | void) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3_500);
  }, []);

  const mutation = useMutation({
    mutationFn: async ({ tripId, action, reason }: LifecycleMutationInput) => {
      switch (action) {
        case "start-boarding":
          return startBoardingAdminTrip(tripId);
        case "depart":
          return departAdminTrip(tripId);
        case "complete":
          return completeAdminTrip(tripId);
        case "cancel":
          if (!reason || reason.trim().length < 10) {
            throw new Error("La raison d'annulation doit contenir au moins 10 caractères.");
          }
          return cancelAdminTrip(tripId, { reason: reason.trim() });
        default:
          throw new Error("Action lifecycle inconnue.");
      }
    },
    onSuccess: async (_data, variables) => {
      if (onChanged) {
        await onChanged();
      }
      const successByAction: Record<LifecycleMutationAction, string> = {
        "start-boarding": "Embarquement démarré",
        depart: "Départ enregistré",
        complete: "Trajet marqué terminé",
        cancel: "Trajet annulé",
      };
      showToast(successByAction[variables.action]);
    },
    onError: async (error) => {
      const message = getTripLifecycleErrorMessage(error);
      showToast(message);
      if (error instanceof ApiError && (error.code === "INVALID_LIFECYCLE_TRANSITION" || error.status === 409)) {
        if (onChanged) {
          await onChanged();
        }
      }
    },
  });

  const dismissToast = useCallback(() => setToastMessage(null), []);

  return {
    runLifecycleAction: mutation.mutateAsync,
    isLifecyclePending: mutation.isPending,
    toastMessage,
    dismissToast,
  };
}
