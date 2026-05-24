import type { OfflineCapabilitiesResponse } from "@/types/boarding.types";

/** Extensible for future partial degradation (e.g. Stripe slow but up). */
export type MonitoringStatus = "ok" | "warning" | "error" | "unknown" | "degraded";

export interface HealthResponse {
  status: "ok";
  service: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  version: string;
}

export type DependencyCheckStatus = "ok" | "error";

export interface ReadinessCheck {
  status: DependencyCheckStatus;
}

export interface ReadinessChecks {
  database: ReadinessCheck;
  configuration: ReadinessCheck;
  stripe: ReadinessCheck;
}

export type ReadinessApiStatus = "ready" | "not_ready";

export interface ReadinessResponse {
  status: ReadinessApiStatus;
  service: string;
  environment: string;
  timestamp: string;
  checks: ReadinessChecks;
}

export interface HealthProbeResult {
  status: MonitoringStatus;
  data: HealthResponse | null;
  httpStatus: number | null;
}

export interface ReadinessProbeResult {
  status: MonitoringStatus;
  data: ReadinessResponse | null;
  httpStatus: number | null;
}

export interface OfflineProbeResult {
  status: MonitoringStatus;
  data: OfflineCapabilitiesResponse | null;
}

export interface MonitoringSnapshot {
  health: HealthProbeResult;
  readiness: ReadinessProbeResult;
  offline: OfflineProbeResult;
  fetchedAt: string;
}

export interface ReadinessCheckRow {
  id: string;
  label: string;
  status: MonitoringStatus;
  detail?: string;
}
