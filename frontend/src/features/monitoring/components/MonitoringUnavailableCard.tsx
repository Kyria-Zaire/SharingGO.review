import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface MonitoringUnavailableCardProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function MonitoringUnavailableCard({
  onRetry,
  isRetrying,
}: MonitoringUnavailableCardProps) {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Monitoring unavailable</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Impossible de joindre les sondes /health et /ready. L’API est peut-être arrêtée ou
              inaccessible — consultez les runbooks ci-dessous.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={onRetry} isLoading={isRetrying}>
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      </div>
    </Card>
  );
}
