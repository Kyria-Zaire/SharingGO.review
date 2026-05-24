import { useCallback, useEffect, useState } from "react";
import { generateNextIncidentCode } from "@/features/incidents/utils/incident-code-generator";
import {
  loadIncidentsFromStorage,
  saveIncidentsToStorage,
} from "@/features/incidents/storage/incidents-storage";
import type {
  CreateOperationalIncidentInput,
  OperationalIncident,
} from "@/types/incidents.types";

function createId(): string {
  return crypto.randomUUID();
}

export function useOperationalIncidents() {
  const [incidents, setIncidents] = useState<OperationalIncident[]>(() => loadIncidentsFromStorage());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const persist = useCallback((next: OperationalIncident[]) => {
    saveIncidentsToStorage(next);
    setIncidents(next);
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3_500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const createIncident = useCallback(
    (input: CreateOperationalIncidentInput): OperationalIncident => {
      const incidentCode = generateNextIncidentCode(incidents);
      const incident: OperationalIncident = {
        id: createId(),
        incidentCode,
        severity: input.severity,
        status: "open",
        category: input.category,
        title: input.title.trim(),
        description: input.description?.trim() || undefined,
        relatedTripId: input.relatedTripId?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      const next = [incident, ...incidents];
      persist(next);
      showToast(`Incident ${incidentCode} créé`);
      return incident;
    },
    [incidents, persist, showToast]
  );

  const resolveIncident = useCallback(
    (incidentId: string) => {
      const next = incidents.map((incident) =>
        incident.id === incidentId && incident.status === "open"
          ? { ...incident, status: "resolved" as const, resolvedAt: new Date().toISOString() }
          : incident
      );
      persist(next);
    },
    [incidents, persist]
  );

  const clearResolvedIncidents = useCallback(() => {
    const next = incidents.filter((incident) => incident.status !== "resolved");
    persist(next);
  }, [incidents, persist]);

  const openCount = incidents.filter((incident) => incident.status === "open").length;

  return {
    incidents,
    openCount,
    toastMessage,
    dismissToast: () => setToastMessage(null),
    createIncident,
    resolveIncident,
    clearResolvedIncidents,
  };
}
