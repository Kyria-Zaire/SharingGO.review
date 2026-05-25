import {
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "@prisma/client";
import type { ImportLocalIncidentsBody } from "./admin-incidents.schemas.js";

type LocalCategory = ImportLocalIncidentsBody["incidents"][number]["category"];
type LocalSeverity = ImportLocalIncidentsBody["incidents"][number]["severity"];
type LocalStatus = ImportLocalIncidentsBody["incidents"][number]["status"];

export function mapLocalCategoryToType(category: LocalCategory): IncidentType {
  switch (category) {
    case "departure":
      return IncidentType.DELAY;
    case "boarding":
    case "capacity":
      return IncidentType.BEHAVIOR;
    case "system":
    case "payment":
      return IncidentType.TECHNICAL;
    default:
      return IncidentType.OTHER;
  }
}

export function mapLocalSeverityToDb(severity: LocalSeverity): IncidentSeverity {
  switch (severity) {
    case "info":
      return IncidentSeverity.LOW;
    case "warning":
      return IncidentSeverity.MEDIUM;
    case "critical":
      return IncidentSeverity.CRITICAL;
  }
}

export function mapLocalStatusToDb(status: LocalStatus): IncidentStatus {
  return status === "resolved" ? IncidentStatus.RESOLVED : IncidentStatus.OPEN;
}

export function mapDbSeverityToFeed(
  severity: IncidentSeverity
): "info" | "warning" | "critical" {
  switch (severity) {
    case IncidentSeverity.LOW:
      return "info";
    case IncidentSeverity.MEDIUM:
    case IncidentSeverity.HIGH:
      return "warning";
    case IncidentSeverity.CRITICAL:
      return "critical";
    default:
      return "info";
  }
}
