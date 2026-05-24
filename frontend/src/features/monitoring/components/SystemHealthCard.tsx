import { Card } from "@/components/ui/Card";
import type { HealthProbeResult, HealthResponse } from "@/types/system.types";
import { HealthStatusBadge } from "./HealthStatusBadge";

interface SystemHealthCardProps {
  probe: HealthProbeResult;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function SystemHealthCard({ probe }: SystemHealthCardProps) {
  const data: HealthResponse | null = probe.data;

  return (
    <Card className="border-border">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">Liveness — API alive</h3>
        <HealthStatusBadge status={probe.status} size="sm" />
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Processus démarré uniquement — ne garantit pas l’exploitabilité (voir Readiness).
      </p>
      {data ? (
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Service</dt>
            <dd className="font-medium text-foreground">{data.service}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Version</dt>
            <dd className="font-mono text-foreground">{data.version}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Environment</dt>
            <dd className="font-medium text-foreground">{data.environment}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Uptime</dt>
            <dd className="font-medium text-foreground">{formatUptime(data.uptimeSeconds)}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">État liveness indéterminé (UNKNOWN).</p>
      )}
    </Card>
  );
}
