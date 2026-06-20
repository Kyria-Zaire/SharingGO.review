import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  closeAdminIncident,
  createAdminIncident,
  importLocalIncidents,
  listAdminIncidents,
  patchAdminIncident,
} from "@/api/admin-incidents.api";
import { queryKeys } from "@/constants/query-keys";
import type {
  AdminIncidentFilters,
  CreateAdminIncidentBody,
  ImportLocalIncidentPayload,
} from "@/types/incidents.types";

const INCIDENTS_STALE_MS = 15_000;

export function useIncidentsList(filters: AdminIncidentFilters = { limit: 100, offset: 0 }) {
  const filterKey = { ...filters };
  return useQuery({
    queryKey: queryKeys.incidents.list(filterKey),
    queryFn: () => listAdminIncidents(filters),
    staleTime: INCIDENTS_STALE_MS,
  });
}

export function useIncidentsOperations() {
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.activity.feed({}) });
    window.dispatchEvent(new CustomEvent("sharinggo:incidents-updated"));
  }, [queryClient]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3_500);
  }, []);

  const createMutation = useMutation({
    mutationFn: createAdminIncident,
    onSuccess: async (incident) => {
      await invalidate();
      showToast(`Incident ${incident.code} créé`);
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ incidentId, resolution }: { incidentId: string; resolution: string }) =>
      patchAdminIncident(incidentId, { status: "RESOLVED", resolution }),
    onSuccess: async (incident) => {
      await invalidate();
      showToast(`Incident ${incident.code} résolu`);
    },
  });

  const closeResolvedMutation = useMutation({
    mutationFn: async (resolvedIds: string[]) => {
      await Promise.all(resolvedIds.map((id) => closeAdminIncident(id)));
    },
    onSuccess: async () => {
      await invalidate();
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({
      incidentId,
      assignedToUserId,
    }: {
      incidentId: string;
      assignedToUserId: string | null;
    }) => patchAdminIncident(incidentId, { assignedToUserId }),
    onSuccess: async (incident) => {
      await invalidate();
      showToast(`Incident ${incident.code} affecté`);
    },
  });

  const importMutation = useMutation({
    mutationFn: (payload: ImportLocalIncidentPayload[]) => importLocalIncidents(payload),
    onSuccess: async (result) => {
      await invalidate();
      showToast(`${result.count} incident(s) importé(s)`);
    },
  });

  const createIncident = useCallback(
    (body: CreateAdminIncidentBody) => createMutation.mutateAsync(body),
    [createMutation]
  );

  const resolveIncident = useCallback(
    (incidentId: string, resolution: string) =>
      resolveMutation.mutateAsync({ incidentId, resolution }),
    [resolveMutation]
  );

  const clearResolvedIncidents = useCallback(
    (resolvedIds: string[]) => closeResolvedMutation.mutateAsync(resolvedIds),
    [closeResolvedMutation]
  );

  const assignIncident = useCallback(
    (incidentId: string, assignedToUserId: string | null) =>
      assignMutation.mutateAsync({ incidentId, assignedToUserId }),
    [assignMutation]
  );

  const importLocal = useCallback(
    (payload: ImportLocalIncidentPayload[]) => importMutation.mutateAsync(payload),
    [importMutation]
  );

  return {
    toastMessage,
    dismissToast: () => setToastMessage(null),
    createIncident,
    resolveIncident,
    assignIncident,
    clearResolvedIncidents,
    importLocal,
    isCreating: createMutation.isPending,
    isResolving: resolveMutation.isPending,
    isAssigning: assignMutation.isPending,
    resolveError: resolveMutation.error,
    isImporting: importMutation.isPending,
  };
}
