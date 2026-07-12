import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { creditAdminReservation, refundAdminReservation } from "@/api/admin-reservations.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";
import type { RefundActionKind, RefundActionResult } from "@/types/reservations.types";

const TOAST_DURATION_MS = 3_500;

const SUCCESS_MESSAGES: Record<RefundActionKind, string> = {
  refund: "Remboursement Stripe déclenché",
  credit: "Avoir créé pour le passager",
};

const GENERIC_ERROR_MESSAGE = "Une erreur est survenue. Réessayez.";

/**
 * Owns the refund-queue mutations (refund / credit) and the toast feedback.
 * The front only translates the backend's guard: a 409 (`REFUND_NOT_PENDING`) means the
 * reservation was already processed by another action — no protection logic lives here.
 */
export function useRefundQueueActions() {
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  }, []);

  const dismissToast = useCallback(() => setToastMessage(null), []);

  const refundMutation = useMutation({ mutationFn: refundAdminReservation });
  const creditMutation = useMutation({ mutationFn: creditAdminReservation });

  const refreshQueue = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.reservations.all }),
    [queryClient]
  );

  const confirmAction = useCallback(
    async (id: string, kind: RefundActionKind): Promise<RefundActionResult> => {
      try {
        if (kind === "refund") {
          await refundMutation.mutateAsync(id);
        } else {
          await creditMutation.mutateAsync(id);
        }
        await refreshQueue();
        showToast(SUCCESS_MESSAGES[kind]);
        return { ok: true };
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          return { ok: false, conflict: true };
        }
        showToast(err instanceof ApiError ? err.message : GENERIC_ERROR_MESSAGE);
        return { ok: false, conflict: false };
      }
    },
    [refundMutation, creditMutation, refreshQueue, showToast]
  );

  return {
    confirmAction,
    refreshQueue,
    toastMessage,
    dismissToast,
  };
}
