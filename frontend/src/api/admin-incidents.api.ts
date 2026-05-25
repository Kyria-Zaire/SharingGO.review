import { buildQuery } from "@/lib/build-query";
import type {
  AdminIncident,
  AdminIncidentFilters,
  AdminIncidentListResponse,
  CreateAdminIncidentBody,
  ImportLocalIncidentPayload,
  ImportLocalIncidentsResponse,
  PatchAdminIncidentBody,
} from "@/types/incidents.types";
import { http } from "./http";

export async function listAdminIncidents(
  filters: AdminIncidentFilters = {}
): Promise<AdminIncidentListResponse> {
  const query = buildQuery({
    status: filters.status,
    type: filters.type,
    severity: filters.severity,
    from: filters.from,
    to: filters.to,
    limit: filters.limit !== undefined ? String(filters.limit) : undefined,
    offset: filters.offset !== undefined ? String(filters.offset) : undefined,
  });
  return http<AdminIncidentListResponse>(`/api/admin/incidents${query}`);
}

export async function getAdminIncident(incidentId: string): Promise<AdminIncident> {
  return http<AdminIncident>(`/api/admin/incidents/${incidentId}`);
}

export async function createAdminIncident(body: CreateAdminIncidentBody): Promise<AdminIncident> {
  return http<AdminIncident>("/api/admin/incidents", { method: "POST", body });
}

export async function patchAdminIncident(
  incidentId: string,
  body: PatchAdminIncidentBody
): Promise<AdminIncident> {
  return http<AdminIncident>(`/api/admin/incidents/${incidentId}`, {
    method: "PATCH",
    body,
  });
}

export async function closeAdminIncident(incidentId: string): Promise<AdminIncident> {
  return http<AdminIncident>(`/api/admin/incidents/${incidentId}`, { method: "DELETE" });
}

export async function importLocalIncidents(
  incidents: ImportLocalIncidentPayload[]
): Promise<ImportLocalIncidentsResponse> {
  return http<ImportLocalIncidentsResponse>("/api/admin/incidents/import-local", {
    method: "POST",
    body: { incidents },
  });
}
