import { http } from "./http";
import type {
  CreateFieldIncidentBody,
  FieldIncidentResponse,
} from "@/types/boarding-field-incident.types";

export async function createFieldIncident(
  body: CreateFieldIncidentBody
): Promise<FieldIncidentResponse> {
  return http<FieldIncidentResponse>("/api/boarding/field-incidents", {
    method: "POST",
    body,
  });
}
