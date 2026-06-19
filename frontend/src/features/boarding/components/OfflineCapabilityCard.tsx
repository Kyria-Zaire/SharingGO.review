import { Wifi, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import type { OfflineCapabilitiesResponse } from "@/types/boarding.types";

interface OfflineCapabilityCardProps {
  data: OfflineCapabilitiesResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function OfflineCapabilityCard({
  data,
  isLoading,
  isError,
  onRetry,
}: OfflineCapabilityCardProps) {
  return (
    <Card className="min-w-0 border-border p-4 sm:p-6">
      <div className="mb-3 flex items-start gap-2">
        <Wifi className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
          Capacités offline & serveur
        </h3>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Chargement du manifest…</p> : null}

      {isError ? (
        <ErrorState
          message="Impossible de charger le manifest offline"
          onRetry={onRetry}
          className="py-6"
        />
      ) : null}

      {data ? (
        <div className="space-y-4 text-sm">
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="font-medium text-foreground">
              Mode recommandé : {data.serverValidation.recommendedMode}
            </p>
            <p className="mt-1 break-all text-xs text-muted-foreground sm:text-sm">
              Endpoints : {data.serverValidation.validateEndpoint} ·{" "}
              {data.serverValidation.consumeEndpoint}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-border bg-muted/20 p-3">
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div className="min-w-0">
              <p className="font-medium text-foreground">
                Offline cryptographique :{" "}
                {data.offlineValidation.supported ? "supporté" : "non supporté (V1)"}
              </p>
              <p className="mt-1 break-words text-muted-foreground">
                Algorithme actuel {data.offlineValidation.currentAlgorithm} — cible future{" "}
                {data.offlineValidation.targetAlgorithms.join(", ")}.
              </p>
              <p className="mt-1 break-words text-xs text-muted-foreground">
                {data.offlineValidation.reason} — vérification signature offline impossible sans
                clé asymétrique.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
