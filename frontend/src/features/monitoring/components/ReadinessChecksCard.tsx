import { Card } from "@/components/ui/Card";
import { mapDependencyCheck } from "@/api/system.api";
import type { MonitoringStatus, ReadinessCheckRow, ReadinessProbeResult } from "@/types/system.types";
import { HealthStatusBadge } from "./HealthStatusBadge";

interface ReadinessChecksCardProps {
  probe: ReadinessProbeResult;
  offlineStatus: MonitoringStatus;
}

function buildCheckRows(probe: ReadinessProbeResult, offlineStatus: MonitoringStatus): ReadinessCheckRow[] {
  const checks = probe.data?.checks;

  const rows: ReadinessCheckRow[] = [
    {
      id: "api-ready",
      label: "API READY",
      status: probe.status,
      detail:
        probe.data?.status === "ready"
          ? "Prêt à servir du trafic"
          : probe.data?.status === "not_ready"
            ? "NOT READY — dépendances en échec"
            : undefined,
    },
    {
      id: "database",
      label: "Database",
      status: mapDependencyCheck(checks?.database?.status),
    },
    {
      id: "configuration",
      label: "Configuration",
      status: mapDependencyCheck(checks?.configuration?.status),
    },
    {
      id: "stripe",
      label: "Stripe",
      status: mapDependencyCheck(checks?.stripe?.status),
      detail: "Présence locale config uniquement (pas d’appel réseau)",
    },
    {
      id: "offline",
      label: "Offline mode",
      status: offlineStatus,
      detail: "Manifest boarding offline-capabilities",
    },
  ];

  return rows;
}

export function ReadinessChecksCard({ probe, offlineStatus }: ReadinessChecksCardProps) {
  const rows = buildCheckRows(probe, offlineStatus);
  const isPrimaryReady = probe.status;

  return (
    <Card className="border-primary/40 bg-primary/5 shadow-sm shadow-primary/10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Indicateur principal
          </p>
          <h2 className="text-xl font-bold text-foreground">Readiness — exploitation</h2>
        </div>
        <HealthStatusBadge status={isPrimaryReady} size="lg" />
      </div>

      {probe.data ? (
        <p className="mb-4 text-sm text-muted-foreground">
          {probe.data.service} · {probe.data.environment} · HTTP {probe.httpStatus ?? "—"}
        </p>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">
          Sonde /ready inaccessible — état UNKNOWN (timeout, réseau ou réponse invalide).
        </p>
      )}

      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li
            key={row.id}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background/60 px-4 py-3 ${
              index === 0 ? "border-primary/30" : ""
            }`}
          >
            <div>
              <p className={`font-medium text-foreground ${index === 0 ? "text-base" : "text-sm"}`}>
                {row.label}
              </p>
              {row.detail ? (
                <p className="text-xs text-muted-foreground">{row.detail}</p>
              ) : null}
            </div>
            <HealthStatusBadge status={row.status} size={index === 0 ? "md" : "sm"} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
