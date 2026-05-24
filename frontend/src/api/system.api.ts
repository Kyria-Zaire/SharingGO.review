import { env } from "@/lib/env";
import { getBoardingOfflineCapabilities } from "@/api/admin-boarding.api";
import type {
  HealthProbeResult,
  HealthResponse,
  MonitoringSnapshot,
  MonitoringStatus,
  OfflineProbeResult,
  ReadinessProbeResult,
  ReadinessResponse,
} from "@/types/system.types";

const MONITORING_TIMEOUT_MS = 8_000;

interface FetchJsonResult {
  ok: boolean;
  httpStatus: number;
  data: unknown;
  timedOut: boolean;
}

async function fetchJsonWithTimeout(path: string): Promise<FetchJsonResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MONITORING_TIMEOUT_MS);

  try {
    const response = await fetch(`${env.apiUrl}${path}`, {
      signal: controller.signal,
      credentials: "include",
    });
    const data: unknown = await response.json().catch(() => null);
    return { ok: true, httpStatus: response.status, data, timedOut: false };
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    return { ok: false, httpStatus: 0, data: null, timedOut };
  } finally {
    clearTimeout(timeoutId);
  }
}

function isHealthResponse(data: unknown): data is HealthResponse {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return record.status === "ok" && typeof record.service === "string";
}

function isReadinessResponse(data: unknown): data is ReadinessResponse {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  return (
    (record.status === "ready" || record.status === "not_ready") &&
    record.checks !== null &&
    typeof record.checks === "object"
  );
}

function dependencyToMonitoring(status: string | undefined): MonitoringStatus {
  if (status === "ok") return "ok";
  if (status === "error") return "error";
  return "unknown";
}

export async function fetchHealthProbe(): Promise<HealthProbeResult> {
  const result = await fetchJsonWithTimeout("/health");

  if (!result.ok || !isHealthResponse(result.data)) {
    return { status: "unknown", data: null, httpStatus: result.httpStatus || null };
  }

  if (result.httpStatus !== 200) {
    return { status: "unknown", data: null, httpStatus: result.httpStatus };
  }

  return { status: "ok", data: result.data, httpStatus: result.httpStatus };
}

export async function fetchReadinessProbe(): Promise<ReadinessProbeResult> {
  const result = await fetchJsonWithTimeout("/ready");

  if (!result.ok || !isReadinessResponse(result.data)) {
    return { status: "unknown", data: null, httpStatus: result.httpStatus || null };
  }

  const overall: MonitoringStatus =
    result.data.status === "ready" ? "ok" : result.data.status === "not_ready" ? "error" : "unknown";

  return {
    status: overall,
    data: result.data,
    httpStatus: result.httpStatus,
  };
}

export async function fetchOfflineProbe(): Promise<OfflineProbeResult> {
  try {
    const data = await getBoardingOfflineCapabilities();
    return { status: "ok", data };
  } catch {
    return { status: "unknown", data: null };
  }
}

export function mapDependencyCheck(status: string | undefined): MonitoringStatus {
  return dependencyToMonitoring(status);
}

export async function fetchMonitoringSnapshot(): Promise<MonitoringSnapshot> {
  const [health, readiness, offline] = await Promise.all([
    fetchHealthProbe(),
    fetchReadinessProbe(),
    fetchOfflineProbe(),
  ]);

  return {
    health,
    readiness,
    offline,
    fetchedAt: new Date().toISOString(),
  };
}

export { MONITORING_TIMEOUT_MS };
