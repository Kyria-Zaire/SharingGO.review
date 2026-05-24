import { Wifi, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { OfflineProbeResult } from "@/types/system.types";
import { HealthStatusBadge } from "./HealthStatusBadge";

interface OfflineModeCardProps {
  probe: OfflineProbeResult;
}

export function OfflineModeCard({ probe }: OfflineModeCardProps) {
  const data = probe.data;

  return (
    <Card className="border-border">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Boarding offline manifest</h3>
        </div>
        <HealthStatusBadge status={probe.status} size="sm" />
      </div>

      {!data ? (
        <p className="text-sm text-muted-foreground">
          Manifest indisponible (UNKNOWN) — impossible de confirmer le mode offline.
        </p>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="font-medium text-foreground">
              Mode recommandé : {data.serverValidation.recommendedMode}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.serverValidation.validateEndpoint} · {data.serverValidation.consumeEndpoint}
            </p>
          </div>
          <div className="flex gap-2 rounded-md border border-border bg-muted/20 p-3">
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="font-medium text-foreground">
                Offline V1 : {data.offlineValidation.supported ? "supporté" : "non supporté"}
              </p>
              <p className="mt-1 text-muted-foreground">
                {data.offlineValidation.currentAlgorithm} → cible{" "}
                {data.offlineValidation.targetAlgorithms.join(", ")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{data.offlineValidation.reason}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
