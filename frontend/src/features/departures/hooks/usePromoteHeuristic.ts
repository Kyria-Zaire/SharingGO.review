import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { promoteHeuristicIncident } from "@/api/admin-incidents.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";
import { INCIDENTS_UPDATED_EVENT } from "@/features/incidents/constants/incidents-config";
import type { AdminIncident, HeuristicKind } from "@/types/incidents.types";

const DUPLICATE_MESSAGE = "Un incident existe déjà pour cette anomalie.";

const PROMOTED_INCIDENTS_QUERY_KEY = {
  source: "DEPARTURE_HEURISTIC" as const,
  status: "OPEN" as const,
  limit: 100,
  offset: 0,
};

function patchPromotedIncidentsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  incident: AdminIncident
) {
  queryClient.setQueryData(
    queryKeys.incidents.list(PROMOTED_INCIDENTS_QUERY_KEY),
    (old: { incidents: AdminIncident[]; limit: number; offset: number } | undefined) => {
      if (!old) return old;
      if (old.incidents.some((row) => row.id === incident.id)) return old;
      return { ...old, incidents: [...old.incidents, incident] };
    }
  );
}

export function usePromoteHeuristic() {
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.activity.feed({}) });
    window.dispatchEvent(new CustomEvent(INCIDENTS_UPDATED_EVENT));
  }, [queryClient]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3_500);
  }, []);

  const mutation = useMutation({
    mutationFn: ({
      relatedTripId,
      heuristicKind,
    }: {
      relatedTripId: string;
      heuristicKind: HeuristicKind;
    }) => promoteHeuristicIncident({ relatedTripId, heuristicKind }),
    onSuccess: async (incident) => {
      patchPromotedIncidentsCache(queryClient, incident);
      await invalidate();
      setDuplicateMessage(null);
      showToast(`Incident ${incident.code} créé`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "INCIDENT_DUPLICATE") {
        setDuplicateMessage(DUPLICATE_MESSAGE);
        return;
      }
      setDuplicateMessage(null);
      showToast(
        error instanceof ApiError ? error.message : "Impossible de promouvoir l'incident."
      );
    },
  });

  const dismissToast = useCallback(() => setToastMessage(null), []);
  const clearDuplicateMessage = useCallback(() => setDuplicateMessage(null), []);

  return {
    promote: mutation.mutateAsync,
    isPromoting: mutation.isPending,
    toastMessage,
    duplicateMessage,
    dismissToast,
    clearDuplicateMessage,
  };
}
